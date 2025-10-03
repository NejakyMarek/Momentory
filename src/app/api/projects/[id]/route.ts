import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProjectSchema = z.object({
  pagesJson: z.any().optional(),
  pageCount: z.number().min(1).max(120).optional(),
  priceCents: z.number().min(0).optional(),
  status: z.enum(['editing', 'ready', 'ordered', 'paid']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        assets: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updateData = updateProjectSchema.parse(body);

    // Recalculate price if pageCount changed
    if (updateData.pageCount) {
      const basePricePerPage = 500; // $5.00 per page in cents
      updateData.priceCents = basePricePerPage * updateData.pageCount;
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        assets: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
