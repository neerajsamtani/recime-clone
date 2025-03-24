'use client';

import { Macro, Recipe } from "@/types/recipe";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface MacrosSectionProps {
    recipe: Recipe;
    onUpdate: (updates: Partial<Recipe>) => void;
    isLoading: boolean;
}

export function MacrosSection({ recipe, onUpdate, isLoading }: MacrosSectionProps) {
    const updateMacro = (type: 'fat' | 'carbs' | 'protein', field: keyof Macro, value: string) => {
        onUpdate({
            [type]: {
                ...(recipe[type] || { amount: 0, unit: 'g' }),
                [field]: field === 'amount' ? parseFloat(value) || 0 : value
            }
        });
    };

    return (
        <div className="space-y-2">
            <Label>Macros (per serving)</Label>
            <div className="grid grid-cols-3 gap-4">
                {(['fat', 'carbs', 'protein'] as const).map((macro) => (
                    <div key={macro} className="space-y-2">
                        <Label htmlFor={macro} className="capitalize">{macro}</Label>
                        <div className="flex gap-2">
                            <Input
                                id={`${macro}-amount`}
                                type="number"
                                value={recipe[macro]?.amount || ''}
                                onChange={(e) => updateMacro(macro, 'amount', e.target.value)}
                                placeholder="Amount"
                                disabled={isLoading}
                            />
                            <Input
                                id={`${macro}-unit`}
                                value={recipe[macro]?.unit || ''}
                                onChange={(e) => updateMacro(macro, 'unit', e.target.value)}
                                placeholder="Unit"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 