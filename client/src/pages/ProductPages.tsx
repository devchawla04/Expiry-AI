import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductForm, productToForm } from "../components/ProductForm";
import { FreshPill } from "../components/kitchen";
import { Banner, Button, ConfirmDialog, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import { emptyForm, expiryLabel, isoDate, money, prettyDate, quantityLabel, storageCopy } from "../lib/format";
import { refreshKitchen } from "../lib/kitchen";
import { useAuth } from "../lib/auth";
import type { Product } from "../lib/types";

const hints: Record<string, string> = {
  Dairy: "Keep this cold. Once opened, finish it sooner than the printed date if the label says so.",
  Meat: "Cook it soon, or move it to the freezer and set a new reminder.",
  Produce: "Greens and berries fade fast. Keep them where you will see them.",
  Bakery: "Seal the bag. Freeze slices if you will not finish the loaf.",
  Frozen: "Stay frozen until you are ready. Note the day you thaw it.",
  Condiments: "The printed date is long. The opened date is the one to watch.",
};

export function NewProduct() {
  const navigate = useNavigate();
  const client = useQueryClient();
  return (
    <div>
      <PageHeader title="Add by hand" text="For the foods you already know, without a photo." />
      <ProductForm
        initial={{ ...emptyForm(), purchaseDate: isoDate() }}
        submitLabel="Save to pantry"
        onSubmit={async (payload) => {
          const product = await api<Product>("/api/products", { method: "POST", body: payload });
          await refreshKitchen(client);
          navigate(`/app/pantry/${product.id}`);
        }}
      />
    </div>
  );
}

export function EditProduct() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const product = useQuery({ queryKey: ["product", id], queryFn: () => api<Product>(`/api/products/${id}`) });
  if (product.isLoading) return <p className="text-muted">Loading…</p>;
  if (!product.data) return <Banner tone="bad">That product is gone.</Banner>;
  return (
    <div>
      <PageHeader title="Edit product" />
      <ProductForm
        key={product.data.id}
        initial={productToForm(product.data)}
        imageUrl={product.data.imageUrl}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          await api(`/api/products/${id}`, { method: "PATCH", body: payload });
          await refreshKitchen(client);
          navigate(`/app/pantry/${id}`);
        }}
      />
    </div>
  );
}

