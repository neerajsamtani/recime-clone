import { config } from '@/config';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${config.api.url}/recipes`);
        const data = await response.json();
        console.log(data);

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch recipes', details: error },
            { status: 500 }
        );
    }
} 