import hashlib
import json
import os
import time
from decimal import Decimal
from pathlib import Path
from typing import List, Literal, Optional

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from openai import OpenAI

from models import BaseRecipe, Recipe


class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle Decimal values."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)


class RecipeParser:
    """Class to handle recipe parsing from text descriptions using OpenAI."""

    def __init__(
        self,
        storage_type: Literal["file", "dynamodb"] = "file",
        output_file: str = "recipes.json",
        table_name: str = "recipes",
        region: str = "us-east-1",
        client: Optional[OpenAI] = None,
    ):
        """
        Initialize the RecipeParser with OpenAI client and load environment variables.

        Args:
            storage_type: Type of storage to use ("file" or "dynamodb")
            output_file: Path to the output JSON file (only used if storage_type is "file")
            table_name: Name of the DynamoDB table (only used if storage_type is "dynamodb")
            region: AWS region for DynamoDB (only used if storage_type is "dynamodb")
            client: Optional OpenAI client instance (if not provided, one will be created)
        """
        load_dotenv()

        # Only create a new OpenAI client if none is provided and we're not in a testing environment
        if client is not None:
            self.client = client
        else:
            # Check if we're in a testing environment
            testing = os.environ.get("PYTEST_CURRENT_TEST") is not None
            if testing:
                raise ValueError("OpenAI client must be provided in test environment")
            self.client = OpenAI()

        self.storage_type = storage_type
        self.output_file = output_file

        if storage_type == "dynamodb":
            self.dynamodb = boto3.resource("dynamodb", region_name=region)
            self.table = self.dynamodb.Table(table_name)

    def parse_recipe(
        self,
        description: str,
        url: str,
        user_email: str,
        image_url: Optional[str] = None,
    ) -> Optional[Recipe]:
        """
        Parse a recipe from a text description using OpenAI.

        Args:
            description: Text description of the recipe
            url: URL where the recipe was found
            user_email: Email of the user who owns the recipe
            image_url: URL of the recipe's image (optional)
        Returns:
            Recipe object if successful, None otherwise
        """
        try:
            # Create OpenAI API request
            response = self.client.beta.chat.completions.parse(
                model="gpt-4o-mini-2024-07-18",
                response_format=BaseRecipe,  # Use BaseRecipe for parsing
                messages=[
                    {
                        "role": "system",
                        "content": """You are a recipe parser that converts recipe descriptions into structured data.
                        Extract the recipe name, servings, nutritional information, ingredients, and instructions.
                        Format numbers as decimals where appropriate.
                        For ingredients, separate quantity, unit, and name.
                        For nutritional macros, separate amount and unit.
                        If you can't find the information, return None.
                        Make sure to include all ingredients and instructions.
                        Make sure all instructions are in the same order as the recipe.""",
                    },
                    {"role": "user", "content": description},
                ],
                temperature=0.1,  # Lower temperature for more consistent parsing
            )

            # Parse the response into a BaseRecipe object first
            base_recipe_dict = json.loads(response.choices[0].message.content)
            base_recipe = BaseRecipe.model_validate(base_recipe_dict)

            # Convert BaseRecipe to Recipe by adding metadata
            recipe_dict = base_recipe.model_dump()
            recipe_dict.update(
                {
                    "url": url,
                    "image_url": image_url,
                    "created_at": int(time.time()),
                    "updated_at": int(time.time()),
                    "user_email": user_email,
                }
            )
            recipe = Recipe.model_validate(recipe_dict)
            return recipe

        except Exception as e:
            print(f"Error parsing recipe: {str(e)}")
            return None

    def parse_recipes(
        self,
        descriptions: List[str],
        urls: List[str],
        user_emails: List[str],
        image_urls: Optional[List[str]] = None,
    ) -> List[Recipe]:
        """
        Process multiple recipe descriptions.

        Args:
            descriptions: List of recipe descriptions to parse
            urls: List of URLs where the recipes were found
            user_emails: List of user emails for the recipes
            image_urls: List of image URLs for the recipes (optional)

        Returns:
            List of successfully parsed Recipe objects
        """
        recipes = []

        # If no image URLs provided, use None for each recipe
        if image_urls is None:
            image_urls = [None] * len(descriptions)

        for i, (description, url, user_email, image_url) in enumerate(
            zip(descriptions, urls, user_emails, image_urls), 1
        ):
            print(f"Processing recipe {i}...")
            recipe = self.parse_recipe(description, url, user_email, image_url)

            if recipe:
                recipes.append(recipe)
                self._save_recipe(recipe)

        return recipes

    def _save_recipe(self, recipe: Recipe):
        """
        Save a recipe to the configured storage (file or DynamoDB).

        Args:
            recipe: Recipe object to save
        """
        if self.storage_type == "file":
            self._save_recipe_to_file(recipe)
        else:
            self._save_recipe_to_dynamodb(recipe)

    def _save_recipe_to_file(self, recipe: Recipe):
        """
        Save a recipe to the JSON file.

        Args:
            recipe: Recipe object to save
        """
        try:
            # Create directory if it doesn't exist
            output_dir = Path(self.output_file).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            # Load existing recipes
            existing_recipes = []
            if os.path.exists(self.output_file):
                with open(self.output_file, "r") as f:
                    existing_recipes = json.load(f)

            # Append new recipe and save
            existing_recipes.append(recipe.model_dump())
            with open(self.output_file, "w") as f:
                json.dump(existing_recipes, f, indent=4, cls=DecimalEncoder)

        except Exception as e:
            print(f"Error saving recipe to file: {str(e)}")

    def _generate_recipe_id(self, url: str, user_email: str) -> str:
        """
        Generate a consistent hash ID from a URL and user email.

        Args:
            url: URL to hash
            user_email: User email to hash

        Returns:
            str: SHA-256 hash of the URL and user email
        """
        return hashlib.sha256(f"{url}:{user_email}".encode()).hexdigest()

    def _save_recipe_to_dynamodb(self, recipe: Recipe):
        """
        Save a recipe to DynamoDB, checking for duplicates using the URL hash.

        Args:
            recipe: Recipe object to save
        """
        try:
            recipe_dict = recipe.model_dump()
            # Generate hash ID from URL
            recipe_id = self._generate_recipe_id(recipe.url, recipe.user_email)
            recipe_dict["id"] = recipe_id

            # Check if recipe already exists
            existing_recipe = self.table.get_item(Key={"id": recipe_id}).get("Item")

            if existing_recipe:
                print(f"Recipe with URL {recipe.url} already exists, skipping...")
                return

            self.table.put_item(Item=recipe_dict)
            print(f"Successfully saved recipe {recipe.name} to DynamoDB")

        except ClientError as e:
            print(f"Error saving recipe to DynamoDB: {str(e)}")
        except Exception as e:
            print(f"Unexpected error saving recipe to DynamoDB: {str(e)}")
