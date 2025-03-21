import os
from datetime import datetime

import requests
from bs4 import BeautifulSoup


def fetch_webpage(url):
    try:
        # Send a GET request to the URL
        response = requests.get(url)

        # Raise an exception for bad status codes
        response.raise_for_status()

        # Create a filename based on timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"webpage_{timestamp}.html"

        # Save the raw HTML to a file
        # with open(filename, "w", encoding="utf-8") as f:
        #     f.write(response.text)
        # print(f"HTML content saved to: {filename}")

        # Create BeautifulSoup object to parse the HTML
        soup = BeautifulSoup(response.text, "html.parser")

        return soup
    except requests.RequestException as e:
        print(f"An error occurred: {e}")
        return None


def extract_meta_description(soup):
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag:
        return meta_tag.get("content")
    return None


def main():
    # Example usage
    url = "https://www.instagram.com/p/DF6FuFxS-UD/"
    soup = fetch_webpage(url)

    if soup:
        # Get meta description
        description = extract_meta_description(soup)
        if description:
            print("\nMeta Description Content:")
            print(description)
        else:
            print("\nNo meta description found")


if __name__ == "__main__":
    main()
