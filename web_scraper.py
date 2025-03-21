import logging
import os
import time

import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify

from config import config
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
            return main_content
        except Exception as e:
            logger.error(f"Error extracting recipe content: {str(e)}")
            return None

    @app.route("/scrape/<path:url>", methods=["GET"])
    def scrape_recipe(url):
        try:
            soup = fetch_webpage(url)
            if not soup:
                return jsonify({"error": "Failed to fetch webpage"}), 400

            recipe_content = extract_recipe_content(soup)
            if not recipe_content:
                return jsonify({"error": "No recipe content found"}), 404

            parser = RecipeParser(storage_type="dynamodb")
            recipes = parser.parse_recipes([recipe_content], [url])

            if not recipes:
                return jsonify({"error": "Failed to parse recipe content"}), 400

            recipes_list = [recipe.model_dump() for recipe in recipes]
            return jsonify(recipes_list)
        except Exception as e:
            logger.error(f"Error processing recipe from {url}: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    @app.route("/")
    def index():
        return jsonify(
            {"status": "healthy", "version": "1.0.0", "timestamp": time.time()}
        )

    @app.route("/health")
    def health_check():
        return jsonify({"status": "healthy"}), 200

    return app


if __name__ == "__main__":
    # Create the application with development configuration
    app = create_app(os.environ.get("FLASK_ENV", "development"))
    app.run(debug=app.config["DEBUG"])
