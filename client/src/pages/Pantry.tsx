import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/kitchen";
import { Banner, Button, controlClass, EmptyState, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import type { Product } from "../lib/types";

const filters = [
  ["active", "In kitchen"],
  ["pressure", "Use soon"],
  ["expired", "Expired"],
  ["fridge", "Fridge"],
  ["freezer", "Freezer"],
  ["pantry", "Cupboard"],
  ["consumed", "Used"],
  ["discarded", "Tossed"],
] as const;

export function Pantry() {
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("active");
  const [query, setQuery] = useState("");
  const status = filter === "consumed" || filter === "discarded" ? filter : "active";
  const products = useQuery({
    queryKey: ["products", status],
    queryFn: () => api<Product[]>(`/api/products?status=${status}`),
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (products.data ?? []).filter((product) => {
      const text = `${product.name} ${product.brand ?? ""}`.toLowerCase();
      if (needle && !text.includes(needle)) return false;
      if (filter === "pressure") return product.daysRemaining != null && product.daysRemaining <= 3;
      if (filter === "expired") return product.freshness === "expired";
      if (filter === "fridge" || filter === "freezer" || filter === "pantry") return product.storageLocation === filter;
      return true;
    });
  }, [products.data, filter, query]);

  return (
    <div>
      <PageHeader
        title="Pantry"
        text="Everything you scanned or typed in, sorted by the date that matters."
        action={
          <div className="flex gap-2">
            <Link to="/app/pantry/new">
              <Button variant="ghost" type="button">
                Add by hand
              </Button>
            </Link>
            <Link to="/app/scan">
              <Button type="button">Scan</Button>
            </Link>
          </div>
        }
      />
      <input
        className={`${controlClass} mb-4`}
        placeholder="Search milk, spinach, brand…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${filter === id ? "bg-forest text-white" : "bg-card text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {products.isError ? <Banner tone="bad">Could not load the pantry.</Banner> : null}
      {products.isLoading ? <p className="text-sm text-muted">Loading food…</p> : null}
      {!products.isLoading && visible.length === 0 ? (
        <EmptyState
          title="Nothing in this view"
          text="Scan a label, look up a barcode, or add something you already know."
          action={
            <Link to="/app/scan">
              <Button type="button">Scan a product</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
