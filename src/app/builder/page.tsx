"use client";
import { useState } from "react";
import {
  variantOptions, PAGES, priceOf,
  type AlbumVariant, type PageCount
} from "@/lib/products";
import { startCheckout } from "@/lib/checkout";

export default function BuilderPage() {
  const [variant, setVariant] = useState<AlbumVariant>("basic");
  const [pages, setPages] = useState<PageCount>(16);
  const price = priceOf(variant, pages);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2>Vyber štýl + počet strán</h2>

      <div style={{
        display: "grid", gap: 12,
        gridTemplateColumns: "repeat(2,minmax(0,1fr))", marginTop: 12
      }}>
        {variantOptions().map(opt => (
          <button key={opt.value}
            onClick={() => setVariant(opt.value)}
            style={{
              padding: 12, border: "1px solid #333", borderRadius: 8,
              background: variant === opt.value ? "#111" : "#222", color: "#fff"
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Počet strán: </label>
        <select
          value={String(pages)}
          onChange={e => setPages(Number(e.target.value) as PageCount)}
        >
          {PAGES.map(p => <option key={p} value={String(p)}>{p}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 16 }}>
        Cena: <b>{(price / 100).toFixed(2)} €</b>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button onClick={() => alert("Editor pridáme v ďalšom kroku")}>
          Pokračovať do editora
        </button>

        <button
          onClick={() =>
            startCheckout([{ variant, pages, quantity: 1 }]).catch((e) =>
              alert("Checkout error: " + e.message)
            )
          }
        >
          Zaplatiť (test)
        </button>
      </div>
    </main>
  );
}