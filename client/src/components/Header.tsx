import { UserMenu } from "@/components/UserMenu";
import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-12 items-center">
                <div className="flex flex-1 justify-center">
                    <Link href="/" className="flex items-center">
                        <span className="text-lg font-semibold">Recime</span>
                    </Link>
                </div>
                <div className="flex flex-1 basis-0 justify-center">
                    <UserMenu />
                </div>
            </div>
        </header>
    );
} 