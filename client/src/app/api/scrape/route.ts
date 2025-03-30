import { auth } from '@/auth';
import { config } from '@/config';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json();
        const url = body.url;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Add https:// if no protocol is specified
        const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://')
            ? url
            : `https://${url}`;

        // Check if URL is from Instagram
        try {
            const urlObj = new URL(urlWithProtocol);
            if (!urlObj.hostname.includes('instagram.com')) {
                return NextResponse.json(
                    { error: 'Only recipes from Instagram can be imported for now' },
                    { status: 400 }
                );
            }
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        const response = await axios({
            method: 'POST',
            url: `${config.api.url}/scrape`,
            data: {
                url: urlWithProtocol,
                user_email: session.user?.email
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error details:', error);
        return NextResponse.json(
            { error: 'Failed to scrape recipe', details: error },
            { status: 500 }
        );
    }
} 