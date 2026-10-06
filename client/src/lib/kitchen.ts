import type { QueryClient } from "@tanstack/react-query";

export function refreshKitchen(client: QueryClient) {
  return Promise.all([
    client.invalidateQueries({ queryKey: ["products"] }),
    client.invalidateQueries({ queryKey: ["insights"] }),
    client.invalidateQueries({ queryKey: ["recipes"] }),
    client.invalidateQueries({ queryKey: ["shopping"] }),
  ]);
}
