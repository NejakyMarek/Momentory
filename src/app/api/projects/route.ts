import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { variant, pages, photos } = await req.json() as {
      variant: string;
      pages: number;
      photos: string[];
    };

    const id = crypto.randomUUID();

    await prisma.project.create({
      data: { id, variant, pages, photos }
    });

    return NextResponse.json({ id });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(
      JSON.stringify({ error: e?.message ?? "Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
