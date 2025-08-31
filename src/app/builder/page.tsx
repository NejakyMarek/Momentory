"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Uploader = dynamic(() => import("@/components/Uploader"), { ssr: false });

import {
  variantOptions, PAGES, priceOf,
  type AlbumVariant, type PageCount
} from "@/lib/products";
import { startCheckout } from "@/lib/checkout";
import { saveProject } from "@/lib/utils";

export default function BuilderPage() {
  const [variant, setVariant] = useState<AlbumVariant>("basic");
  const [pages, setPages] = useState<PageCount>(16);
  const [photos, setPhotos] = useState<string[]>([]);
  const price = priceOf(variant, pages);

  const handleCheckout = async () => {
    if (photos.length === 0) {
      alert('Najprv nahraj aspoň 1 fotku a v okne uploadu stlač "Done".');
      return;
    }
    try {
      saveProject({ variant, pages, photos });
      await startCheckout([{ variant, pages, quantity: 1 }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(e);
      alert("Checkout error: " + msg);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* ...zvyšok tvojho JSX... */}
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button onClick={() => alert("Editor pridáme v ďalšom kroku")}>
          Pokračovať do editora
        </button>
        <button onClick={handleCheckout}>Zaplatiť (test)</button>
      </div>
    </main>
  );
}


      {/* Počet strán */}
      <div style={{ marginTop: 16 }}>
        <label>Počet strán: </label>
        <select
          value={String(pages)}
          onChange={e => setPages(Number(e.target.value) as PageCount)}
        >
          {PAGES.map(p => <option key={p} value={String(p)}>{p}</option>)}
        </select>
      </div>

      {/* Upload fotiek */}
      <Uploader onChange={setPhotos} />

      {/* Náhľady */}
      
      {photos.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>Nahrané fotky: {photos.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {photos.slice(0, 12).map((url, i) => (
              <img key={i} src={`${url}-/preview/300x300/-/quality/smart/`} alt={`photo-${i}`} style={{ width: "100%", borderRadius: 8 }} />
            ))}
          </div>
          {photos.length > 12 && <div style={{ marginTop: 8, opacity: .7 }}>…a ďalšie</div>}
        </div>
      )}

      {/* Cena a akcie */}
