// Test endpoint to verify webhook configuration
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    
    console.log('[test-webhook] Received request:', {
      method: req.method,
      url: req.url,
      headers: {
        'content-type': headers['content-type'],
        'stripe-signature': headers['stripe-signature'],
        'user-agent': headers['user-agent'],
      },
      body: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
    });

    return NextResponse.json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      hasStripeSignature: !!headers['stripe-signature']
    });
  } catch (error) {
    console.error('[test-webhook] Error:', error);
    return NextResponse.json({ error: 'Test webhook failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test webhook endpoint is working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/test-webhook'
  });
}
