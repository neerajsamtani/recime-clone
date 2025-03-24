import logging
import os
import time
import urllib.parse
from decimal import Decimal

import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from pydantic import ValidationError

from config import config
from models import Recipe
from recipe_parser import RecipeParser

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def create_app(config_name="default"):
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    def fetch_webpage(url):
        try:
            # Send a GET request to the URL with timeout
            response = requests.get(
                url,
                timeout=app.config["REQUEST_TIMEOUT"],
            )
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            return soup
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            return None

    def extract_recipe_content(soup):
        try:
            main_content = (
                soup.find("meta", attrs={"name": "description"}).get("content")
                or soup.find("article")
                or soup.find("main")
                or soup.find("div", class_="content")
            )

            # Extract and decode image URL from og:image meta tag
            image_url = None
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                image_url = urllib.parse.unquote(og_image["content"])

            return main_content, image_url
        except Exception as e:
            logger.error(f"Error extracting recipe content: {str(e)}")
            return None, None

    @app.route("/scrape/<path:url>", methods=["GET"])
    def scrape_recipe(url):
        try:
            soup = fetch_webpage(url)
            if not soup:
                return jsonify({"error": "Failed to fetch webpage"}), 400

            recipe_content, image_url = extract_recipe_content(soup)
            if not recipe_content:
                return jsonify({"error": "No recipe content found"}), 404

            parser = RecipeParser(storage_type="dynamodb")
            recipes = parser.parse_recipes([recipe_content], [url], [image_url])

            if not recipes:
                return jsonify({"error": "Failed to parse recipe content"}), 400

            recipes_list = [recipe.model_dump() for recipe in recipes]
            return jsonify(recipes_list)
        except Exception as e:
            logger.error(f"Error processing recipe from {url}: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    @app.route("/recipes", methods=["GET"])
    def get_all_recipes():
        try:
            parser = RecipeParser(storage_type="dynamodb")
            # Scan the DynamoDB table to get all recipes
            response = parser.table.scan()
            recipes = response.get("Items", [])

            # Handle pagination if there are more items
            while "LastEvaluatedKey" in response:
                response = parser.table.scan(
                    ExclusiveStartKey=response["LastEvaluatedKey"]
                )
                recipes.extend(response.get("Items", []))

            return jsonify(recipes)
        except Exception as e:
            logger.error(f"Error fetching recipes: {str(e)}")
            return jsonify({"error": "Failed to fetch recipes"}), 500

    @app.route("/recipes/<recipe_id>", methods=["PUT"])
    def update_recipe(recipe_id):
        try:
            parser = RecipeParser(storage_type="dynamodb")
            recipe_data = request.json

            # Validate the recipe data using Pydantic model
            recipe = Recipe.model_validate(recipe_data)
            recipe.updated_at = int(time.time())  # Update timestamp

            # Update in DynamoDB
            parser.table.update_item(
                Key={"id": recipe_id},
                UpdateExpression="SET #name=:name, servings=:servings, calories=:calories, "
                + "fat=:fat, carbs=:carbs, protein=:protein, "
                + "ingredients=:ingredients, instructions=:instructions, "
                + "updated_at=:updated_at",
                ExpressionAttributeNames={
                    "#name": "name"
                },  # name is a reserved word in DynamoDB
                ExpressionAttributeValues={
                    ":name": recipe.name,
                    ":servings": recipe.servings,
                    ":calories": Decimal(str(recipe.calories)),  # Convert to Decimal
                    ":fat": (
                        {
                            "amount": Decimal(str(recipe.fat.amount)),
                            "unit": recipe.fat.unit,
                        }
                        if recipe.fat
                        else None
                    ),
                    ":carbs": (
                        {
                            "amount": Decimal(str(recipe.carbs.amount)),
                            "unit": recipe.carbs.unit,
                        }
                        if recipe.carbs
                        else None
                    ),
                    ":protein": (
                        {
                            "amount": Decimal(str(recipe.protein.amount)),
                            "unit": recipe.protein.unit,
                        }
                        if recipe.protein
                        else None
                    ),
                    ":ingredients": [
                        {
                            "name": i.name,
                            "quantity": Decimal(str(i.quantity)),
                            "unit": i.unit,
                        }
                        for i in recipe.ingredients
                    ],
                    ":instructions": recipe.instructions,
                    ":updated_at": recipe.updated_at,
                },
            )
            return jsonify(recipe.model_dump())
        except ValidationError as e:
            return jsonify({"error": "Invalid recipe data", "details": str(e)}), 400
        except Exception as e:
            logger.error(f"Error updating recipe {recipe_id}: {str(e)}")
            return jsonify({"error": "Failed to update recipe"}), 500

    @app.route("/recipes", methods=["POST"])
    def create_recipe():
        try:
            parser = RecipeParser(storage_type="dynamodb")
            recipe_data = request.json

            # Validate the recipe data using Pydantic model
            recipe = Recipe.model_validate(recipe_data)
            current_time = int(time.time())
            recipe.created_at = current_time
            recipe.updated_at = current_time

            # Generate recipe ID from URL if provided, otherwise use timestamp
            recipe_id = (
                parser._generate_recipe_id(recipe.url)
                if recipe.url
                else str(current_time)
            )

            # Save to DynamoDB
            recipe_dict = recipe.model_dump()
            recipe_dict["id"] = recipe_id
            parser.table.put_item(Item=recipe_dict)

            return jsonify(recipe_dict), 201
        except ValidationError as e:
            return jsonify({"error": "Invalid recipe data", "details": str(e)}), 400
        except Exception as e:
            logger.error(f"Error creating recipe: {str(e)}")
            return jsonify({"error": "Failed to create recipe"}), 500

    @app.route("/")
    def index():
        return jsonify(
            {"status": "healthy", "version": "1.0.0", "timestamp": time.time()}
        )

    @app.route("/health")
    def health_check():
        return jsonify({"status": "healthy"}), 200

    @app.route("/recipes/<recipe_id>", methods=["DELETE"])
    def delete_recipe(recipe_id):
        try:
            parser = RecipeParser(storage_type="dynamodb")
            # Delete the recipe from DynamoDB
            parser.table.delete_item(Key={"id": recipe_id})
            return jsonify({"message": "Recipe deleted successfully"}), 200
        except Exception as e:
            logger.error(f"Error deleting recipe {recipe_id}: {str(e)}")
            return jsonify({"error": "Failed to delete recipe"}), 500

    return app


if __name__ == "__main__":
    # Create the application with development configuration
    app = create_app(os.environ.get("FLASK_ENV", "development"))
    app.run(debug=app.config["DEBUG"])
