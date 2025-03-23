'use client';

import { cn } from "@/lib/utils";
import { Recipe } from "@/types/recipe";
import { ExternalLink, Trash2, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface RecipeListProps {
    className?: string;
    recipes?: Recipe[];
}

export function RecipeList({ className, recipes = [] }: RecipeListProps) {
    const [deletingRecipes, setDeletingRecipes] = useState<Set<string>>(new Set());
    const router = useRouter();

    const handleDeleteRecipe = async (recipeId: string) => {
        try {
            setDeletingRecipes(prev => new Set([...prev, recipeId]));
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete recipe');
            }

            toast.success('Recipe deleted successfully');
            router.refresh();
        } catch (error) {
            console.error('Error deleting recipe:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete recipe. Please try again.');
        } finally {
            setDeletingRecipes(prev => {
                const newSet = new Set(prev);
                newSet.delete(recipeId);
                return newSet;
            });
        }
    };

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
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {recipes.map((recipe) => (
                    <Card key={recipe.id} className="group bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                        <CardHeader>
                            {recipe.image_url && (
                                <div className="aspect-video w-full overflow-hidden rounded-lg relative">
                                    <Image
                                        src={recipe.image_url}
                                        alt={recipe.name}
                                        fill
                                        className="object-cover transition-all hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="line-clamp-2">{recipe.name}</CardTitle>
                                    <CardDescription>
                                        Added on {new Date(Number(recipe.created_at) * 1000).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>Serves {recipe.servings}</span>
                                    </div>
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

                            {/* Footer with links and actions */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <a
                                    href={recipe.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline group-hover:text-primary/80 transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Original Recipe
                                </a>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    disabled={deletingRecipes.has(recipe.id)}
                                    onClick={() => handleDeleteRecipe(recipe.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete recipe</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 