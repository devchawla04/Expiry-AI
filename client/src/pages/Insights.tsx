import { useQuery } from "@tanstack/react-query";
import { Banner, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { money } from "../lib/format";
import type { Insights as InsightsData } from "../lib/types";

export function Insights() {
  const { user } = useAuth();
  const insights = useQuery({ queryKey: ["insights"], queryFn: () => api<InsightsData>("/api/insights") });
  if (insights.isLoading) return <p className="text-muted">Adding up the kitchen…</p>;
  if (!insights.data) return <Banner tone="bad">Insights are unavailable.</Banner>;
  const data = insights.data;
  const currency = user?.currency;
  const max = Math.max(...data.trend.map((item) => item.wasted), 1);

  return (
    <div>
      <PageHeader title="Insights" text="A plain estimate from the prices you entered. It is not a receipt audit." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Kept from waste" value={money(data.value.savedAllTime, currency)} />
        <Tile label="This month" value={money(data.value.savedThisMonth, currency)} />
        <Tile label="Tossed this month" value={money(data.value.wastedThisMonth, currency)} />
        <Tile label="Still at risk" value={money(data.value.atRisk, currency)} />
      </section>
      {data.wasteChangePct != null ? (
        <div className="mt-4">
          <Banner tone={data.wasteChangePct >= 0 ? "info" : "warn"}>
            {data.wasteChangePct >= 0
              ? `Estimated tossed value is down ${data.wasteChangePct}% from last month.`
              : `Estimated tossed value is up ${Math.abs(data.wasteChangePct)}% from last month.`}
          </Banner>
        </div>
      ) : null}
      <section className="mt-6 rounded-[2rem] border border-line bg-card p-5">
        <h2 className="font-display text-2xl">Tossed value</h2>
        <div className="mt-4 grid grid-cols-6 items-end gap-2">
          {data.trend.map((item) => (
            <div key={item.month} className="text-center">
              <div className="mx-auto flex h-28 items-end">
                <div className="w-full rounded-t-xl bg-forest" style={{ height: `${Math.max(8, (item.wasted / max) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <Tile label="Used in time" value={String(data.counts.onTime)} />
        <Tile label="Tossed items" value={String(data.counts.discarded)} />
        <Tile label="Streak" value={`${data.streak} day${data.streak === 1 ? "" : "s"}`} />
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}
