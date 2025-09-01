export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// 🔹 čo posiela klient
type Item = {
  variant: "cheap" | "basic" | "premium" | "ultra";
  pages: number;
  quantity?: number;
};

// 🔹 jednoduchý serverový cenník (ceny sú v CENTOCH)
function priceOfServer(variant: Item["variant"], pages: number): number {
  const base: Record<Item["variant"], number> = {
    cheap: 3900,    // 39.00 €
    basic: 7900,    // 79.00 €
    premium: 14900, // 149.00 €
    ultra: 39900,   // 399.00 €
  };
  const extra: Record<number, number> = {
    9: 0,
    16: 2000,  // +20 €
    24: 4000,  // +40 €
  };
  return (base[variant] ?? 7900) + (extra[pages] ?? 0);
}

export async function POST(req: NextRequest) {
  try {
    const { items, meta } = (await req.json()) as {
      items: Item[];
      meta?: Record<string, string>;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    // 🔹 pre Stripe priprav line_items s cenou v centoch
    const line_items = items.map((it) => ({
      quantity: it.quantity ?? 1,
      price_data: {
        currency: "eur",
        unit_amount: priceOfServer(it.variant, it.pages), // MUST: integer v centoch
        product_data: {
          name: `Album ${it.variant} – ${it.pages} strán`,
        },
      },
    }));

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["SK", "CZ", "DE", "AT"] },
      phone_number_collection: { enabled: true },
      metadata: meta ?? {}, // sem príde napr. { projectId }
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: e?.message || "Checkout failed" }, { status: 500 });
  }
}