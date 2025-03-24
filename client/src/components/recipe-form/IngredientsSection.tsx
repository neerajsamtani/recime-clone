'use client';

import { Ingredient, Recipe } from "@/types/recipe";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface IngredientsSectionProps {
    recipe: Recipe;
    onUpdate: (updates: Partial<Recipe>) => void;
    isLoading: boolean;
}

export function IngredientsSection({ recipe, onUpdate, isLoading }: IngredientsSectionProps) {
    const addIngredient = () => {
        onUpdate({
            ingredients: [...recipe.ingredients, { name: '', quantity: 0, unit: '' }]
        });
    };

    const removeIngredient = (index: number) => {
        if (recipe.ingredients.length <= 1) {
            toast.error('Recipe must have at least one ingredient');
            return;
        }
        onUpdate({
            ingredients: recipe.ingredients.filter((_, i) => i !== index)
        });
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
        onUpdate({
            ingredients: recipe.ingredients.map((ingredient, i) => {
                if (i === index) {
                    return {
                        ...ingredient,
                        [field]: field === 'quantity' ? parseFloat(value) || 0 : value
                    };
                }
                return ingredient;
            })
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Ingredients</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIngredient}
                    disabled={isLoading}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Ingredient
                </Button>
            </div>
            <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-end gap-2">
                        <div className="flex-1">
                            <Input
                                value={ingredient.name}
                                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                placeholder="Ingredient name"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="w-20">
                            <Input
                                type="number"
                                value={ingredient.quantity}
                                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                                placeholder="Qty"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="w-20">
                            <Input
                                value={ingredient.unit}
                                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                placeholder="Unit"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeIngredient(index)}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
} 