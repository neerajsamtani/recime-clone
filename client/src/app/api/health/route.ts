import { config } from '@/config';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${config.api.url}/`);
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch data', details: error },
            { status: 500 }
        );
    }
} 