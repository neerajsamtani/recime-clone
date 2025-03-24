/**
 * Represents a macro-nutrient measurement in a recipe
 */
export interface Macro {
    /** The amount of the macro-nutrient */
    amount: number;
    /** The unit of measurement (e.g., 'g' for grams) */
    unit: string;
}

/**
 * Represents an ingredient in a recipe
 */
export interface Ingredient {
    /** The name of the ingredient */
    name: string;
    /** The quantity of the ingredient */
    quantity: number;
    /** The unit of measurement (e.g., 'cups', 'grams', etc.) */
    unit: string;
}

/**
 * Represents a complete recipe with all its details
 */
export interface Recipe {
    /** Unique identifier for the recipe */
    id: string;
    /** Name of the recipe */
    name: string;
    /** Original URL where the recipe was found (optional) */
    url?: string;
    /** URL of the recipe's image (optional) */
    image_url?: string;
    /** Number of servings the recipe makes */
    servings: number;
    /** Calories per serving */
    calories: number;
    /** Fat content per serving (optional) */
    fat?: Macro;
    /** Carbohydrate content per serving (optional) */
    carbs?: Macro;
    /** Protein content per serving (optional) */
    protein?: Macro;
    /** List of ingredients required */
    ingredients: Ingredient[];
    /** Step-by-step cooking instructions */
    instructions: string[];
    /** Unix timestamp of when the recipe was created */
    created_at: string;
    /** Unix timestamp of when the recipe was last updated */
    updated_at: string;
}

/**
 * Type for creating a new recipe, omitting system-generated fields
 */
export type NewRecipe = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>;

/**
 * Type for updating an existing recipe
 */
export type RecipeUpdate = Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>; 