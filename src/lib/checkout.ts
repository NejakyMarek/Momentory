import type { AlbumVariant, PageCount } from "@/lib/products";

export type CartItem = { variant: AlbumVariant; pages: PageCount; quantity: number };

export async function startCheckout(items: CartItem[]) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Checkout failed");

  if (data.url) window.location.href = data.url as string;
}