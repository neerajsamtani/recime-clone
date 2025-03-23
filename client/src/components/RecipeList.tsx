'use client';

import { cn } from "@/lib/utils";
import { ExternalLink, Users } from 'lucide-react';
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
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>No recipes yet</CardTitle>
                        <CardDescription>Add your first recipe using the form above!</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("mt-8 space-y-6", className)}>
            <h2 className="text-2xl font-semibold">Your Recipes</h2>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {recipes.map((recipe) => (
                    <Card key={recipe.id} className="group bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="line-clamp-2">{recipe.name}</CardTitle>
                                    <CardDescription>
                                        Added on {new Date(recipe.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>Serves {recipe.servings}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Nutrition Information */}
                            <div className="rounded-lg bg-accent/50 p-4">
                                <h3 className="mb-3 text-sm font-medium">Nutrition per serving</h3>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium">Calories</p>
                                        <p className="text-muted-foreground">{recipe.calories}</p>
                                    </div>
                                    {recipe.fat && (
                                        <div>
                                            <p className="font-medium">Fat</p>
                                            <p className="text-muted-foreground">{recipe.fat.amount}{recipe.fat.unit}</p>
                                        </div>
                                    )}
                                    {recipe.carbs && (
                                        <div>
                                            <p className="font-medium">Carbs</p>
                                            <p className="text-muted-foreground">{recipe.carbs.amount}{recipe.carbs.unit}</p>
                                        </div>
                                    )}
                                    {recipe.protein && (
                                        <div>
                                            <p className="font-medium">Protein</p>
                                            <p className="text-muted-foreground">{recipe.protein.amount}{recipe.protein.unit}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div>
                                <h3 className="mb-3 text-sm font-medium">Ingredients</h3>
                                <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <li key={index} className="line-clamp-1">
                                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div className="pt-4 border-t">
                                <h3 className="mb-3 text-sm font-medium">Instructions</h3>
                                <ol className="list-inside list-decimal space-y-1.5 text-sm text-muted-foreground">
                                    {recipe.instructions.map((instruction, index) => (
                                        <li key={index}>
                                            {instruction}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <a
                                href={recipe.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline group-hover:text-primary/80 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Original Recipe
                            </a>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 