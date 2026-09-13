import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on Vercel. Please configure it in Vercel Settings." },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    const titleVal = (data.title && data.title.trim()) || (data.titleTh && data.titleTh.trim()) || "Entry";

    if (!data.sectionId) {
      return NextResponse.json(
        { error: "Section ID is required." },
        { status: 400 }
      );
    }

    const section = await prisma.cvSection.findUnique({
      where: { id: data.sectionId },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    // Determine orderIndex
    const lastItem = await prisma.cvItem.findFirst({
      where: { sectionId: data.sectionId },
      orderBy: { orderIndex: "desc" },
    });
    const orderIndex = (lastItem?.orderIndex ?? 0) + 1;

    const newItem = await prisma.cvItem.create({
      data: {
        sectionId: data.sectionId,
        title: titleVal.trim(),
        titleTh: data.titleTh?.trim() || null,
        subtitle: data.subtitle?.trim() || null,
        subtitleTh: data.subtitleTh?.trim() || null,
        organization: data.organization?.trim() || null,
        organizationTh: data.organizationTh?.trim() || null,
        location: data.location?.trim() || null,
        locationTh: data.locationTh?.trim() || null,
        startDate: data.startDate?.trim() || null,
        endDate: data.endDate?.trim() || null,
        isCurrent: Boolean(data.isCurrent),
        description: data.description?.trim() || null,
        descriptionTh: data.descriptionTh?.trim() || null,
        url: data.url?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        customData:
          typeof data.customData === "string"
            ? data.customData
            : JSON.stringify(data.customData || {}),
        tags: data.tags?.trim() || null,
        orderIndex,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { error: "Failed to create entry." },
      { status: 500 }
    );
  }
}
