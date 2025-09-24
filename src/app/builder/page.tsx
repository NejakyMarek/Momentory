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
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>Vyber štýl + počet strán + nahraj fotky</h2>

      {/* Výber variantu */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0,1fr))', marginTop: 12 }}>
              {variantOptions().map((opt) => (
              <button
                key={opt.value}
                onClick={() => setVariant(opt.value)}
                style={{
                  padding: 12,
                  border: '1px solid #333',
                  borderRadius: 8,
                  background: variant === opt.value ? '#111' : '#000',
                  color: '#fff',
                }}
              >
                {opt.label}
              </button>
            ))}

      </div>

      {/* Počet strán */}
      <div style={{ marginTop: 16 }}>
        <label>Počet strán: </label>
        <select
          value={String(pages)}
          onChange={(e) => setPages(Number(e.target.value) as PageCount)}
        >
          {PAGES.map((p) => (
            <option key={p} value={String(p)}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Upload fotiek */}
      <div style={{ marginTop: 16 }}>
        <Uploader onChange={setPhotos} />
      </div>

      {/* Náhľady – zámerne <img>, nie next/image, nech sa netrápime s doménami */}
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

      {/* Cena */}
      <div style={{ marginTop: 16 }}>
        Cena: <b>{(price / 100).toFixed(2)} €</b>
      </div>

      {/* Akcie */}
      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <button onClick={() => alert('Editor pridáme v ďalšom kroku')}
                style={{ padding: 12, border: '1px solid #333', borderRadius: 8 }}>
          Pokračovať do editora
        </button>
        <button onClick={handleCheckout}
                style={{ padding: 12, border: '1px solid #333', borderRadius: 8 }}>
          Zaplatiť (test)
        </button>
      </div>
    </main>
  );
}