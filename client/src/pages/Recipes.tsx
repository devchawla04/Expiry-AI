import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Banner, Button, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import { isoDate } from "../lib/format";
import { refreshKitchen } from "../lib/kitchen";
import type { Product, RecipeMatch } from "../lib/types";

type Generated = {
  name: string;
  minutes: number;
  steps: string[];
  note: string | null;
  uses: { id: string; name: string; daysRemaining: number | null }[];
};

export function Recipes() {
  const [params] = useSearchParams();
  const focus = params.get("product");
  const [mode, setMode] = useState<"expiring" | "pantry">("expiring");
  const [open, setOpen] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const client = useQueryClient();
  const recipes = useQuery({
    queryKey: ["recipes", mode],
    queryFn: () => api<{ recipes: RecipeMatch[]; ai: boolean }>(`/api/recipes?mode=${mode}`),
  });
  const generated = useMutation({
    mutationFn: () => api<Generated>("/api/recipes/generate", { method: "POST", body: {} }),
  });
  const cook = useMutation({
    mutationFn: (productIds: string[]) => api("/api/recipes/cook", { method: "POST", body: { productIds } }),
    onSuccess: async () => {
      setMessage("Those ingredients are marked as used.");
      setPicked([]);
      await refreshKitchen(client);
    },
  });
  const leftover = useMutation({
    mutationFn: (name: string) =>
      api<Product>("/api/products", {
        method: "POST",
        body: {
          name: `Leftover ${name}`,
          category: "Other",
          storageLocation: "fridge",
          expiryDate: isoDate(3),
          purchaseDate: isoDate(),
          notes: "Cooked at home. Finish within a few days.",
        },
      }),
    onSuccess: async () => {
      setMessage("Leftovers are in the fridge with a 3-day reminder.");
      await refreshKitchen(client);
    },
  });

  const list = [...(recipes.data?.recipes ?? [])].sort((a, b) => {
    if (!focus) return 0;
    const aHit = a.used.some((item) => item.id === focus) ? 1 : 0;
    const bHit = b.used.some((item) => item.id === focus) ? 1 : 0;
    return bHit - aHit;
  });

  return (
    <div>
      <PageHeader
        title="Cook from the shelf"
        text="Meals are matched to food you already have, with extra weight on anything about to expire."
      />
      <div className="mb-4 grid grid-cols-2 rounded-full bg-card p-1">
        {(
          [
            ["expiring", "Save my food"],
            ["pantry", "Anything I can cook"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={`rounded-full py-2 text-sm ${mode === id ? "bg-ink text-white" : ""}`} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>
      {message ? (
        <div className="mb-4">
          <Banner>{message}</Banner>
        </div>
      ) : null}
      {recipes.data?.ai ? (
        <div className="mb-4">
          <Button type="button" variant="secondary" onClick={() => generated.mutate()} disabled={generated.isPending}>
            {generated.isPending ? "Inventing…" : "Invent a recipe with AI"}
          </Button>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted">Saved matches work without an API key. Add OPENAI_API_KEY to invent a one-off recipe.</p>
      )}
      {generated.data ? (
        <article className="mb-4 rounded-[2rem] border border-line bg-card p-5">
          <h2 className="font-display text-3xl">{generated.data.name}</h2>
          <p className="text-sm text-muted">{generated.data.minutes} min</p>
          <p className="mt-2 text-sm">{generated.data.uses.map((item) => item.name).join(" · ")}</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            {generated.data.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {generated.data.note ? <p className="mt-3 text-sm text-muted">{generated.data.note}</p> : null}
        </article>
      ) : null}
      {generated.isError ? <Banner tone="bad">{generated.error instanceof Error ? generated.error.message : "No custom recipe"}</Banner> : null}
      {recipes.isLoading ? <p className="text-muted">Looking through the kitchen…</p> : null}
      {!recipes.isLoading && list.length === 0 ? (
        <Banner>{mode === "expiring" ? "Nothing urgent can be turned into a meal yet." : "Add a few more foods and the matches will show up."}</Banner>
      ) : (
        <div className="grid gap-3">
          {list.map((recipe) => (
            <article key={recipe.id} className="rounded-[2rem] border border-line bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl">
                    {recipe.emoji} {recipe.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {recipe.minutes} min · uses {recipe.used.length} · {recipe.expiring.length} expiring soon
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm">{recipe.used.map((item) => item.name).join(" · ")}</p>
              {recipe.missing.length ? <p className="mt-1 text-sm text-muted">You may still want: {recipe.missing.join(", ")}</p> : null}
              {open === recipe.id ? (
                <div className="mt-4 grid gap-3">
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    {recipe.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <div className="grid gap-2">
                    {recipe.used.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={picked.includes(item.id)}
                          onChange={(event) =>
                            setPicked((current) =>
                              event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id),
                            )
                          }
                        />
                        I used {item.name}
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" disabled={!picked.length || cook.isPending} onClick={() => cook.mutate(picked)}>
                      Mark used
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => leftover.mutate(recipe.name)} disabled={leftover.isPending}>
                      Save leftovers
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  className="mt-4"
                  variant="secondary"
                  onClick={() => {
                    setOpen(recipe.id);
                    setPicked(recipe.expiring.map((item) => item.id));
                  }}
                >
                  Cook this
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
