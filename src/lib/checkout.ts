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
    const contentType = res.headers.get('content-type') || '';
    const msg = contentType.includes('application/json')
      ? (await res.json()).error
      : await res.text();
    throw new Error('Checkout failed: ' + (msg || res.statusText));
  }

  const { url } = await res.json();
  if (typeof url !== 'string' || url.length < 10) {
    throw new Error('Invalid checkout URL returned');
  }
  window.location.href = url;
}