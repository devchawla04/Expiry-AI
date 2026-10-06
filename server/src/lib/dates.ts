export function formatISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO() {
  return formatISODate(new Date());
}

export function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function isISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return date.toISOString().slice(0, 10) === value;
}

export function daysUntil(iso: string | null | undefined) {
  if (!iso) return null;
  const today = todayISO();
  const [ty, tm, td] = today.split("-").map(Number);
  const [y, m, d] = iso.split("-").map(Number);
  const a = Date.UTC(ty, (tm ?? 1) - 1, td ?? 1);
  const b = Date.UTC(y, (m ?? 1) - 1, d ?? 1);
  return Math.round((b - a) / 86400000);
}

export function earlierDate(a?: string | null, b?: string | null) {
  const dates = [a, b].filter((value): value is string => Boolean(value));
  if (!dates.length) return null;
  return [...dates].sort()[0];
}

export function daysAgo(n: number) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(12, 0, 0, 0);
  return date;
}
