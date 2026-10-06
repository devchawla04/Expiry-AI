import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Banner, Button, controlClass, Field, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { refreshKitchen } from "../lib/kitchen";
import type { Insights, User } from "../lib/types";

export function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const insights = useQuery({ queryKey: ["insights"], queryFn: () => api<Insights>("/api/insights") });
  const [name, setName] = useState(user?.name ?? "");
  const [currency, setCurrency] = useState(user?.currency ?? "INR");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const next = await api<User>("/api/auth/me", {
        method: "PATCH",
        body: {
          name,
          currency,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        },
      });
      setUser(next);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function refill() {
    await api("/api/auth/demo/reset", { method: "POST", body: {} });
    await refreshKitchen(client);
    setMessage("Demo kitchen refilled.");
  }

  const level = insights.data?.level;

  return (
    <div>
      <PageHeader title="Profile" text={user?.email} />
      {level ? (
        <section className="mb-5 rounded-[2rem] bg-forest p-5 text-white">
          <p className="text-sm text-white/75">{insights.data?.xp} XP · {insights.data?.streak}-day streak</p>
          <h2 className="font-display text-3xl">{level.name}</h2>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full bg-gold" style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </div>
          <p className="mt-2 text-sm text-white/80">{level.next ? `Next: ${level.next}` : "Top shelf."}</p>
        </section>
      ) : null}
      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-3">
        {(insights.data?.badges ?? []).map((badge) => (
          <div key={badge.id} className={`rounded-2xl border border-line p-3 ${badge.earned ? "bg-card" : "opacity-50"}`}>
            <p className="font-medium">{badge.name}</p>
            <p className="text-xs text-muted">{badge.detail}</p>
          </div>
        ))}
      </div>
      <form onSubmit={save} className="grid gap-4 rounded-[2rem] border border-line bg-card p-5">
        {message ? <Banner>{message}</Banner> : null}
        {error ? <Banner tone="bad">{error}</Banner> : null}
        <Field label="Name">
          <input className={controlClass} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Currency">
          <select className={controlClass} value={currency} onChange={(event) => setCurrency(event.target.value)}>
            {["INR", "USD", "EUR", "GBP"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Current password">
          <input className={controlClass} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        </Field>
        <Field label="New password">
          <input className={controlClass} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </Button>
          {user?.email === "dev@shelfsense.app" ? (
            <Button type="button" variant="secondary" onClick={() => void refill()}>
              Refill demo kitchen
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
