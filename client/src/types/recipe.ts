export interface Macro {
    amount: number;
    unit: string;
}

export interface Ingredient {
    name: string;
    quantity: number | string;
    unit: string;
}

export interface BaseRecipe {
    name: string;
    servings: number;
    calories: number;
    fat: Macro | null;
    carbs: Macro | null;
    protein: Macro | null;
    ingredients: Ingredient[];
    instructions: string[];
}

export interface Recipe extends BaseRecipe {
    id?: string;
    url: string;
    created_at: number;
    updated_at: number;
    image_url?: string;
} 