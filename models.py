from decimal import Decimal
from typing import List

from pydantic import BaseModel


class Ingredient(BaseModel):
    """Represents a recipe ingredient with quantity and unit."""

    name: str
    quantity: Decimal | str
    unit: str


class Macro(BaseModel):
    """Represents nutritional macro information."""

    amount: Decimal
    unit: str


class Recipe(BaseModel):
    """Represents a complete recipe with all its components."""

    id: str | None = None  # Hash of the URL, will be set when saving
    name: str
    servings: int
    calories: Decimal
    fat: Macro | None
    carbs: Macro | None
    protein: Macro | None
    ingredients: List[Ingredient]
    instructions: List[str]
    url: str  # URL where the recipe was found
    created_at: int  # unix timestamp
    updated_at: int  # unix timestamp
    image_url: str | None
