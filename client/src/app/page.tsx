import { RecipeForm } from "@/components/RecipeForm";
import { RecipeListContainer } from "@/components/RecipeListContainer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">Recime</h1>
          <p className="text-lg text-muted-foreground">Save and organize your favorite recipes from Instagram</p>
        </header>
        <div className="max-w-3xl mx-auto space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Add a new recipe</h2>
            <RecipeForm />
          </section>
          <section>
            <RecipeListContainer />
          </section>
        </div>
      </div>
    </div>
  );
}
