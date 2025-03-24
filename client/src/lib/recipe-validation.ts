import { Recipe } from "@/types/recipe";

export function validateRecipe(recipe: Recipe, originalRecipe: Recipe): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const isNewRecipe = !originalRecipe.id; // Check if this is a new recipe

    // For new recipes, or if name was changed
    if (isNewRecipe || recipe.name !== originalRecipe.name) {
        if (!recipe.name.trim()) {
            errors.push("Recipe name is required");
        }
    }

    // For new recipes, or if servings was changed
    if (isNewRecipe || recipe.servings !== originalRecipe.servings) {
        if (recipe.servings <= 0) {
            errors.push("Servings must be greater than 0");
        }
    }

    // For new recipes, or if calories was changed
    if (isNewRecipe || recipe.calories !== originalRecipe.calories) {
        if (recipe.calories <= 0) {
            errors.push("Calories must be greater than 0");
        }
    }

    // Validate ingredients
    if (recipe.ingredients.length === 0) {
        errors.push("At least one ingredient is required");
    } else {
        recipe.ingredients.forEach((ingredient, index) => {
            const originalIngredient = originalRecipe.ingredients[index];
            const isNewOrModified = isNewRecipe || !originalIngredient ||
                ingredient.name !== originalIngredient.name ||
                ingredient.quantity !== originalIngredient.quantity ||
                ingredient.unit !== originalIngredient.unit;

            if (isNewOrModified) {
                if (!ingredient.name.trim()) {
                    errors.push(`Ingredient ${index + 1} name is required`);
                }
                if (ingredient.quantity <= 0) {
                    errors.push(`Ingredient ${index + 1} quantity must be greater than 0`);
                }
                if (!ingredient.unit.trim()) {
                    errors.push(`Ingredient ${index + 1} unit is required`);
                }
            }
        });
    }

    // Validate instructions
    if (recipe.instructions.length === 0) {
        errors.push("At least one instruction is required");
    } else {
        recipe.instructions.forEach((instruction, index) => {
            const originalInstruction = originalRecipe.instructions[index];
            if (isNewRecipe || !originalInstruction || instruction !== originalInstruction) {
                if (!instruction.trim()) {
                    errors.push(`Instruction ${index + 1} cannot be empty`);
                }
            }
        });
    }

    // Validate macros if they are provided
    if (recipe.fat) {
        if (recipe.fat.amount <= 0 || !recipe.fat.unit) {
            errors.push("Fat macro must have valid amount and unit");
        }
    }
    if (recipe.carbs) {
        if (recipe.carbs.amount <= 0 || !recipe.carbs.unit) {
            errors.push("Carbs macro must have valid amount and unit");
        }
    }
    if (recipe.protein) {
        if (recipe.protein.amount <= 0 || !recipe.protein.unit) {
            errors.push("Protein macro must have valid amount and unit");
        }
    }

    return { isValid: errors.length === 0, errors };
} 