import json
import os
from pathlib import Path
from typing import List, Literal, Optional

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from openai import OpenAI

from models import Recipe


class RecipeParser:
    """Class to handle recipe parsing from text descriptions using OpenAI."""

    def __init__(
        self,
        storage_type: Literal["file", "dynamodb"] = "file",
        output_file: str = "recipes.json",
        table_name: str = "recipes",
        region: str = "us-east-1",
    ):
        """
        Initialize the RecipeParser with OpenAI client and load environment variables.

        Args:
            storage_type: Type of storage to use ("file" or "dynamodb")
            output_file: Path to the output JSON file (only used if storage_type is "file")
            table_name: Name of the DynamoDB table (only used if storage_type is "dynamodb")
            region: AWS region for DynamoDB (only used if storage_type is "dynamodb")
        """
        load_dotenv()
        self.client = OpenAI()
        self.storage_type = storage_type
        self.output_file = output_file

        if storage_type == "dynamodb":
            self.dynamodb = boto3.resource("dynamodb", region_name=region)
            self.table = self.dynamodb.Table(table_name)

    def parse_recipe(self, description: str, url: str) -> Optional[Recipe]:
        """
        Parse a recipe from a text description using OpenAI.

        Args:
            description: Text description of the recipe
            url: URL where the recipe was found

        Returns:
            Recipe object if successful, None otherwise
        """
        try:
            # Create OpenAI API request
            response = self.client.beta.chat.completions.parse(
                model="gpt-4o-mini-2024-07-18",
                response_format=Recipe,
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

            # Parse the response into a Recipe object
            recipe_dict = json.loads(response.choices[0].message.content)
            recipe = Recipe.model_validate(recipe_dict)
            recipe.url = url  # Add URL to the recipe
            return recipe

        except Exception as e:
            print(f"Error parsing recipe: {str(e)}")
            return None

    def parse_recipes(self, descriptions: List[str], urls: List[str]) -> List[Recipe]:
        """
        Process multiple recipe descriptions.

        Args:
            descriptions: List of recipe descriptions to parse
            urls: List of URLs where the recipes were found

        Returns:
            List of successfully parsed Recipe objects
        """
        recipes = []

        for i, (description, url) in enumerate(zip(descriptions, urls), 1):
            print(f"Processing recipe {i}...")
            recipe = self.parse_recipe(description, url)

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
                json.dump(existing_recipes, f, indent=4)

        except Exception as e:
            print(f"Error saving recipe to file: {str(e)}")

    def _save_recipe_to_dynamodb(self, recipe: Recipe):
        """
        Save a recipe to DynamoDB.

        Args:
            recipe: Recipe object to save
        """
        try:
            recipe_dict = recipe.model_dump()
            # Use URL as the ID
            recipe_dict["id"] = recipe.url

            self.table.put_item(Item=recipe_dict)
            print(f"Successfully saved recipe {recipe.name} to DynamoDB")

        except ClientError as e:
            print(f"Error saving recipe to DynamoDB: {str(e)}")
        except Exception as e:
            print(f"Unexpected error saving recipe to DynamoDB: {str(e)}")
