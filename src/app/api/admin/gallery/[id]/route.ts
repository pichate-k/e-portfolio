import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { extractFolderId, listFilesInFolder } from "@/lib/googleDrive";

export const dynamic = "force-dynamic";

// PUT update activity
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const existing = await (prisma as any).galleryActivity.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    let finalSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      const cleanSlug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const conflict = await (prisma as any).galleryActivity.findFirst({
        where: { slug: cleanSlug, id: { not: params.id } },
      });

      if (conflict) {
        return NextResponse.json(
          { error: `Slug '${cleanSlug}' is already in use by another activity.` },
          { status: 400 }
        );
      }
      finalSlug = cleanSlug;
    }

    const cleanFolderId = data.driveFolderId
      ? extractFolderId(data.driveFolderId)
      : existing.driveFolderId;

    // Refresh photo count if folder changed
    let photoCount = existing.photoCount;
    if (data.refreshCount || cleanFolderId !== existing.driveFolderId) {
      try {
        const listRes = await listFilesInFolder(cleanFolderId);
        if (listRes.files.length > 0) {
          photoCount = listRes.files.length;
        }
      } catch {}
    }

    const updated = await (prisma as any).galleryActivity.update({
      where: { id: params.id },
      data: {
        slug: finalSlug,
        title: data.title !== undefined ? data.title.trim() : existing.title,
        titleTh: data.titleTh !== undefined ? data.titleTh?.trim() || null : existing.titleTh,
        description: data.description !== undefined ? data.description?.trim() || null : existing.description,
        descriptionTh: data.descriptionTh !== undefined ? data.descriptionTh?.trim() || null : existing.descriptionTh,
        eventDate: data.eventDate !== undefined ? data.eventDate.trim() : existing.eventDate,
        location: data.location !== undefined ? data.location?.trim() || null : existing.location,
        locationTh: data.locationTh !== undefined ? data.locationTh?.trim() || null : existing.locationTh,
        category: data.category !== undefined ? data.category?.trim() || "Workshop" : existing.category,
        coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl?.trim() || null : existing.coverImageUrl,
        driveFolderId: cleanFolderId,
        photoCount: data.photoCount !== undefined ? Number(data.photoCount) : photoCount,
        isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : existing.isVisible,
        orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : existing.orderIndex,
      },
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (err: any) {
    console.error("Error updating activity:", err);
    return NextResponse.json(
      { error: "Failed to update activity", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE activity
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await (prisma as any).galleryActivity.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    await (prisma as any).galleryActivity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Activity deleted" });
  } catch (err: any) {
    console.error("Error deleting activity:", err);
    return NextResponse.json(
      { error: "Failed to delete activity", details: err.message },
      { status: 500 }
    );
  }
}
