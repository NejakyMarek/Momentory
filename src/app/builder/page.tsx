'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import { startCheckout } from '@/lib/checkout';
import {
  variantOptions,
  PAGES,
  priceOf,
  type AlbumVariant,
  type PageCount,
} from '@/lib/products';

// Uploader je len na klientovi
const Uploader = dynamic(() => import('@/components/Uploader'), { ssr: false });

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BuilderPage() {
  // stav
  const [variant, setVariant] = useState<AlbumVariant>('basic');
  const [pages, setPages] = useState<PageCount>(16);
  const [photos, setPhotos] = useState<string[]>([]);

  const price = priceOf(variant, pages); // v centoch

  // klik na "Zaplatiť (test)"
  const handleCheckout = async () => {
    if (photos.length === 0) {
      alert('Najprv nahraj aspoň 1 fotku a v okne uploadu stlač "Done".');
      return;
    }

    try {
      // 1) uložiť projekt
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant, pages, photos }),
      });

      if (!res.ok) {
        // keď server spadne, často vráti HTML. Skúsme z toho vytiahnuť zmysluplnú správu.
        const isJson = res.headers.get('content-type')?.includes('application/json');
        const msg = isJson ? (await res.json()).error : await res.text();
        alert('Save failed: ' + msg);
        return;
      }

      const { id } = (await res.json()) as { id: string };

      // 2) Stripe checkout (pošleme aj projectId)
      await startCheckout({ variant, pages, quantity: 1, projectId: id });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(e);
      alert('Checkout error: ' + msg);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ fontSize: 28, letterSpacing: -0.2 }}>Vyber štýl + počet strán + nahraj fotky</h2>

      <Card>
        <CardHeader>
          <CardTitle>Variant fotoalbumu</CardTitle>
          <CardDescription>Vyber si vzhľad, ktorý ti sedí.</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
            {variantOptions().map((opt) => (
              <Button
                key={opt.value}
                variant={variant === opt.value ? 'default' : 'outline'}
                onClick={() => setVariant(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Počet strán</CardTitle>
          <CardDescription>Viac strán = viac spomienok.</CardDescription>
        </CardHeader>
        <CardContent>
          <label style={{ display: 'block', marginBottom: 8 }}>Počet strán</label>
          <select
            value={String(pages)}
            onChange={(e) => setPages(Number(e.target.value) as PageCount)}
            style={{
              border: '1px solid var(--input)',
              background: 'transparent',
              padding: '8px 12px',
              borderRadius: 8
            }}
          >
            {PAGES.map((p) => (
              <option key={p} value={String(p)}>
                {p}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotky</CardTitle>
          <CardDescription>Nahraj aspoň jednu fotku.</CardDescription>
        </CardHeader>
        <CardContent>
          <Uploader onChange={setPhotos} />
          {photos.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {photos.slice(0, 12).map((url, i) => (
                  <img
                    key={i}
                    src={`${url}/-/preview/300x300/-/quality/smart/`}
                    alt={`photo-${i + 1}`}
                    width={300}
                    height={300}
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                ))}
              </div>
              {photos.length > 12 && (
                <div style={{ marginTop: 8, opacity: 0.7 }}>…a ďalšie</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              Cena: <b>{(price / 100).toFixed(2)} €</b>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="outline" onClick={() => alert('Editor pridáme v ďalšom kroku')}>
                Pokračovať do editora
              </Button>
              <Button onClick={handleCheckout}>Zaplatiť (test)</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}