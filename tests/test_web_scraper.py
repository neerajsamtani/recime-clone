import json
from unittest.mock import Mock

import pytest
import requests

from models import BaseRecipe, Recipe


@pytest.fixture
def mock_recipe():
    """Create a mock recipe that behaves like a Recipe model."""
    # Base recipe fields
    base_recipe_dict = {
        "name": "Test Recipe",
        "servings": 4,
        "calories": 500,
        "ingredients": [{"quantity": "1", "unit": "cup", "name": "test"}],
        "instructions": ["Step 1"],
        "fat": {"amount": 5, "unit": "g"},
        "protein": {"amount": 10, "unit": "g"},
        "carbs": {"amount": 20, "unit": "g"},
    }

    # Full recipe with metadata
    recipe_dict = {
        **base_recipe_dict,
        "id": "test-id",
        "url": "https://example.com/recipe",
        "image_url": "https://example.com/image.jpg",
        "created_at": 1234567890,
        "updated_at": 1234567890,
    }

    recipe = Mock(spec=Recipe)
    recipe.model_dump.return_value = recipe_dict
    for key, value in recipe_dict.items():
        setattr(recipe, key, value)
    return recipe


def test_app_creation(app):
    """
    GIVEN: A Flask application factory
    WHEN: Creating the app with test config
    THEN: It should be properly configured
    """
    assert app.config["TESTING"]
    assert app.config["REQUEST_TIMEOUT"] > 0


def test_index_route(client):
    """
    GIVEN: A Flask application
    WHEN: Accessing the index route
    THEN: It should return a healthy status
    """
    response = client.get("/")
    data = json.loads(response.data)

    assert response.status_code == 200
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_health_check(client):
    """
    GIVEN: A Flask application
    WHEN: Accessing the health check endpoint
    THEN: It should return a healthy status
    """
    response = client.get("/health")
    data = json.loads(response.data)

    assert response.status_code == 200
    assert data["status"] == "healthy"


def test_scrape_recipe_success(client, mocker, mock_recipe):
    """
    GIVEN: A valid recipe URL and mocked responses
    WHEN: Accessing the scrape endpoint
    THEN: It should return the parsed recipe
    """
    # Mock the requests.get call
    mock_response = Mock()
    mock_response.text = """
        <html>
            <head>
                <meta name="description" content="Test Recipe Description">
                <meta property="og:image" content="https://example.com/image.jpg">
            </head>
            <body>
                <article>Recipe content</article>
            </body>
        </html>
    """
    mock_response.raise_for_status = Mock()
    mocker.patch("requests.get", return_value=mock_response)

    # Mock the RecipeParser
    mock_parser = Mock()
    mock_parser.parse_recipes.return_value = [mock_recipe]
    mocker.patch("web_scraper.RecipeParser", return_value=mock_parser)

    response = client.get("/scrape/https://example.com/recipe")
    data = json.loads(response.data)

    assert response.status_code == 200
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "Test Recipe"


def test_scrape_recipe_invalid_url(client):
    """
    GIVEN: An invalid URL
    WHEN: Accessing the scrape endpoint
    THEN: It should return an error
    """
    response = client.get("/scrape/invalid-url")
    data = json.loads(response.data)

    assert response.status_code == 400
    assert "error" in data


def test_scrape_recipe_request_error(client, mocker):
    """
    GIVEN: A URL that causes a request error
    WHEN: Accessing the scrape endpoint
    THEN: It should handle the error gracefully
    """
    mocker.patch("requests.get", side_effect=requests.RequestException("Network error"))

    response = client.get("/scrape/https://example.com/recipe")
    data = json.loads(response.data)

    assert response.status_code == 400
    assert "error" in data


def test_scrape_recipe_no_content(client, mocker):
    """
    GIVEN: A URL with no recipe content
    WHEN: Accessing the scrape endpoint
    THEN: It should return a 404 error
    """
    # Mock response with no recipe content
    mock_response = Mock()
    mock_response.text = "<html><body></body></html>"
    mock_response.raise_for_status = Mock()
    mocker.patch("requests.get", return_value=mock_response)

    response = client.get("/scrape/https://example.com/recipe")
    data = json.loads(response.data)

    assert response.status_code == 404
    assert "error" in data


def test_get_all_recipes_success(client, mocker, mock_recipe):
    """
    GIVEN: A DynamoDB table with recipes
    WHEN: Accessing the recipes endpoint
    THEN: It should return all recipes
    """
    mock_recipes = [mock_recipe.model_dump(), mock_recipe.model_dump()]
    mock_table = Mock()
    mock_table.scan.return_value = {"Items": mock_recipes}

    # Mock the RecipeParser instance
    mock_parser = Mock()
    mock_parser.table = mock_table
    mocker.patch("web_scraper.RecipeParser", return_value=mock_parser)

    response = client.get("/recipes")
    data = json.loads(response.data)

    assert response.status_code == 200
    assert len(data) == 2
    assert data[0]["name"] == "Test Recipe"


def test_get_all_recipes_pagination(client, mocker, mock_recipe):
    """
    GIVEN: A DynamoDB table with paginated results
    WHEN: Accessing the recipes endpoint
    THEN: It should return all recipes across pages
    """
    mock_table = Mock()
    mock_table.scan.side_effect = [
        {"Items": [mock_recipe.model_dump()], "LastEvaluatedKey": "key2"},
        {"Items": [mock_recipe.model_dump()]},
    ]

    # Mock the RecipeParser instance
    mock_parser = Mock()
    mock_parser.table = mock_table
    mocker.patch("web_scraper.RecipeParser", return_value=mock_parser)

    response = client.get("/recipes")
    data = json.loads(response.data)

    assert response.status_code == 200
    assert len(data) == 2
    assert data[0]["name"] == "Test Recipe"
    assert data[1]["name"] == "Test Recipe"


def test_delete_recipe_success(client, mocker):
    """
    GIVEN: A valid recipe ID
    WHEN: Sending a DELETE request
    THEN: It should delete the recipe
    """
    mock_table = Mock()
    mock_table.delete_item.return_value = {}

    # Mock the RecipeParser instance
    mock_parser = Mock()
    mock_parser.table = mock_table
    mocker.patch("web_scraper.RecipeParser", return_value=mock_parser)

    response = client.delete("/recipes/test-id")
    data = json.loads(response.data)

    assert response.status_code == 200
    assert data["message"] == "Recipe deleted successfully"


def test_delete_recipe_error(client, mocker):
    """
    GIVEN: A recipe ID that causes an error when deleting
    WHEN: Sending a DELETE request
    THEN: It should handle the error gracefully
    """
    mock_table = Mock()
    mock_table.delete_item.side_effect = Exception("Delete error")

    # Mock the RecipeParser instance
    mock_parser = Mock()
    mock_parser.table = mock_table
    mocker.patch("web_scraper.RecipeParser", return_value=mock_parser)

    response = client.delete("/recipes/test-id")
    data = json.loads(response.data)

    assert response.status_code == 500
    assert "error" in data
