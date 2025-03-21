from typing import List

from pydantic import BaseModel


class Ingredient(BaseModel):
    """Represents a recipe ingredient with quantity and unit."""

    name: str
    quantity: float
    unit: str


class Macro(BaseModel):
    """Represents nutritional macro information."""

    amount: float
    unit: str


class Recipe(BaseModel):
    """Represents a complete recipe with all its components."""

    name: str
    servings: int
    calories: float
    fat: Macro | None
    carbs: Macro | None
    protein: Macro | None
    ingredients: List[Ingredient]
    instructions: List[str]
