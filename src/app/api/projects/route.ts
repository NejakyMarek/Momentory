import { NextRequest, NextResponse } from "next/server";
import { saveProject } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { variant, pages, photos } = await req.json();

    if (!variant || !pages || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }

    const id = await saveProject({ variant, pages: Number(pages), photos });
    return NextResponse.json({ id });
  } catch (e: any) {
    console.error("projects POST error:", e);
    return NextResponse.json({ error: e?.message || "Save failed" }, { status: 500 });
  }
}
