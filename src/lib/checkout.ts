import { type AlbumVariant, type PageCount } from '@/lib/products';

type CheckoutItem = {
  variant: AlbumVariant;
  pages: PageCount;
  quantity: number;
};

type CheckoutMeta = {
  projectId?: string; // ← doplnené
};

export async function startCheckout(
  { variant, pages, quantity, projectId }: CheckoutItem & CheckoutMeta
) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ variant, pages, quantity }],
      meta: projectId ? { projectId } : {}, // ← pošleme do API
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Checkout failed: ' + txt);
  }

  const { url } = await res.json();
  window.location.href = url;
}