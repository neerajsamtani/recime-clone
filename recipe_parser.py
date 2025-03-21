import json
import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from openai import OpenAI

from models import Recipe


class RecipeParser:
    """Class to handle recipe parsing from text descriptions using OpenAI."""

    def __init__(self):
        """Initialize the RecipeParser with OpenAI client and load environment variables."""
        load_dotenv()
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.output_file = "recipes.json"

    def parse_recipe(self, description: str) -> Optional[Recipe]:
        """
        Parse a recipe from a text description using OpenAI.

        Args:
            description: Text description of the recipe

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
                        Format numbers as floats where appropriate.
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
            return Recipe.model_validate(recipe_dict)

        except Exception as e:
            print(f"Error parsing recipe: {str(e)}")
            return None

    def parse_recipes(self, descriptions: List[str]) -> List[Recipe]:
        """
        Process multiple recipe descriptions.

        Args:
            descriptions: List of recipe descriptions to parse

        Returns:
            List of successfully parsed Recipe objects
        """
        recipes = []

        for i, description in enumerate(descriptions, 1):
            print(f"Processing recipe {i}...")
            recipe = self.parse_recipe(description)

            if recipe:
                recipes.append(recipe)
                self._save_recipe(recipe)

        return recipes

    def _save_recipe(self, recipe: Recipe):
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
            print(f"Error saving recipe: {str(e)}")


def main():
    """Main function to demonstrate usage."""
    parser = RecipeParser()

    # Example recipe description
    description = """
    Classic Chocolate Chip Cookies
    
    Makes 24 cookies
    
    Nutritional Info (per cookie):
    Calories: 150
    Fat: 7g
    Carbs: 20g
    Protein: 2g
    
    Ingredients:
    - 2.25 cups all-purpose flour
    - 1 cup butter, softened
    - 0.75 cup granulated sugar
    - 0.75 cup packed brown sugar
    - 2 large eggs
    - 1 teaspoon vanilla extract
    - 1 teaspoon baking soda
    - 0.5 teaspoon salt
    - 2 cups chocolate chips
    
    Instructions:
    1. Preheat oven to 375°F
    2. Cream together butter and sugars until smooth
    3. Beat in eggs and vanilla
    4. Mix in flour, baking soda, and salt
    5. Stir in chocolate chips
    6. Drop rounded tablespoons onto ungreased baking sheets
    7. Bake for 10-12 minutes until golden brown
    8. Let cool on baking sheets for 5 minutes
    """

    recipes = parser.parse_recipes([description])
    print(f"Successfully processed {len(recipes)} recipes")


if __name__ == "__main__":
    main()
