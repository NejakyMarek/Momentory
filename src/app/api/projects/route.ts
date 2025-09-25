// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { saveProject } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, variant, pages, photos } = body ?? {};

    if (!variant || typeof pages !== 'number' || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const savedId = await saveProject({ id, variant, pages, photos });
    return NextResponse.json({ id: savedId });
  } catch (e: any) {
    console.error('projects POST error', e);
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}