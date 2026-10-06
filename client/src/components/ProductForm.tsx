import { useState, type FormEvent, type ReactNode } from "react";
import { Banner, Button, controlClass, Field } from "./ui";
import { CATEGORIES, num } from "../lib/format";
import type { FormState } from "../lib/types";

export function ProductForm({
  initial,
  imageUrl,
  scanId,
  notice,
  submitLabel,
  onSubmit,
}: {
  initial: FormState;
  imageUrl?: string | null;
  scanId?: string | null;
  notice?: ReactNode;
  submitLabel: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit({
        name: values.name,
        brand: values.brand,
        category: values.category,
        quantity: num(values.quantity),
        unit: values.unit,
        price: num(values.price),
        expiryDate: values.expiryDate || null,
        purchaseDate: values.purchaseDate || null,
        openedDate: values.openedDate || null,
        useByDate: values.useByDate || null,
        manufactureDate: values.manufactureDate || null,
        storageLocation: values.storageLocation,
        ingredients: values.ingredients,
        allergens: values.allergens
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: values.notes,
        barcode: values.barcode,
        batch: values.batch,
        imageUrl: imageUrl || values.imageUrl || null,
        scanId: scanId ?? null,
        nutrition: {
          servingSize: values.servingSize,
          calories: num(values.calories),
          protein: num(values.protein),
          carbohydrates: num(values.carbohydrates),
          fat: num(values.fat),
          sugar: num(values.sugar),
          sodium: num(values.sodium),
          fiber: num(values.fiber),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {notice}
      {imageUrl ? <img src={imageUrl} alt="Product" className="max-h-64 w-full rounded-3xl object-cover" /> : null}
      {error ? <Banner tone="bad">{error}</Banner> : null}
      <div className="grid gap-4 rounded-3xl border border-line bg-card p-4 shadow-card md:grid-cols-2">
        <Field label="Product name">
          <input className={controlClass} value={values.name} onChange={(event) => set("name", event.target.value)} required />
        </Field>
        <Field label="Brand">
          <input className={controlClass} value={values.brand} onChange={(event) => set("brand", event.target.value)} />
        </Field>
        <Field label="Category">
          <select className={controlClass} value={values.category} onChange={(event) => set("category", event.target.value)}>
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label="Where it lives">
          <select
            className={controlClass}
            value={values.storageLocation}
            onChange={(event) => set("storageLocation", event.target.value as FormState["storageLocation"])}
          >
            <option value="pantry">Pantry</option>
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
          </select>
        </Field>
        <Field label="Quantity">
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <input className={controlClass} inputMode="decimal" value={values.quantity} onChange={(event) => set("quantity", event.target.value)} />
            <input className={controlClass} value={values.unit} onChange={(event) => set("unit", event.target.value)} />
          </div>
        </Field>
        <Field label="Price">
          <input className={controlClass} inputMode="decimal" value={values.price} onChange={(event) => set("price", event.target.value)} />
        </Field>
        <Field label="Expiry or best before" hint="Confirm this yourself. A scan can misread a date.">
          <input className={controlClass} type="date" value={values.expiryDate} onChange={(event) => set("expiryDate", event.target.value)} />
        </Field>
        <Field label="Finish-by reminder" hint="Use this when an opened jar should go sooner than the printed date.">
          <input className={controlClass} type="date" value={values.useByDate} onChange={(event) => set("useByDate", event.target.value)} />
        </Field>
      </div>

      <div className="rounded-3xl border border-line bg-card p-4 shadow-card">
        <h2 className="font-display text-2xl">Nutrition label</h2>
        <p className="mb-4 text-sm text-muted">Per serving, as printed. This is a label reading, not dietary advice.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["servingSize", "Serving"],
              ["calories", "Calories"],
              ["protein", "Protein g"],
              ["carbohydrates", "Carbs g"],
              ["fat", "Fat g"],
              ["sugar", "Sugar g"],
              ["sodium", "Sodium mg"],
              ["fiber", "Fiber g"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input className={controlClass} value={values[key]} onChange={(event) => set(key, event.target.value)} />
            </Field>
          ))}
        </div>
      </div>

      <details className="rounded-3xl border border-line bg-card p-4 shadow-card">
        <summary className="cursor-pointer font-medium">More details</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Purchased">
            <input className={controlClass} type="date" value={values.purchaseDate} onChange={(event) => set("purchaseDate", event.target.value)} />
          </Field>
          <Field label="Opened">
            <input className={controlClass} type="date" value={values.openedDate} onChange={(event) => set("openedDate", event.target.value)} />
          </Field>
          <Field label="Manufactured">
            <input className={controlClass} type="date" value={values.manufactureDate} onChange={(event) => set("manufactureDate", event.target.value)} />
          </Field>
          <Field label="Batch">
            <input className={controlClass} value={values.batch} onChange={(event) => set("batch", event.target.value)} />
          </Field>
          <Field label="Barcode">
            <input className={controlClass} value={values.barcode} onChange={(event) => set("barcode", event.target.value)} />
          </Field>
          <Field label="Allergens" hint="Separate with commas">
            <input className={controlClass} value={values.allergens} onChange={(event) => set("allergens", event.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Ingredients">
              <textarea className={controlClass} rows={3} value={values.ingredients} onChange={(event) => set("ingredients", event.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Notes">
              <textarea className={controlClass} rows={2} value={values.notes} onChange={(event) => set("notes", event.target.value)} />
            </Field>
          </div>
        </div>
      </details>
      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

export function productToForm(product: {
  name: string;
  brand?: string | null;
  category?: string | null;
  quantity?: number | null;
  unit?: string | null;
  price?: number | null;
  expiryDate?: string | null;
  purchaseDate?: string | null;
  openedDate?: string | null;
  useByDate?: string | null;
  manufactureDate?: string | null;
  storageLocation: FormState["storageLocation"];
  ingredients?: string | null;
  allergens?: string[];
  notes?: string | null;
  barcode?: string | null;
  batch?: string | null;
  imageUrl?: string | null;
  nutrition?: {
    servingSize?: string | null;
    calories?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    sugar?: number | null;
    sodium?: number | null;
    fiber?: number | null;
  } | null;
}): FormState {
  const text = (value?: string | number | null) => (value == null ? "" : String(value));
  return {
    name: product.name,
    brand: product.brand ?? "",
    category: product.category || "Other",
    quantity: text(product.quantity),
    unit: product.unit ?? "",
    price: text(product.price),
    expiryDate: product.expiryDate ?? "",
    purchaseDate: product.purchaseDate ?? "",
    openedDate: product.openedDate ?? "",
    useByDate: product.useByDate ?? "",
    manufactureDate: product.manufactureDate ?? "",
    storageLocation: product.storageLocation,
    ingredients: product.ingredients ?? "",
    allergens: (product.allergens ?? []).join(", "),
    notes: product.notes ?? "",
    barcode: product.barcode ?? "",
    batch: product.batch ?? "",
    imageUrl: product.imageUrl ?? "",
    servingSize: product.nutrition?.servingSize ?? "",
    calories: text(product.nutrition?.calories),
    protein: text(product.nutrition?.protein),
    carbohydrates: text(product.nutrition?.carbohydrates),
    fat: text(product.nutrition?.fat),
    sugar: text(product.nutrition?.sugar),
    sodium: text(product.nutrition?.sodium),
    fiber: text(product.nutrition?.fiber),
  };
}
