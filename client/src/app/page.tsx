import { auth } from "@/auth";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeListContainer } from "@/components/RecipeListContainer";
import { cn } from "@/lib/utils";

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex-1 bg-gradient-to-b from-background to-accent/5 flex">
      <div className={cn(
        "container mx-auto px-4 py-8 sm:px-6 lg:px-8",
        !session && "flex items-center justify-center flex-1"
      )}>
        <header className={cn(
          "text-center",
          session ? "mb-12" : ""
        )}>
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">Recime</h1>
          <p className="text-lg text-muted-foreground">Save and organize your favorite recipes from Instagram</p>
        </header>
        {session && (
          <div className="max-w-3xl mx-auto space-y-12">
            <section>
              <RecipeForm />
            </section>
            <section>
              <RecipeListContainer />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
