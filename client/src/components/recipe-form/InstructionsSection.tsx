'use client';

import { Recipe } from "@/types/recipe";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface InstructionsSectionProps {
    recipe: Recipe;
    onUpdate: (updates: Partial<Recipe>) => void;
    isLoading: boolean;
}

export function InstructionsSection({ recipe, onUpdate, isLoading }: InstructionsSectionProps) {
    const addInstruction = () => {
        onUpdate({
            instructions: [...recipe.instructions, '']
        });
    };

    const removeInstruction = (index: number) => {
        onUpdate({
            instructions: recipe.instructions.filter((_, i) => i !== index)
        });
    };

    const updateInstruction = (index: number, value: string) => {
        onUpdate({
            instructions: recipe.instructions.map((instr, i) =>
                i === index ? value : instr
            )
        });
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <div className="space-y-2">
                {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                        <Input
                            value={instruction}
                            onChange={(e) => updateInstruction(index, e.target.value)}
                            placeholder={`Step ${index + 1}`}
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeInstruction(index)}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInstruction}
                    disabled={isLoading}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                </Button>
            </div>
        </div>
    );
} 