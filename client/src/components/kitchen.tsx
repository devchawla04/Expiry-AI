import { Link } from "react-router-dom";
import { expiryLabel, freshnessCopy, quantityLabel, storageCopy } from "../lib/format";
import type { Freshness, Product } from "../lib/types";

const pillClass: Record<Freshness, string> = {
  today: "bg-[#fde8e2] text-clay",
  soon: "bg-[#fff1d6] text-amber",
  week: "bg-[#e7f6ea] text-forest",
  fresh: "bg-forest-soft text-forest",
  expired: "bg-ink text-white",
  undated: "bg-paper text-muted",
  consumed: "bg-forest-soft text-forest",
  discarded: "bg-paper text-muted",
};

export function FreshPill({ freshness }: { freshness: Freshness }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${pillClass[freshness]}`}>{freshnessCopy(freshness)}</span>;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/app/pantry/${product.id}`} className="flex gap-3 rounded-3xl border border-line bg-card p-3 shadow-card">
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-paper text-sm font-medium text-forest">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          (product.category ?? "Food").slice(0, 1)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{product.name}</p>
            <p className="truncate text-sm text-muted">
              {[product.brand, quantityLabel(product), storageCopy(product.storageLocation)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <FreshPill freshness={product.freshness} />
        </div>
        <p className="mt-2 text-sm">{expiryLabel(product.daysRemaining)}</p>
      </div>
    </Link>
  );
}
