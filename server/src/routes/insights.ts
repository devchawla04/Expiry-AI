import { Router } from "express";
import { asyncHandler } from "../http.js";
import { formatISODate } from "../lib/dates.js";
import { presentProduct } from "../lib/present.js";
import { levelFor, monthKey, monthLabel, onTime, recentMonthKeys, streakFrom } from "../lib/progress.js";
import { requireAuth } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { Scan } from "../models/Scan.js";

const router = Router();
router.use(requireAuth);

function sumPrices(items: { price?: number | null }[]) {
  return items.reduce((total, item) => total + (item.price ?? 0), 0);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const [products, scanCount] = await Promise.all([Product.find({ userId }), Scan.countDocuments({ userId })]);
    const presented = products.map((product) => presentProduct(product));
    const active = presented.filter((item) => item.status === "active");
    const consumed = products.filter((item) => item.status === "consumed");
    const discarded = products.filter((item) => item.status === "discarded");

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const saved = consumed.filter((item) => onTime(item.consumedAt, item.expiryDate) || (!item.expiryDate && item.consumedAt));
    const savedThisMonth = saved.filter((item) => item.consumedAt && item.consumedAt >= monthStart);
    const wastedThisMonth = discarded.filter((item) => item.discardedAt && item.discardedAt >= monthStart);
    const wastedLastMonth = discarded.filter(
      (item) => item.discardedAt && item.discardedAt >= lastMonthStart && item.discardedAt < monthStart,
    );

    const trend = recentMonthKeys(6).map((key) => ({
      month: key,
      label: monthLabel(key),
      wasted: sumPrices(discarded.filter((item) => item.discardedAt && monthKey(item.discardedAt) === key)),
    }));

    const last = sumPrices(wastedLastMonth);
    const current = sumPrices(wastedThisMonth);
    const wasteChangePct = last > 0 ? Math.round(((last - current) / last) * 100) : null;

    const streak = streakFrom(
      consumed
        .filter((item) => item.consumedAt && item.expiryDate && formatISODate(item.consumedAt) <= item.expiryDate)
        .map((item) => formatISODate(item.consumedAt as Date)),
    );

    const onTimeCount = consumed.filter((item) => item.consumedAt && item.expiryDate && formatISODate(item.consumedAt) <= item.expiryDate).length;
    const xp = onTimeCount * 25 + consumed.length * 8 + scanCount * 10;
    const level = levelFor(xp);

    const badges = [
      { id: "first-scan", name: "Label reader", detail: "Scan your first product", earned: scanCount >= 1 },
      { id: "scan-10", name: "Sharp eyes", detail: "Scan 10 products", earned: scanCount >= 10 },
      { id: "saver-5", name: "Waste reducer", detail: "Use 5 foods before expiry", earned: onTimeCount >= 5 },
      { id: "saver-20", name: "Food saver", detail: "Use 20 foods before expiry", earned: onTimeCount >= 20 },
      { id: "streak-7", name: "Seven-day streak", detail: "Use something in time for 7 days", earned: streak >= 7 },
      { id: "stocked", name: "Full shelf", detail: "Keep 12 active foods", earned: active.length >= 12 },
      {
        id: "clean-month",
        name: "Clean month",
        detail: "Use food this month without tossing any",
        earned: wastedThisMonth.length === 0 && savedThisMonth.length >= 3,
      },
    ];

    const storage = { pantry: 0, fridge: 0, freezer: 0 };
    for (const item of active) {
      const key = item.storageLocation as keyof typeof storage;
      if (key in storage) storage[key] += 1;
    }

    res.json({
      counts: {
        active: active.length,
        expiringSoon: active.filter((item) => item.daysRemaining != null && item.daysRemaining >= 0 && item.daysRemaining <= 3).length,
        expired: active.filter((item) => item.freshness === "expired").length,
        consumed: consumed.length,
        discarded: discarded.length,
        onTime: onTimeCount,
      },
      value: {
        pantry: sumPrices(active),
        atRisk: sumPrices(active.filter((item) => item.daysRemaining != null && item.daysRemaining >= 0 && item.daysRemaining <= 3)),
        savedAllTime: sumPrices(saved),
        savedThisMonth: sumPrices(savedThisMonth),
        wastedThisMonth: current,
        wastedLastMonth: last,
      },
      trend,
      wasteChangePct,
      streak,
      xp,
      level,
      badges,
      storage,
    });
  }),
);

export default router;
