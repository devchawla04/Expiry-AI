import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-sm font-medium text-forest">{eyebrow}</p> : null}
        <h1 className="font-display text-4xl leading-tight text-ink">{title}</h1>
        {text ? <p className="mt-2 max-w-xl text-muted">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-forest text-white hover:bg-forest-deep",
    secondary: "bg-gold text-ink hover:bg-[#f3d7a8]",
    ghost: "bg-white text-ink border border-line hover:bg-paper",
    danger: "bg-clay text-white hover:bg-[#a83b20]",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  "w-full rounded-2xl border border-line bg-white px-3 py-2.5 text-sm outline-none ring-forest/30 focus:ring-4";

export function Banner({ tone = "info", children }: { tone?: "info" | "warn" | "bad"; children: ReactNode }) {
  const styles = {
    info: "bg-forest-soft text-forest-deep",
    warn: "bg-[#fff4df] text-[#8a5a10]",
    bad: "bg-[#fde8e2] text-[#8d331c]",
  }[tone];
  return <div className={`rounded-2xl px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card">
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy} type="button">
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-10 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
