"use client";
import { useState } from "react";
import {
  variantOptions, PAGES, priceOf,
  type AlbumVariant, type PageCount
} from "@/lib/products";
import { startCheckout } from "@/lib/checkout";
import Uploader from "@/components/Uploader";
import { saveProject } from "@/lib/utils";

export default function BuilderPage() {
  const [variant, setVariant] = useState<AlbumVariant>("basic");
  const [pages, setPages] = useState<PageCount>(16);
  const [photos, setPhotos] = useState<string[]>([]); // CDN URL z Uploadcare
  const price = priceOf(variant, pages);

  const handleCheckout = async () => {
    // uložím lokálne, nech to vieme použiť v editore/PDF neskôr
    saveProject({ variant, pages, photos });
    await startCheckout([{ variant, pages, quantity: 1 }]);
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2>Vyber štýl + počet strán + nahraj fotky</h2>

      {/* Výber variantu */}
      <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(2,minmax(0,1fr))", marginTop: 12}}>
        {variantOptions().map(opt => (
          <button key={opt.value}
            onClick={() => setVariant(opt.value)}
            style={{
              padding: 12, border: "1px solid #333", borderRadius: 8,
              background: variant===opt.value ? "#111" : "#222", color:"#fff"
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
      <div style={{ marginTop: 16 }}>
        Cena: <b>{(price / 100).toFixed(2)} €</b>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button onClick={() => alert("Editor (auto-rozloženie) pridáme v ďalšom kroku")}>
          Pokračovať do editora
        </button>

        <button
          disabled={photos.length === 0}
          onClick={handleCheckout}
          title={photos.length === 0 ? "Najprv nahraj aspoň 1 fotku" : "OK"}
        >
          Zaplatiť (test)
        </button>
      </div>
    </main>
  );
}