import logging

import requests
from bs4 import BeautifulSoup

from recipe_parser import RecipeParser


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


def main():
    # Initialize the recipe parser
    parser = RecipeParser()

    # Example usage
    url = "https://www.instagram.com/p/DF6FuFxS-UD/"
    soup = fetch_webpage(url)

    if soup:
        # Extract recipe content from the webpage
        recipe_content = extract_recipe_content(soup)

        if recipe_content:
            logging.info("\nExtracted Recipe Content:")
            logging.info(recipe_content)

            # Parse the recipe
            recipe = parser.parse_recipes([recipe_content])
            if recipe:
                logging.info("\nSuccessfully parsed recipe!")
                logging.info(recipe)
            else:
                print("\nFailed to parse recipe content")
        else:
            print("\nNo recipe content found")


if __name__ == "__main__":
    main()
