import { config } from '@/config';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await fetch(`${config.api.url}/recipes/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to delete recipe' }));
            return NextResponse.json(error, { status: response.status });
        }

        return NextResponse.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return NextResponse.json(
            { error: 'Failed to delete recipe' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const response = await fetch(`${config.api.url}/recipes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to update recipe' }));
            return NextResponse.json(error, { status: response.status });
        }

        const updatedRecipe = await response.json();
        return NextResponse.json(updatedRecipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
        return NextResponse.json(
            { error: 'Failed to update recipe' },
            { status: 500 }
        );
    }
} 