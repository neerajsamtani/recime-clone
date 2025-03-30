import json
from pathlib import Path
from unittest.mock import Mock

from models import BaseRecipe, Recipe


def test_recipe_parser_initialization(recipe_parser):
    """
    GIVEN: A RecipeParser instance
    WHEN: It is initialized with file storage
    THEN: It should have the correct attributes
    """
    assert recipe_parser.storage_type == "file"
    assert isinstance(recipe_parser.output_file, str)
    assert recipe_parser.client is not None


def test_recipe_parser_dynamodb_initialization(recipe_parser_dynamodb):
    """
    GIVEN: A RecipeParser instance
    WHEN: It is initialized with DynamoDB storage
    THEN: It should have the correct attributes and table
    """
    assert recipe_parser_dynamodb.storage_type == "dynamodb"
    assert recipe_parser_dynamodb.table is not None


def test_parse_recipe_success(recipe_parser, sample_recipe_text):
    """
    GIVEN: A recipe text and URL
    WHEN: parse_recipe is called
    THEN: It should return a valid Recipe object with both base and metadata fields
    """
    url = "https://example.com/recipe"
    image_url = "https://example.com/recipe.jpg"
    user_email = "test@example.com"

    recipe = recipe_parser.parse_recipe(sample_recipe_text, url, user_email, image_url)

    # Test base recipe fields
    assert isinstance(recipe, Recipe)
    assert recipe.name == "Test Recipe"
    assert recipe.servings == 4
    assert len(recipe.ingredients) == 1
    assert len(recipe.instructions) == 1

    # Test metadata fields
    assert recipe.url == url
    assert recipe.image_url == image_url
    assert recipe.created_at is not None
    assert recipe.updated_at is not None
    assert recipe.user_email == user_email
    assert (
        recipe.created_at == recipe.updated_at
    )  # Should be set to same time when created


def test_parse_recipe_failure(recipe_parser, mocker):
    """
    GIVEN: A recipe parser with a failing OpenAI client
    WHEN: parse_recipe is called
    THEN: It should return None and handle the error
    """
    mocker.patch.object(
        recipe_parser.client.beta.chat.completions,
        "parse",
        side_effect=Exception("API Error"),
    )

    result = recipe_parser.parse_recipe(
        "Invalid recipe", "https://example.com", "test@example.com"
    )
    assert result is None


def test_parse_recipes_batch(recipe_parser):
    """
    GIVEN: Multiple recipe descriptions and URLs
    WHEN: parse_recipes is called
    THEN: It should return a list of Recipe objects
    """
    descriptions = ["Recipe 1", "Recipe 2"]
    urls = ["https://example.com/1", "https://example.com/2"]
    user_emails = ["test1@example.com", "test2@example.com"]
    image_urls = ["https://example.com/1.jpg", "https://example.com/2.jpg"]

    recipes = recipe_parser.parse_recipes(descriptions, urls, user_emails, image_urls)

    assert len(recipes) == 2
    assert all(isinstance(recipe, Recipe) for recipe in recipes)


def test_save_recipe_to_file(recipe_parser):
    """
    GIVEN: A recipe and file storage configuration
    WHEN: _save_recipe_to_file is called
    THEN: The recipe should be saved to the JSON file
    """
    url = "https://example.com/recipe"
    user_email = "test@example.com"
    recipe = recipe_parser.parse_recipe("Test recipe", url, user_email)
    recipe_parser._save_recipe_to_file(recipe)

    output_file = Path(recipe_parser.output_file)
    assert output_file.exists()

    with open(output_file) as f:
        saved_recipes = json.load(f)

    assert len(saved_recipes) == 1
    assert saved_recipes[0]["url"] == url


def test_save_recipe_to_dynamodb(recipe_parser_dynamodb):
    """
    GIVEN: A recipe and DynamoDB storage configuration
    WHEN: _save_recipe_to_dynamodb is called
    THEN: The recipe should be saved to DynamoDB
    """
    url = "https://example.com/recipe"
    user_email = "test@example.com"
    recipe = recipe_parser_dynamodb.parse_recipe("Test recipe", url, user_email)
    recipe_parser_dynamodb._save_recipe_to_dynamodb(recipe)

    # Verify the recipe was saved
    recipe_id = recipe_parser_dynamodb._generate_recipe_id(url, user_email)
    saved_item = recipe_parser_dynamodb.table.get_item(Key={"id": recipe_id})

    assert "Item" in saved_item
    assert saved_item["Item"]["url"] == url


def test_generate_recipe_id(recipe_parser):
    """
    GIVEN: A URL
    WHEN: _generate_recipe_id is called
    THEN: It should return a consistent hash
    """
    url = "https://example.com/recipe"
    user_email = "test@example.com"
    id1 = recipe_parser._generate_recipe_id(url, user_email)
    id2 = recipe_parser._generate_recipe_id(url, user_email)

    assert isinstance(id1, str)
    assert id1 == id2  # Same URL and user email should generate same hash


def test_duplicate_recipe_dynamodb(recipe_parser_dynamodb):
    """
    GIVEN: A recipe that already exists in DynamoDB
    WHEN: Attempting to save it again
    THEN: It should skip the duplicate
    """
    url = "https://example.com/recipe"
    user_email = "test@example.com"
    recipe = recipe_parser_dynamodb.parse_recipe("Test recipe", url, user_email)

    # Save the recipe twice
    recipe_parser_dynamodb._save_recipe_to_dynamodb(recipe)
    recipe_parser_dynamodb._save_recipe_to_dynamodb(recipe)

    # Verify only one entry exists
    response = recipe_parser_dynamodb.table.scan()
    assert len(response["Items"]) == 1


def test_parse_recipe_base_fields(recipe_parser, mocker):
    """
    GIVEN: A recipe text
    WHEN: parse_recipe is called
    THEN: It should first create a BaseRecipe before converting to Recipe
    """
    base_recipe_data = {
        "name": "Test Recipe",
        "servings": 4,
        "calories": 500,
        "fat": {"amount": 20, "unit": "g"},
        "carbs": {"amount": 30, "unit": "g"},
        "protein": {"amount": 15, "unit": "g"},
        "ingredients": [{"name": "test", "quantity": "1", "unit": "cup"}],
        "instructions": ["Step 1"],
    }

    # Mock OpenAI response to return our test data
    mock_response = Mock()
    mock_response.choices = [Mock(message=Mock(content=json.dumps(base_recipe_data)))]
    mocker.patch.object(
        recipe_parser.client.beta.chat.completions, "parse", return_value=mock_response
    )

    recipe = recipe_parser.parse_recipe(
        "Test recipe", "https://example.com", "test@example.com"
    )

    # Verify base fields were preserved
    assert recipe.name == base_recipe_data["name"]
    assert recipe.servings == base_recipe_data["servings"]
    assert recipe.calories == base_recipe_data["calories"]
    assert recipe.fat.amount == base_recipe_data["fat"]["amount"]
    assert recipe.ingredients[0].name == base_recipe_data["ingredients"][0]["name"]
    assert recipe.instructions == base_recipe_data["instructions"]
