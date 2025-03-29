"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiInstagram } from "@icons-pack/react-simple-icons";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
export function RecipeForm() {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // TODO: Separate this into a client and server component that calls a route handler

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scrape`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: inputValue }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Recipe imported successfully!", {
                    description: "Your recipe has been added to the collection.",
                });
                setInputValue(""); // Clear the input on success
                router.refresh(); // Refresh the page data
            } else {
                toast.error("Failed to import recipe", {
                    description: data.error || "An unexpected error occurred",
                });
            }
        } catch {
            toast.error("Failed to import recipe", {
                description: "An unexpected error occurred",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold">Import Recipe</h2>
            <Card className="w-full p-6 bg-card/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <SiInstagram className="h-4 w-4" />
                            <span className="text-sm font-medium">Instagram Recipe URL</span>
                        </div>
                        <Input
                            type="text"
                            placeholder="Paste an Instagram recipe post URL..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-background/50"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the URL of an Instagram post containing a recipe you&apos;d like to save
                        </p>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !inputValue.trim()}
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing Recipe...
                            </>
                        ) : (
                            "Import Recipe"
                        )}
                    </Button>
                </form>
            </Card>
        </>
    );
} 