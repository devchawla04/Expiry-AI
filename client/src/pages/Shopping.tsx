import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banner, Button, controlClass, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import type { ShoppingList } from "../lib/types";

export function Shopping() {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const list = useQuery({ queryKey: ["shopping"], queryFn: () => api<ShoppingList>("/api/shopping") });
  const refresh = () => client.invalidateQueries({ queryKey: ["shopping"] });
  const add = useMutation({
    mutationFn: (body: { name: string; source?: string }) => api("/api/shopping", { method: "POST", body }),
    onSuccess: async () => {
      setName("");
      await refresh();
    },
  });
  const toggle = useMutation({
    mutationFn: (item: { id: string; checked: boolean }) => api(`/api/shopping/${item.id}`, { method: "PATCH", body: { checked: item.checked } }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/shopping/${id}`, { method: "DELETE" }),
    onSuccess: refresh,
  });

  return (
    <div>
      <PageHeader title="Shopping" text="A list for the next shop, plus foods you tend to finish and have not replaced." />
      <form
        className="mb-5 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) add.mutate({ name: name.trim() });
        }}
      >
        <input className={controlClass} placeholder="Add milk, eggs, rice…" value={name} onChange={(event) => setName(event.target.value)} />
        <Button type="submit" disabled={add.isPending}>
          Add
        </Button>
      </form>
      {list.isError ? <Banner tone="bad">The list could not be loaded.</Banner> : null}
      <div className="grid gap-2">
        {(list.data?.items ?? []).map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card px-3 py-3">
            <input type="checkbox" checked={item.checked} onChange={(event) => toggle.mutate({ id: item.id, checked: event.target.checked })} />
            <span className={`flex-1 ${item.checked ? "text-muted line-through" : ""}`}>{item.name}</span>
            <button type="button" className="text-sm text-muted" onClick={() => remove.mutate(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      {list.data?.suggestions.length ? (
        <section className="mt-6">
          <h2 className="font-display text-2xl">You may be out</h2>
          <p className="mb-3 text-sm text-muted">Based on foods you have used and do not currently have.</p>
          <div className="flex flex-wrap gap-2">
            {list.data.suggestions.map((item) => (
              <Button key={item.name} type="button" variant="secondary" onClick={() => add.mutate({ name: item.name, source: "suggestion" })}>
                Add {item.name}
              </Button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
