import { addDaysISO, formatISODate, todayISO } from "./dates.js";

const LEVELS = [
  { name: "Seedling", min: 0 },
  { name: "Pantry beginner", min: 80 },
  { name: "Waste reducer", min: 250 },
  { name: "Smart cook", min: 500 },
  { name: "Food saver", min: 900 },
  { name: "Zero-waste hero", min: 1500 },
];

export function levelFor(xp: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.min) current = level;
  }
  const next = LEVELS.find((level) => level.min > current.min) ?? null;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(1, (xp - current.min) / span) : 1;
  return { name: current.name, min: current.min, next: next?.name ?? null, nextAt: next?.min ?? null, progress };
}

export function streakFrom(dates: string[]) {
  const unique = [...new Set(dates)].sort().reverse();
  if (!unique.length) return 0;
  const today = todayISO();
  const yesterday = addDaysISO(today, -1);
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let count = 1;
  for (let i = 1; i < unique.length; i += 1) {
    if (unique[i] !== addDaysISO(unique[i - 1], -1)) break;
    count += 1;
  }
  return count;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, 1).toLocaleString("en-IN", { month: "short" });
}

export function recentMonthKeys(count = 6) {
  const keys: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    keys.push(monthKey(date));
  }
  return keys;
}

export function onTime(consumedAt: Date | null | undefined, expiryDate: string | null | undefined) {
  if (!consumedAt || !expiryDate) return false;
  return formatISODate(consumedAt) <= expiryDate;
}
