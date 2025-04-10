'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu({ session }: { session: Session | null }) {

    if (!session) {
        return (
            <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
            </Button>
        );
    }

    const firstAndLastInitial = session.user?.name?.split(" ").map(name => name[0]).join("");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image ?? undefined} />
                        <AvatarFallback>
                            {firstAndLastInitial ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 