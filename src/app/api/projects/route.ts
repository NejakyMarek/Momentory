import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getDefaultTemplate } from '@/lib/albumTemplates';

const createProjectSchema = z.object({
  variantId: z.string(),
  size: z.string(),
  basePages: z.number().min(1).max(120),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, size, basePages } = createProjectSchema.parse(body);

    // Calculate base price (this would come from your product configuration)
    const basePricePerPage = 500; // $5.00 per page in cents
    const basePriceCents = basePricePerPage * basePages;

    // Create initial pages with default template
    const defaultTemplate = getDefaultTemplate();
    const initialPages = Array.from({ length: basePages }, (_, index) => ({
      id: `page-${index + 1}`,
      templateKey: defaultTemplate.key,
      frames: defaultTemplate.frames.reduce((acc, frame) => {
        acc[frame.id] = {};
        return acc;
      }, {} as any),
    }));

    const project = await prisma.project.create({
      data: {
        variantId,
        size,
        pageCount: basePages,
        pagesJson: initialPages,
        priceCents: basePriceCents,
        status: 'editing',
      },
      include: {
        assets: true,
      },
    });

    return NextResponse.json({ id: project.id });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        assets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}