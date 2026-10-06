import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { ProductForm } from "../components/ProductForm";
import { Banner, Button, controlClass, Field, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import { emptyForm, similarProducts } from "../lib/format";
import { refreshKitchen } from "../lib/kitchen";
import type { Extracted, FormState, Product, ScanResult } from "../lib/types";

export function Scan() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const scanner = useRef<Html5Qrcode | null>(null);
  const [mode, setMode] = useState<"label" | "barcode">("label");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [review, setReview] = useState<{ result: ScanResult; form: FormState } | null>(null);
  const pantry = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => api<Product[]>("/api/products?status=active"),
  });

  async function onFile(next: File | null) {
    setFile(next);
    setReview(null);
    setError("");
    if (!next) {
      setPreview(null);
      return;
    }
    try {
      const shrunk = await shrinkImage(next);
      setFile(shrunk);
      setPreview(URL.createObjectURL(shrunk));
    } catch {
      setFile(next);
      setPreview(URL.createObjectURL(next));
    }
  }

  async function readLabel() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const result = await api<ScanResult>("/api/scans/label", { method: "POST", body });
      setReview({ result, form: extractedToForm(result.extracted) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that photo");
    } finally {
      setBusy(false);
    }
  }

  async function lookup(raw: string) {
    setBusy(true);
    setError("");
    try {
      const result = await api<ScanResult>("/api/scans/barcode", { method: "POST", body: { code: raw } });
      setReview({ result, form: extractedToForm(result.extracted) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  async function startCamera() {
    setError("");
    const instance = new Html5Qrcode("barcode-region", {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
    });
    scanner.current = instance;
    try {
      await instance.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 140 } },
        async (text) => {
          await stopCamera();
          setCode(text);
          await lookup(text);
        },
        () => undefined,
      );
      setCameraOn(true);
    } catch {
      setError("Camera permission is needed, or type the barcode instead.");
      setCameraOn(false);
    }
  }

  async function stopCamera() {
    if (scanner.current?.isScanning) await scanner.current.stop();
    scanner.current?.clear();
    scanner.current = null;
    setCameraOn(false);
  }

  const matches = review ? similarProducts(review.form.name, pantry.data ?? []) : [];

  return (
    <div>
      <PageHeader title="Scan" text="Read a label with AI, or look the product up from its barcode. You always confirm the expiry." />
      <div className="mb-4 grid grid-cols-2 rounded-full bg-card p-1">
        {(["label", "barcode"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-full py-2 text-sm font-medium ${mode === item ? "bg-forest text-white" : ""}`}
            onClick={() => {
              setMode(item);
              void stopCamera();
            }}
          >
            {item === "label" ? "Photo of label" : "Barcode"}
          </button>
        ))}
      </div>
      {error ? (
        <div className="mb-4">
          <Banner tone="bad">{error}</Banner>
        </div>
      ) : null}

      {mode === "label" ? (
        <div className="grid gap-4">
          <label className="grid cursor-pointer place-items-center rounded-[2rem] border border-dashed border-line bg-card px-4 py-10 text-center">
            <span className="font-medium">Take a photo or choose one</span>
            <span className="mt-1 text-sm text-muted">JPEG, PNG, or WebP. Include the expiry and nutrition panel if you can.</span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {preview ? <img src={preview} alt="Label preview" className="max-h-72 w-full rounded-[2rem] object-cover" /> : null}
          <Button type="button" onClick={() => void readLabel()} disabled={!file || busy}>
            {busy ? "Reading label…" : "Read label"}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div id="barcode-region" className="overflow-hidden rounded-[2rem] bg-ink/5" />
          <div className="flex flex-wrap gap-2">
            {cameraOn ? (
              <Button type="button" variant="ghost" onClick={() => void stopCamera()}>
                Stop camera
              </Button>
            ) : (
              <Button type="button" onClick={() => void startCamera()}>
                Start camera
              </Button>
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void lookup(code);
            }}
          >
            <Field label="Or type the barcode">
              <input className={controlClass} value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" />
            </Field>
          </form>
          <Button type="button" onClick={() => void lookup(code)} disabled={busy || code.trim().length < 8}>
            {busy ? "Looking up…" : "Look up"}
          </Button>
        </div>
      )}

      {review ? (
        <div className="mt-8">
          <ProductForm
            key={review.result.scanId}
            initial={review.form}
            imageUrl={review.result.imageUrl}
            scanId={review.result.scanId}
            submitLabel="Save to pantry"
            notice={
              <div className="grid gap-3">
                <Banner tone={review.result.extracted.confidence.expiryDate === "high" ? "info" : "warn"}>
                  {review.result.warning ||
                    "Check the expiry before saving. ShelfSense will not guess a date it could not read."}
                </Banner>
                {matches.length ? (
                  <Banner tone="warn">
                    You already have {matches.length} similar item{matches.length === 1 ? "" : "s"}:{" "}
                    {matches
                      .slice(0, 3)
                      .map((item) => item.name)
                      .join(", ")}
                    .
                  </Banner>
                ) : null}
              </div>
            }
            onSubmit={async (payload) => {
              const saved = await api<Product>("/api/products", { method: "POST", body: payload });
              await refreshKitchen(client);
              navigate(`/app/pantry/${saved.id}`);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function extractedToForm(extracted: Extracted): FormState {
  const base = emptyForm();
  const text = (value: string | number | null | undefined) => (value == null ? "" : String(value));
  return {
    ...base,
    name: extracted.name ?? "",
    brand: extracted.brand ?? "",
    category: extracted.category ?? "Other",
    quantity: text(extracted.quantity),
    unit: extracted.unit ?? base.unit,
    expiryDate: extracted.expiryDate ?? "",
    manufactureDate: extracted.manufactureDate ?? "",
    storageLocation: extracted.storageLocation ?? "pantry",
    ingredients: extracted.ingredients ?? "",
    allergens: (extracted.allergens ?? []).join(", "),
    barcode: extracted.barcode ?? "",
    batch: extracted.batch ?? "",
    imageUrl: extracted.imageUrl ?? "",
    servingSize: extracted.nutrition.servingSize ?? "",
    calories: text(extracted.nutrition.calories),
    protein: text(extracted.nutrition.protein),
    carbohydrates: text(extracted.nutrition.carbohydrates),
    fat: text(extracted.nutrition.fat),
    sugar: text(extracted.nutrition.sugar),
    sodium: text(extracted.nutrition.sodium),
    fiber: text(extracted.nutrition.fiber),
  };
}

async function shrinkImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) return file;
  return new File([blob], "label.jpg", { type: "image/jpeg" });
}
