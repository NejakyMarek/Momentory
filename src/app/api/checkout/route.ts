import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { priceOf, VARIANT_LABEL, AlbumVariant, PageCount } from "@/lib/products";

type CartItem = { variant: AlbumVariant; pages: PageCount; quantity: number; };

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: CartItem[] };
    if (!items?.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });

    const line_items = items.map(it => ({
      quantity: it.quantity,
      price_data: {
        currency: "eur",
        unit_amount: priceOf(it.variant, it.pages),
        product_data: { name: `${VARIANT_LABEL[it.variant]} – ${it.pages} strán` },
      },
    }));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}