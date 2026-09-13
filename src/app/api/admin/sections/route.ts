import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ensureTablesExist } from "@/lib/autoSeed";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json([]);
  }

  try {
    await ensureTablesExist();
  } catch (e) {
    console.warn("Could not ensure tables in sections GET:", e);
  }

  try {
    const sections = await prisma.cvSection.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });
    return NextResponse.json(sections);
  } catch (err) {
    console.warn("Could not fetch sections:", err);
    return NextResponse.json([]);
  }
}

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
    const { title, titleTh, description, descriptionTh, icon, contentType, customFields, exportConfig } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Section title (EN) is required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!baseSlug) baseSlug = "section";
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.cvSection.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Get highest order index
    const lastSection = await prisma.cvSection.findFirst({
      orderBy: { orderIndex: "desc" },
    });
    const orderIndex = (lastSection?.orderIndex ?? 0) + 1;

    const validContentType = ["text", "file", "link", "mixed"].includes(contentType)
      ? contentType
      : "text";

    const customFieldsStr = typeof customFields === "string"
      ? customFields
      : JSON.stringify(customFields || []);

    const exportConfigStr = typeof exportConfig === "string"
      ? exportConfig
      : JSON.stringify(exportConfig || {});

    const newSection = await prisma.cvSection.create({
      data: {
        slug,
        title: title.trim(),
        titleTh: titleTh?.trim() || null,
        description: description?.trim() || null,
        descriptionTh: descriptionTh?.trim() || null,
        icon: icon || (validContentType === "file" ? "CheckCircle" : validContentType === "link" ? "Globe" : "Layers"),
        contentType: validContentType,
        customFields: customFieldsStr,
        exportConfig: exportConfigStr,
        orderIndex,
        isSystem: false,
        isVisible: true,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