export function ProductDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { user } = useAuth();
  const [confirm, setConfirm] = useState<"discard" | "delete" | null>(null);
  const [windowDays, setWindowDays] = useState("5");
  const product = useQuery({ queryKey: ["product", id], queryFn: () => api<Product>(`/api/products/${id}`) });

  const act = useMutation({
    mutationFn: async (action: "consume" | "discard" | "open" | "delete" | "useBy") => {
      if (action === "delete") return api(`/api/products/${id}`, { method: "DELETE" });
      if (action === "useBy") {
        const current = product.data;
        if (!current) return null;
        const opened = current.openedDate || isoDate();
        const finish = isoDateFrom(opened, Number(windowDays));
        return api(`/api/products/${id}`, {
          method: "PATCH",
          body: { ...productToPayload(current), openedDate: opened, useByDate: finish },
        });
      }
      return api(`/api/products/${id}/${action}`, { method: "POST", body: {} });
    },
    onSuccess: async (_data, action) => {
      if (action === "delete") {
        await refreshKitchen(client);
        navigate("/app/pantry");
        return;
      }
      await refreshKitchen(client);
      await product.refetch();
      setConfirm(null);
    },
  });

  if (product.isLoading) return <p className="text-muted">Loading…</p>;
  if (product.isError || !product.data) return <Banner tone="bad">That product could not be found.</Banner>;
  const item = product.data;
  const active = item.status === "active";

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={item.brand || item.category || "Pantry"} title={item.name} action={<FreshPill freshness={item.freshness} />} />
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="max-h-72 w-full rounded-[2rem] object-cover" /> : null}
      <section className="grid gap-3 rounded-[2rem] border border-line bg-card p-5 shadow-card md:grid-cols-3">
        <Fact label="Timing" value={expiryLabel(item.daysRemaining)} />
        <Fact label="Printed expiry" value={prettyDate(item.expiryDate)} />
        <Fact label="Amount" value={quantityLabel(item) || "Not set"} />
        <Fact label="Price" value={item.price != null ? money(item.price, user?.currency) : "Not set"} />
        <Fact label="Storage" value={storageCopy(item.storageLocation)} />
        <Fact label="Opened" value={prettyDate(item.openedDate)} />
      </section>
      {item.useByDate ? <Banner tone="warn">Finish-by reminder: {prettyDate(item.useByDate)}. This can be sooner than the printed expiry.</Banner> : null}
      {item.nutritionScore != null ? (
        <section className="rounded-[2rem] border border-line bg-card p-5">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl">Label read</h2>
            <p className="font-display text-4xl text-forest">{item.nutritionScore}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
            <div className="h-full bg-forest" style={{ width: `${item.nutritionScore}%` }} />
          </div>
          <ul className="mt-3 grid gap-1 text-sm">
            {item.nutritionNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">An informal reading of the printed label. Not medical or dietary advice.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <Fact label="Calories" value={num(item.nutrition?.calories, "kcal")} />
            <Fact label="Protein" value={num(item.nutrition?.protein, "g")} />
            <Fact label="Carbs" value={num(item.nutrition?.carbohydrates, "g")} />
            <Fact label="Fat" value={num(item.nutrition?.fat, "g")} />
          </div>
        </section>
      ) : null}
      {hints[item.category ?? ""] ? <Banner>{hints[item.category ?? ""]}</Banner> : null}
      {item.ingredients ? (
        <section className="rounded-3xl bg-card p-5">
          <h2 className="font-medium">Ingredients</h2>
          <p className="mt-2 text-sm text-muted">{item.ingredients}</p>
          {item.allergens?.length ? <p className="mt-2 text-sm">Allergens: {item.allergens.join(", ")}</p> : null}
        </section>
      ) : null}
      {active ? (
        <div className="grid gap-3 rounded-3xl bg-card p-4">
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-sm">
              After opening, remind me in
              <select className="ml-2 rounded-full border border-line bg-white px-3 py-2" value={windowDays} onChange={(event) => setWindowDays(event.target.value)}>
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
              </select>
            </label>
            <Button type="button" variant="secondary" onClick={() => act.mutate("useBy")} disabled={act.isPending}>
              Set finish-by
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => act.mutate("consume")} disabled={act.isPending}>
              Mark used
            </Button>
            <Button type="button" variant="ghost" onClick={() => act.mutate("open")} disabled={act.isPending || Boolean(item.openedDate)}>
              {item.openedDate ? "Already opened" : "Mark opened"}
            </Button>
            <Link to={`/app/recipes?product=${item.id}`}>
              <Button type="button" variant="ghost">
                Find a meal
              </Button>
            </Link>
            <Link to={`/app/pantry/${item.id}/edit`}>
              <Button type="button" variant="ghost">
                Edit
              </Button>
            </Link>
            <Button type="button" variant="danger" onClick={() => setConfirm("discard")}>
              Toss
            </Button>
            <Button type="button" variant="ghost" onClick={() => setConfirm("delete")}>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <Banner>{item.status === "consumed" ? "You used this in time to count it as saved." : "This was marked as tossed."}</Banner>
      )}
      {act.isError ? <Banner tone="bad">{act.error instanceof Error ? act.error.message : "That did not work"}</Banner> : null}
      <ConfirmDialog
        open={confirm != null}
        title={confirm === "delete" ? "Delete this product?" : "Mark this as tossed?"}
        body={confirm === "delete" ? "It will leave your history as well." : "The price will count toward estimated waste."}
        confirmLabel={confirm === "delete" ? "Delete" : "Toss it"}
        danger
        busy={act.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => act.mutate(confirm === "delete" ? "delete" : "discard")}
      />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function num(value: number | null | undefined, unit: string) {
  return value == null ? "—" : `${value} ${unit}`;
}

function isoDateFrom(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function productToPayload(product: Product) {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    quantity: product.quantity,
    unit: product.unit,
    price: product.price,
    purchaseDate: product.purchaseDate,
    expiryDate: product.expiryDate,
    openedDate: product.openedDate,
    useByDate: product.useByDate,
    manufactureDate: product.manufactureDate,
    storageLocation: product.storageLocation,
    ingredients: product.ingredients,
    allergens: product.allergens ?? [],
    notes: product.notes,
    barcode: product.barcode,
    batch: product.batch,
    imageUrl: product.imageUrl,
    nutrition: product.nutrition,
  };
}
