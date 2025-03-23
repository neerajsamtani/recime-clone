import { Suspense } from 'react';
import { SearchableRecipeList } from './SearchableRecipeList';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

async function getRecipes() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/recipes`, {
        // Prevent caching to ensure fresh data
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch recipes');
    }

    const data = await response.json();
    if ('error' in data) {
        throw new Error(data.error);
    }

    return data;
}

export async function RecipeListContainer() {
    const recipes = await getRecipes();

    return (
        <Suspense fallback={
            <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold">Your Recipes</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        }>
            <SearchableRecipeList recipes={recipes} />
        </Suspense>
    );
} 