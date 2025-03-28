import HealthStatus from '@/components/HealthStatus';

export default function Health() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1 className="text-2xl font-bold">Recime API Status</h1>
            <HealthStatus />
        </div>
    );
}
