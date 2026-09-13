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

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on Vercel. Please configure it in Vercel Settings." },
      { status: 400 }
    );
  }

  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.cvSection.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const updated = await prisma.cvSection.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        titleTh:
          body.titleTh !== undefined ? body.titleTh : existing.titleTh,
        description:
          body.description !== undefined ? body.description : existing.description,
        descriptionTh:
          body.descriptionTh !== undefined
            ? body.descriptionTh
            : existing.descriptionTh,
        isVisible:
          body.isVisible !== undefined ? body.isVisible : existing.isVisible,
        orderIndex:
          body.orderIndex !== undefined ? body.orderIndex : existing.orderIndex,
        icon: body.icon !== undefined ? body.icon : existing.icon,
        contentType:
          body.contentType !== undefined ? body.contentType : (existing as any).contentType || "text",
        customFields:
          body.customFields !== undefined
            ? typeof body.customFields === "string"
              ? body.customFields
              : JSON.stringify(body.customFields)
            : (existing as any).customFields || "[]",
        exportConfig:
          body.exportConfig !== undefined
            ? typeof body.exportConfig === "string"
              ? body.exportConfig
              : JSON.stringify(body.exportConfig)
            : (existing as any).exportConfig || "{}",
      },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update section error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update section" },
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

    const existing = await prisma.cvSection.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: "Default system sections cannot be deleted. You can hide them instead." },
        { status: 400 }
      );
    }

    // Check if section contains items/content
    const itemCount = await prisma.cvItem.count({
      where: { sectionId: id },
    });

    if (itemCount > 0) {
      return NextResponse.json(
        {
          error: `ไม่สามารถลบหัวข้อนี้ได้เนื่องจากยังมีข้อมูลอยู่ ${itemCount} รายการ กรุณาลบข้อมูลภายในหัวข้อออกให้หมดก่อนลบหัวข้อ (Cannot delete section containing ${itemCount} items. Please remove all items first.)`,
        },
        { status: 400 }
      );
    }

    await prisma.cvSection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Section deleted successfully" });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
