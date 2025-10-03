import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';

type SearchParams = {
  searchParams?: { session_id?: string };
};

export const dynamic = 'force-dynamic';

async function OrderDetails({ sessionId }: { sessionId: string }) {
  console.log('[success-page] sessionId:', sessionId);

  let order: null | {
    stripeSessionId: string;
    amountTotal: number;
    currency: string;
    paymentStatus: string;
    project: { id: string; variant: string; pages: number } | null;
  } = null;

  if (sessionId) {
    try {
      order = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        select: {
          stripeSessionId: true,
          amountTotal: true,
          currency: true,
          paymentStatus: true,
          project: { select: { id: true, variant: true, pages: true } },
        },
      });
      console.log('[success-page] order found:', !!order);
    } catch (err) {
      console.error('[success-page] DB error:', err);
    }
  }

  if (order) {
    return (
      <div style={{
        border: '1px solid #eee', borderRadius: 8, padding: 16, display: 'grid', gap: 8,
      }}>
        <div>
          <strong>Objednávka</strong>: {order.stripeSessionId}
        </div>
        <div>
          <strong>Suma</strong>: {(order.amountTotal / 100).toFixed(2)} {order.currency.toUpperCase()}
        </div>
        <div>
          <strong>Stav platby</strong>: {order.paymentStatus}
        </div>
        {order.project && (
          <div>
            <strong>Album</strong>: {order.project.variant} · {order.project.pages} strán
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ color: '#666' }}>
      Objednávka sa spracováva alebo sa ešte nenašla v databáze.
      <br />
      <small>Session ID: {sessionId}</small>
      <br />
      <small>Skúste obnoviť stránku za chvíľu, webhook môže trvať niekoľko sekúnd.</small>
    </div>
  );
}

export default async function Page({ searchParams }: SearchParams) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams?.session_id ?? '';

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>✅ Platba prebehla</h1>
      <p style={{ marginBottom: 16 }}>Ďakujeme. Rekapitulácia nákupu:</p>

      {sessionId ? (
        <Suspense fallback={
          <div style={{ color: '#666' }}>
            Načítavam detaily objednávky...
            <br />
            <small>Session ID: {sessionId}</small>
          </div>
        }>
          <OrderDetails sessionId={sessionId} />
        </Suspense>
      ) : (
        <div style={{ color: '#666' }}>
          Nepodarilo sa načítať objednávku. URL neobsahuje <code>session_id</code> parameter.
          <br />
          <small>Ak ste sa sem dostali zo Stripe, parameter by mal byť automaticky pridaný.</small>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/">🏠 Späť na úvod</Link>
      </div>
    </div>
  );
}
