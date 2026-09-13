import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const data = await req.json();

    const existing = await prisma.cvItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const updated = await prisma.cvItem.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : existing.title,
        titleTh:
          data.titleTh !== undefined ? data.titleTh?.trim() || null : existing.titleTh,
        subtitle:
          data.subtitle !== undefined ? data.subtitle?.trim() || null : existing.subtitle,
        subtitleTh:
          data.subtitleTh !== undefined
            ? data.subtitleTh?.trim() || null
            : existing.subtitleTh,
        organization:
          data.organization !== undefined
            ? data.organization?.trim() || null
            : existing.organization,
        organizationTh:
          data.organizationTh !== undefined
            ? data.organizationTh?.trim() || null
            : existing.organizationTh,
        location:
          data.location !== undefined ? data.location?.trim() || null : existing.location,
        locationTh:
          data.locationTh !== undefined
            ? data.locationTh?.trim() || null
            : existing.locationTh,
        startDate:
          data.startDate !== undefined
            ? data.startDate?.trim() || null
            : existing.startDate,
        endDate:
          data.endDate !== undefined
            ? data.endDate?.trim() || null
            : existing.endDate,
        isCurrent:
          data.isCurrent !== undefined ? Boolean(data.isCurrent) : existing.isCurrent,
        description:
          data.description !== undefined
            ? data.description?.trim() || null
            : existing.description,
        descriptionTh:
          data.descriptionTh !== undefined
            ? data.descriptionTh?.trim() || null
            : existing.descriptionTh,
        url: data.url !== undefined ? data.url?.trim() || null : existing.url,
        imageUrl:
          data.imageUrl !== undefined
            ? data.imageUrl?.trim() || null
            : existing.imageUrl,
        customData:
          data.customData !== undefined
            ? typeof data.customData === "string"
              ? data.customData
              : JSON.stringify(data.customData)
            : (existing as any).customData || "{}",
        tags: data.tags !== undefined ? data.tags?.trim() || null : existing.tags,
        orderIndex:
          data.orderIndex !== undefined ? data.orderIndex : existing.orderIndex,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    const existing = await prisma.cvItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.cvItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
