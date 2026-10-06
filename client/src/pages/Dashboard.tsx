import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/kitchen";
import { Banner, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { expiryLabel, greeting, money } from "../lib/format";
import type { Insights, Product, RecipeMatch } from "../lib/types";

export function Dashboard() {
  const { user } = useAuth();
  const products = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => api<Product[]>("/api/products?status=active"),
  });
  const insights = useQuery({ queryKey: ["insights"], queryFn: () => api<Insights>("/api/insights") });
  const recipes = useQuery({
    queryKey: ["recipes", "expiring"],
    queryFn: () => api<{ recipes: RecipeMatch[] }>("/api/recipes?mode=expiring"),
  });

  const urgent = (products.data ?? []).filter((item) => item.daysRemaining != null && item.daysRemaining <= 3).slice(0, 4);
  const recipe = recipes.data?.recipes[0];
  const stats = insights.data;

  return (
    <div>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
        title={greeting(user?.name ?? "there")}
        text="Here is what your kitchen is asking you to use."
      />
      {products.isError ? <Banner tone="bad">The pantry could not be loaded.</Banner> : null}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="In the kitchen" value={String(stats?.counts.active ?? "—")} />
        <Stat label="Use soon" value={String(stats?.counts.expiringSoon ?? "—")} />
        <Stat label="On the shelf" value={stats ? money(stats.value.pantry, user?.currency) : "—"} />
        <Stat label="Saved this month" value={stats ? money(stats.value.savedThisMonth, user?.currency) : "—"} />
      </section>

      {recipe ? (
        <section className="mt-5 rounded-[2rem] bg-forest p-5 text-white shadow-card">
          <p className="text-sm text-white/75">Use it before it expires</p>
          <h2 className="mt-1 font-display text-3xl">
            {recipe.emoji} {recipe.name}
          </h2>
          <p className="mt-2 text-sm text-white/85">
            {`Uses ${recipe.expiring.length} ${recipe.expiring.length === 1 ? "food that is" : "foods that are"} running out of time · ${recipe.minutes} min`}
          </p>
          <p className="mt-3 text-sm">{recipe.expiring.map((item) => item.name).join(" · ")}</p>
          <Link to="/app/recipes" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-forest">
            Cook this
          </Link>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">Needs attention</h2>
          <Link to="/app/pantry" className="text-sm text-forest">
            All food
          </Link>
        </div>
        {products.isLoading ? <p className="text-sm text-muted">Checking dates…</p> : null}
        {!products.isLoading && urgent.length === 0 ? (
          <Banner>Nothing is racing the clock. Your kitchen is in good shape.</Banner>
        ) : (
          <div className="grid gap-3">
            {urgent.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {stats ? (
        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <Mini label="Fridge" value={stats.storage.fridge} />
          <Mini label="Freezer" value={stats.storage.freezer} />
          <Mini label="Pantry" value={stats.storage.pantry} />
        </section>
      ) : null}
      {urgent[0] ? (
        <p className="mt-4 text-sm text-muted">{`${urgent[0].name} is first in line. ${expiryLabel(urgent[0].daysRemaining)}.`}</p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-card p-4 shadow-card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-card px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
