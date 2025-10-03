import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { z } from 'zod';

const uploadAssetSchema = z.object({
  url: z.string().url(),
  storageKey: z.string(),
  width: z.number().min(1),
  height: z.number().min(1),
  exif: z.any().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { url, storageKey, width, height, exif } = uploadAssetSchema.parse(body);

    const asset = await prisma.asset.create({
      data: {
        projectId: params.id,
        url,
        storageKey,
        width,
        height,
        exif,
      },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assets = await prisma.asset.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}
