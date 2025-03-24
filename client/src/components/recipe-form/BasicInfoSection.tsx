'use client';

import { Recipe } from "@/types/recipe";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface BasicInfoSectionProps {
    recipe: Recipe;
    onUpdate: (updates: Partial<Recipe>) => void;
    isLoading: boolean;
}

export function BasicInfoSection({ recipe, onUpdate, isLoading }: BasicInfoSectionProps) {
    return (
        <div className="grid gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                    id="name"
                    value={recipe.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                        id="servings"
                        type="number"
                        value={recipe.servings}
                        onChange={(e) => onUpdate({ servings: parseInt(e.target.value) || 0 })}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                        id="calories"
                        type="number"
                        value={recipe.calories}
                        onChange={(e) => onUpdate({ calories: parseFloat(e.target.value) || 0 })}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
} 