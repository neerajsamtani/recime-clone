'use client';

import { Recipe } from '@/types/recipe';
import { useState } from 'react';
import { RecipeList } from './RecipeList';
import { Input } from './ui/input';

interface SearchableRecipeListProps {
    recipes: Recipe[];
    className?: string;
}

export function SearchableRecipeList({ recipes, className }: SearchableRecipeListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter((recipe) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            recipe.name.toLowerCase().includes(searchLower) ||
            recipe.ingredients.some(ingredient =>
                ingredient.name.toLowerCase().includes(searchLower)
            ) ||
            recipe.instructions.some(instruction =>
                instruction.toLowerCase().includes(searchLower)
            )
        );
    });

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Recipes</h2>
            <div className="relative">
                <Input
                    type="search"
                    placeholder="Search recipes by name, ingredients, or instructions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>
            <RecipeList
                recipes={filteredRecipes}
                className={className}
            />
        </div>
    );
} 