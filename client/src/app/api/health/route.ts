import { auth } from '@/auth';
import { config } from '@/config';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const response = await fetch(`${config.api.url}/`, {
            headers: await headers()
        });
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch data', details: error },
            { status: 500 }
        );
    }
} 