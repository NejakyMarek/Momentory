// Debug endpoint to check database state
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    // Get all projects
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        variant: true,
        pages: true,
        status: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get all orders
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        stripeSessionId: true,
        projectId: true,
        paymentStatus: true,
        amountTotal: true,
        currency: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            variant: true,
            pages: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // If sessionId provided, check specific order
    let specificOrder = null;
    if (sessionId) {
      specificOrder = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          project: true
        }
      });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      projects: {
        count: projects.length,
        items: projects
      },
      orders: {
        count: orders.length,
        items: orders
      },
      specificOrder: sessionId ? {
        found: !!specificOrder,
        data: specificOrder
      } : null
    });
  } catch (error) {
    console.error('[debug-orders] Error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
