export interface Macro {
    amount: number;
    unit: string;
}

export interface Ingredient {
    name: string;
    quantity: number;
    unit: string;
}

export interface Recipe {
    id: string;
    name: string;
    servings: number;
    calories: number;
    fat: Macro | null;
    carbs: Macro | null;
    protein: Macro | null;
    ingredients: Ingredient[];
    instructions: string[];
    url: string;
    created_at: string;
    image_url?: string;
} 