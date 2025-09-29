import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const projectId = session.metadata?.projectId;
    const stripeSessionId = session.id;
    const paymentStatus = session.payment_status || 'paid';
    const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : 0;
    const currency = (session.currency || 'eur').toLowerCase();


    try {
      if (projectId) {
        await prisma.$transaction([
          prisma.order.upsert({
            where: { stripeSessionId },
            update: {
              projectId,
              paymentStatus,
              amountTotal,
              currency,
            },
            create: {
              projectId,
              stripeSessionId,
              paymentStatus,
              amountTotal,
              currency,
            },
          }),
          prisma.project.update({
            where: { id: projectId },
            data: { status: 'paid' },
          }),
        ]);
      } else {
        console.warn('[stripe:webhook] Missing projectId in session.metadata; skipping order creation', {
          stripeSessionId,
        });
      }
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      return NextResponse.json({ error: `DB error: ${msg}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}


