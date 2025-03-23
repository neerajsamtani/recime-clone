'use client';

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Macro {
    amount: number;
    unit: string;
}

interface Ingredient {
    name: string;
    quantity: number;
    unit: string;
}

interface Recipe {
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
}

interface RecipeListProps {
    className?: string;
    recipes?: Recipe[];
}

export function RecipeList({ className, recipes = [] }: RecipeListProps) {
    if (!recipes || recipes.length === 0) {
        return (
            <div className={cn("mt-8", className)}>
                <Card>
                    <CardHeader>
                        <CardTitle>No recipes yet</CardTitle>
                        <CardDescription>Add your first recipe using the form above!</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("mt-8 space-y-4", className)}>
            <h2 className="text-xl font-semibold">Your Recipes</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {recipes.map((recipe) => (
                    <Card key={recipe.id} className="overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{recipe.name}</CardTitle>
                                    <CardDescription>
                                        Added on {new Date(recipe.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Serves {recipe.servings}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Nutrition Information */}
                            <div className="rounded-lg bg-muted p-4">
                                <h3 className="mb-2 font-semibold">Nutrition per serving</h3>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium">Calories</p>
                                        <p>{recipe.calories}</p>
                                    </div>
                                    {recipe.fat && (
                                        <div>
                                            <p className="font-medium">Fat</p>
                                            <p>{recipe.fat.amount}{recipe.fat.unit}</p>
                                        </div>
                                    )}
                                    {recipe.carbs && (
                                        <div>
                                            <p className="font-medium">Carbs</p>
                                            <p>{recipe.carbs.amount}{recipe.carbs.unit}</p>
                                        </div>
                                    )}
                                    {recipe.protein && (
                                        <div>
                                            <p className="font-medium">Protein</p>
                                            <p>{recipe.protein.amount}{recipe.protein.unit}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div className="pt-2">
                                <h3 className="mb-2 font-semibold">Ingredients</h3>
                                <ul className="list-inside list-disc space-y-1 text-sm">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <li key={index}>
                                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div className="pt-2 border-t">
                                <h3 className="mb-2 font-semibold">Instructions</h3>
                                <ol className="list-inside list-decimal space-y-1 text-sm">
                                    {recipe.instructions.map((instruction, index) => (
                                        <li key={index}>{instruction}</li>
                                    ))}
                                </ol>
                            </div>

                            <div className="mt-4 pt-2 border-t">
                                <a
                                    href={recipe.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-sm text-primary hover:underline"
                                >
                                    View Original Recipe
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 