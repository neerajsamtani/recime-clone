'use client';

import { Recipe } from '@/types/recipe';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { RecipeList } from './RecipeList';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchableRecipeListProps {
    recipes: Recipe[];
    className?: string;
}

export function SearchableRecipeList({ recipes, className }: SearchableRecipeListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Input
                        type="search"
                        placeholder="Search recipes by name, ingredients, or instructions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                </Button>
            </div>
            <RecipeList
                recipes={filteredRecipes}
                className={className}
                isCreateDialogOpen={isCreateDialogOpen}
                onCreateDialogChange={setIsCreateDialogOpen}
            />
        </div>
    );
} 