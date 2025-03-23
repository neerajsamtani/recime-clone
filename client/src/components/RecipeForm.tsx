"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function RecipeForm() {
    const [inputValue, setInputValue] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/echo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: inputValue }),
        });
        const data = await res.json();
        setResponse(data.text);
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
                />
                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </form>

            {response && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm">{response}</p>
                </div>
            )}
        </Card>
    );
} 