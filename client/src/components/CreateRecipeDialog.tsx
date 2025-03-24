'use client';

import { validateRecipe } from "@/lib/recipe-validation";
import { Recipe } from "@/types/recipe";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BasicInfoSection } from "./recipe-form/BasicInfoSection";
import { IngredientsSection } from "./recipe-form/IngredientsSection";
import { InstructionsSection } from "./recipe-form/InstructionsSection";
import { MacrosSection } from "./recipe-form/MacrosSection";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface CreateRecipeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRecipeCreated?: (recipe: Recipe) => void;
}

const defaultRecipe: Recipe = {
    id: '',
    name: '',
    servings: 1,
    calories: 0,
    ingredients: [{ name: '', quantity: 0, unit: '' }],
    instructions: [''],
    created_at: '',
    updated_at: '',
};

export function CreateRecipeDialog({ open, onOpenChange, onRecipeCreated }: CreateRecipeDialogProps) {
    const [newRecipe, setNewRecipe] = useState<Recipe>(defaultRecipe);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate recipe before submitting
        const { isValid, errors } = validateRecipe(newRecipe, defaultRecipe);
        if (!isValid) {
            // Show all validation errors in a single toast
            toast.error('Please fix the following errors:', {
                description: (
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                ),
            });
            return;
        }

        setIsLoading(true);

        try {
            // Create a sanitized version of the recipe for submission
            const submitPayload = {
                ...newRecipe,
                // Clean up empty macros
                fat: newRecipe.fat?.amount ? newRecipe.fat : null,
                carbs: newRecipe.carbs?.amount ? newRecipe.carbs : null,
                protein: newRecipe.protein?.amount ? newRecipe.protein : null,
                // Trim strings and filter out empty items
                name: newRecipe.name.trim(),
                ingredients: newRecipe.ingredients
                    .filter(i => i.name.trim() && i.quantity > 0 && i.unit.trim())
                    .map(i => ({
                        ...i,
                        name: i.name.trim(),
                        unit: i.unit.trim()
                    })),
                instructions: newRecipe.instructions
                    .filter(i => i.trim())
                    .map(i => i.trim())
            };

            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitPayload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.details || 'Failed to create recipe');
            }

            const createdRecipe = await response.json();
            toast.success('Recipe created successfully');
            onRecipeCreated?.(createdRecipe);
            onOpenChange(false);
            setNewRecipe(defaultRecipe); // Reset form
        } catch (error) {
            toast.error('Failed to create recipe', {
                description: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (updates: Partial<Recipe>) => {
        setNewRecipe(prev => ({ ...prev, ...updates }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Recipe</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <BasicInfoSection
                            recipe={newRecipe}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                        />
                        <MacrosSection
                            recipe={newRecipe}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                        />
                        <IngredientsSection
                            recipe={newRecipe}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                        />
                        <InstructionsSection
                            recipe={newRecipe}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Recipe'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 