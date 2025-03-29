import { Suspense } from 'react';
import { SearchableRecipeList } from './SearchableRecipeList';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

import { auth } from '@/auth';
import { dynamodb } from '@/lib/dynamodb';
import { Recipe } from '@/types/recipe';
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';

async function getRecipes(userEmail?: string) {
    const recipes: Recipe[] = [];
    const error: string | null = null;
    try {
        let lastEvaluatedKey: Record<string, unknown> | undefined;

        // Handle pagination using do-while loop
        do {
            const command: ScanCommand = new ScanCommand({
                TableName: 'recipes',
                ExclusiveStartKey: lastEvaluatedKey,
                FilterExpression: 'user_email = :userEmail',
                ExpressionAttributeValues: {
                    ':userEmail': userEmail,
                },
            });

            const response: ScanCommandOutput = await dynamodb.send(command);

            if (response.Items) {
                recipes.push(...response.Items as Recipe[]);
            }

            lastEvaluatedKey = response.LastEvaluatedKey;
        } while (lastEvaluatedKey);

    } catch (error) {
        console.error('Error fetching recipes:', error);
        error = 'Failed to fetch recipes';
    }
    return { recipes, error };
}

export async function RecipeListContainer() {
    const session = await auth()
    if (!session) {
        return <></>
    }
    const { recipes, error } = await getRecipes(session.user?.email ?? undefined);
    if (error) {
        return <div>{error}</div>
    }

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