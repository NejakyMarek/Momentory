import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json(); // { variant, pages, photos }
  if (!body?.variant || !body?.pages || !Array.isArray(body?.photos)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  // fake ID, kým nepripojíme DB
  return NextResponse.json({ id: crypto.randomUUID() });
}