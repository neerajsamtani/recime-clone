import { validateRecipe } from '@/lib/recipe-validation';
import { Recipe } from '@/types/recipe';
import { useState } from 'react';

interface UseRecipeFormProps {
    initialRecipe: Recipe;
    onSubmit: (recipe: Recipe) => Promise<void>;
}

export function useRecipeForm({ initialRecipe, onSubmit }: UseRecipeFormProps) {
    const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const updateRecipe = (updates: Partial<Recipe>) => {
        setRecipe(prev => {
            const updated = { ...prev, ...updates };
            const { errors } = validateRecipe(updated, initialRecipe);
            setErrors(errors);
            return updated;
        });
    };

    const handleSubmit = async () => {
        const { isValid, errors } = validateRecipe(recipe, initialRecipe);
        setErrors(errors);

        if (!isValid) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(recipe);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        recipe,
        errors,
        isLoading,
        updateRecipe,
        handleSubmit
    };
} 