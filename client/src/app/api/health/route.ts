import { auth } from '@/auth';
import { config } from '@/config';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        // Intentionally not sending headers
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