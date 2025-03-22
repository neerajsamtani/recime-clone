import { config } from '@/config';

interface ApiResponse {
    status: string;
    timestamp: number;
    version: string;
}

async function getHealthStatus(): Promise<ApiResponse> {
    const response = await fetch(`${config.api.url}/`, {
        // Adding next: { revalidate: 30 } would cache the response for 30 seconds
        cache: 'no-store' // Disable caching to always get fresh data
    });

    if (!response.ok) {
        throw new Error('Failed to fetch health status');
    }

    return response.json();
}

export default async function HealthStatus() {
    let data: ApiResponse;

    try {
        data = await getHealthStatus();
    } catch (error) {
        return (
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <p className="text-red-500">Error: Failed to fetch health status</p>
                <p className="text-red-500">{String(error)}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <div className="space-y-4">
                <div>
                    <span className="font-semibold">Status: </span>
                    <span className={`${data.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
                        {data.status}
                    </span>
                </div>
                <div>
                    <span className="font-semibold">Version: </span>
                    <span>{data.version}</span>
                </div>
                <div>
                    <span className="font-semibold">Timestamp: </span>
                    <span>{new Date(data.timestamp * 1000).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'medium'
                    })}</span>
                </div>
            </div>
        </div>
    );
} 