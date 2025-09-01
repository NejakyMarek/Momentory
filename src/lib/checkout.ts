// typy si prispôsob, toto je minimum
type Item = { variant: string; pages: number; quantity: number };

export async function startCheckout(items: Item[], meta?: Record<string, string>) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, meta }),   // <── posielame meta
  });

  if (!res.ok) throw new Error(await res.text());
  const { url } = (await res.json()) as { url: string };
  // presmeruj na Stripe
  window.location.href = url;
}
