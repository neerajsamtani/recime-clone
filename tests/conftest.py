import json
import os
import time
from pathlib import Path

import boto3
import pytest
from moto import mock_aws
from openai import OpenAI

from recipe_parser import RecipeParser
from web_scraper import create_app


@pytest.fixture
def app():
    """Create and configure a test Flask application instance."""
    app = create_app("testing")
    return app


@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture
def mock_openai_client(mocker):
    """Mock OpenAI client for testing."""
    mock_client = mocker.Mock(spec=OpenAI)
    current_time = int(time.time())
    mock_response = mocker.Mock()
    mock_response.choices = [
        mocker.Mock(
            message=mocker.Mock(
                content=json.dumps(
                    {
                        "name": "Test Recipe",
                        "servings": 4,
                        "ingredients": [
                            {"quantity": 1, "unit": "cup", "name": "test ingredient"}
                        ],
                        "instructions": ["Step 1: Test instruction"],
                        "url": "https://example.com/recipe",
                        "image_url": "https://example.com/recipe.jpg",
                        "created_at": current_time,
                        "updated_at": current_time,
                        "calories": "100",
                        "fat": {"amount": "4", "unit": "g"},
                        "carbs": {"amount": "15", "unit": "g"},
                        "protein": {"amount": "5", "unit": "g"},
                    }
                )
            )
        )
    ]

    # Create the nested structure for OpenAI client
    mock_completions = mocker.Mock()
    mock_completions.parse.return_value = mock_response
    mock_chat = mocker.Mock()
    mock_chat.completions = mock_completions
    mock_beta = mocker.Mock()
    mock_beta.chat = mock_chat
    mock_client.beta = mock_beta

    return mock_client


@pytest.fixture
def mock_dynamodb_table():
    """Create a mock DynamoDB table for testing."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")

        # Create the mock table
        table = dynamodb.create_table(
            TableName="recipes",
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        yield table


@pytest.fixture
def recipe_parser(mock_openai_client, tmp_path):
    """Create a RecipeParser instance with mocked dependencies."""
    parser = RecipeParser(
        storage_type="file", output_file=str(tmp_path / "recipes.json")
    )
    parser.client = mock_openai_client
    return parser


@pytest.fixture
def recipe_parser_dynamodb(mock_openai_client, mock_dynamodb_table):
    """Create a RecipeParser instance with DynamoDB storage."""
    parser = RecipeParser(storage_type="dynamodb", table_name="recipes")
    parser.client = mock_openai_client
    parser.table = mock_dynamodb_table
    return parser


@pytest.fixture
def sample_recipe_text():
    """Sample recipe text for testing."""
    return """
    Classic Chocolate Chip Cookies
    Serves 24
    
    Ingredients:
    - 2 1/4 cups all-purpose flour
    - 1 tsp baking soda
    - 1 cup butter, softened
    - 3/4 cup sugar
    - 3/4 cup brown sugar
    - 2 eggs
    - 2 cups chocolate chips
    
    Instructions:
    1. Preheat oven to 375°F
    2. Mix flour and baking soda
    3. Cream butter and sugars
    4. Beat in eggs
    5. Stir in chocolate chips
    6. Drop by spoonfuls onto baking sheets
    7. Bake for 10 minutes
    """
