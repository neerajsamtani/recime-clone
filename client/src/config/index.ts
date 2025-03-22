export const config = {
    api: {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', // fallback for development
    },
} as const; 