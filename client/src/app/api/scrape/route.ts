import { config } from '@/config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

        const response = await fetch(`${config.api.url}/scrape/${encodeURIComponent(urlWithProtocol)}`);
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to scrape recipe', details: error },
            { status: 500 }
        );
    }
} 