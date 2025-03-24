'use client';

import { validateRecipe } from "@/lib/recipe-validation";
import { Recipe } from "@/types/recipe";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BasicInfoSection } from "./recipe-form/BasicInfoSection";
import { IngredientsSection } from "./recipe-form/IngredientsSection";
import { InstructionsSection } from "./recipe-form/InstructionsSection";
import { MacrosSection } from "./recipe-form/MacrosSection";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface EditRecipeDialogProps {
    recipe: Recipe;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditRecipeDialog({ recipe, open, onOpenChange }: EditRecipeDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate the recipe against the original recipe
        const { isValid, errors } = validateRecipe(editedRecipe, recipe);
        if (!isValid) {
            toast.error("Please fix the following errors:", {
                description: (
                    <ul className="list-disc pl-4 mt-2">
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
            // Create a sanitized version of the recipe for update
            const updatePayload = {
                ...editedRecipe,
                // Preserve immutable fields from original recipe
                id: recipe.id,
                url: recipe.url,
                image_url: recipe.image_url,
                created_at: recipe.created_at,
                // Clean up empty macros
                fat: editedRecipe.fat?.amount ? editedRecipe.fat : null,
                carbs: editedRecipe.carbs?.amount ? editedRecipe.carbs : null,
                protein: editedRecipe.protein?.amount ? editedRecipe.protein : null,
                // Trim strings and filter out empty items
                name: editedRecipe.name.trim(),
                ingredients: editedRecipe.ingredients
                    .filter(i => i.name.trim() && i.quantity > 0 && i.unit.trim())
                    .map(i => ({
                        ...i,
                        name: i.name.trim(),
                        unit: i.unit.trim()
                    })),
                instructions: editedRecipe.instructions
                    .filter(i => i.trim())
                    .map(i => i.trim())
            };

            const response = await fetch(`/api/recipes/${recipe.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) {
                throw new Error('Failed to update recipe');
            }

            toast.success('Recipe updated successfully');
            router.refresh(); // Refresh the page data
            onOpenChange(false); // Close the dialog
        } catch (error) {
            toast.error('Failed to update recipe');
            console.error('Error updating recipe:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (updates: Partial<Recipe>) => {
        setEditedRecipe(prev => ({ ...prev, ...updates }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Recipe</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <BasicInfoSection
                            recipe={editedRecipe}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                        />
                        <MacrosSection
                            recipe={editedRecipe}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                        />
                        <IngredientsSection
                            recipe={editedRecipe}
                            onUpdate={handleUpdate}
                            isLoading={isLoading}
                        />
                        <InstructionsSection
                            recipe={editedRecipe}
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
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 