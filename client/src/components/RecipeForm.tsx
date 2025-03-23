"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function RecipeForm() {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/scrape", {
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
        <Card className="w-full max-w-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Enter recipe URL..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importing...
                        </>
                    ) : (
                        "Import Recipe"
                    )}
                </Button>
            </form>
        </Card>
    );
} 