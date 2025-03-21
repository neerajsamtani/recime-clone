import logging
import os

import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request

from recipe_parser import RecipeParser


def create_app(config=None):
    app = Flask(__name__)

    # Load configuration
    if config is None:
        # Default configuration
        app.config.from_object(
            {
                "DEBUG": False,
                "TESTING": False,
                "SECRET_KEY": os.environ.get("SECRET_KEY", "dev"),
            }
        )
    else:
        app.config.from_object(config)

    def fetch_webpage(url):
        try:
            # Send a GET request to the URL
            response = requests.get(url)

            # Raise an exception for bad status codes
            response.raise_for_status()

            # Create BeautifulSoup object to parse the HTML
            soup = BeautifulSoup(response.text, "html.parser")

            return soup
        except requests.RequestException as e:
            print(f"An error occurred: {e}")
            return None

    def extract_recipe_content(soup):
        main_content = (
            soup.find("meta", attrs={"name": "description"}).get("content")
            or soup.find("article")
            or soup.find("main")
            or soup.find("div", class_="content")
        )
        return main_content

    @app.route("/scrape/<path:url>", methods=["GET"])
    def scrape_recipe(url):
        soup = fetch_webpage(url)

        if not soup:
            return jsonify({"error": "Failed to fetch webpage"}), 400

        # Extract recipe content from the webpage
        recipe_content = extract_recipe_content(soup)

        if not recipe_content:
            return jsonify({"error": "No recipe content found"}), 404

        # Parse the recipe
        parser = RecipeParser()
        recipes = parser.parse_recipes([recipe_content])

        if not recipes:
            return jsonify({"error": "Failed to parse recipe content"}), 400

        recipes_list = [recipe.model_dump() for recipe in recipes]

        return jsonify(recipes_list)

    @app.route("/")
    def index():
        return "Welcome!"

    return app


if __name__ == "__main__":
    # Create the application with development configuration
    app = create_app(
        {
            "DEBUG": True,
            "TESTING": False,
            "SECRET_KEY": "dev",
        }
    )
    app.run(debug=True)
