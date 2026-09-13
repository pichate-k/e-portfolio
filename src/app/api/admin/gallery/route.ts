import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { extractFolderId, listFilesInFolder, testGoogleDriveConnection, getEffectiveGoogleDriveConfig } from "@/lib/googleDrive";

export const dynamic = "force-dynamic";

// GET all activities for Admin (including hidden)
export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activities = await (prisma as any).galleryActivity.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, activities });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load activities", details: err.message },
      { status: 500 }
    );
  }
}

// POST create a new activity
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.title?.trim()) {
      return NextResponse.json({ error: "Activity title is required" }, { status: 400 });
    }
    if (!data.eventDate?.trim()) {
      return NextResponse.json({ error: "Event date is required" }, { status: 400 });
    }
    if (!data.driveFolderId?.trim()) {
      return NextResponse.json({ error: "Google Drive folder ID or link is required" }, { status: 400 });
    }

    const cleanFolderId = extractFolderId(data.driveFolderId);

    // Auto-generate slug if not provided
    let baseSlug = (data.slug || data.title || "activity")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "activity";

    let finalSlug = baseSlug;
    let counter = 1;
    while (await (prisma as any).galleryActivity.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const count = await (prisma as any).galleryActivity.count();

    // Try counting photos in folder
    let photoCount = 0;
    try {
      const listRes = await listFilesInFolder(cleanFolderId);
      photoCount = listRes.files.length;
    } catch {}

    const newActivity = await (prisma as any).galleryActivity.create({
      data: {
        slug: finalSlug,
        title: data.title.trim(),
        titleTh: data.titleTh?.trim() || null,
        description: data.description?.trim() || null,
        descriptionTh: data.descriptionTh?.trim() || null,
        eventDate: data.eventDate.trim(),
        location: data.location?.trim() || null,
        locationTh: data.locationTh?.trim() || null,
        category: data.category?.trim() || "Workshop",
        coverImageUrl: data.coverImageUrl?.trim() || null,
        driveFolderId: cleanFolderId,
        photoCount: photoCount || (data.photoCount ? Number(data.photoCount) : 0),
        isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : true,
        orderIndex: count,
      },
    });

    return NextResponse.json({ success: true, activity: newActivity }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating gallery activity:", err);
    return NextResponse.json(
      { error: "Failed to create activity", details: err.message },
      { status: 500 }
    );
  }
}
