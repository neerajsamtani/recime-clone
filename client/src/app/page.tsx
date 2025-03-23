import { RecipeForm } from "@/components/RecipeForm";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold">Add a new recipe</h1>
      <RecipeForm />
    </div>
  );
}
