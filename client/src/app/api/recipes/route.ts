import { config } from '@/config';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${config.api.url}/recipes`);
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch recipes', details: error },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const recipe = await request.json();

        const response = await fetch(`${config.api.url}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create recipe', details: error instanceof Error ? error.message : error },
            { status: 500 }
        );
    }
} 