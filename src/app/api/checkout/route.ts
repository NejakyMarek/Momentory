// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // máš v src/lib/stripe.ts
import { priceOf, type AlbumVariant, type PageCount } from '@/lib/products';

export const runtime = 'nodejs'; // Stripe potrebuje Node runtime
export const dynamic = 'force-dynamic';

type Item = {
  variant: AlbumVariant;
  pages: PageCount;
  quantity?: number;
};

type Body = {
  items: Item[];
  meta?: Record<string, string>; // napr. { projectId: '...' }
};

export async function POST(req: NextRequest) {
  try {
    const { items, meta }: Body = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
    }

    // prepočítaj položky na Stripe line_items
    const line_items = items.map((it) => {
      const amount = priceOf(it.variant, it.pages); // vracia cenu v centoch (integer)
      if (!Number.isFinite(amount) || amount < 50) {
        throw new Error(`Bad amount for ${it.variant}/${it.pages}: ${amount}`);
      }
      return {
        quantity: it.quantity ?? 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(amount), // v centoch
          product_data: {
            name: `Album ${it.variant} | ${it.pages} strán`,
          },
        },
      };
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ||
      'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      // sem pridáme projectId (alebo iné meta, keď pošleš)
      metadata: { ...(meta ?? {}) },
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['SK', 'CZ', 'DE', 'AT'] },
      phone_number_collection: { enabled: true },
    });
    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a session URL' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: unknown) {
    console.error('Checkout route error:', e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}