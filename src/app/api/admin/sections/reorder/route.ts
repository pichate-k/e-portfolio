import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sectionIds } = await req.json();

    if (!Array.isArray(sectionIds)) {
      return NextResponse.json(
        { error: "Invalid payload: sectionIds must be an array" },
        { status: 400 }
      );
    }

    // Update each section's orderIndex in transaction
    await prisma.$transaction(
      sectionIds.map((id: string, index: number) =>
        prisma.cvSection.update({
          where: { id },
          data: { orderIndex: index + 1 },
        })
      )
    );

    const updatedSections = await prisma.cvSection.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(updatedSections);
  } catch (error) {
    console.error("Reorder sections error:", error);
    return NextResponse.json(
      { error: "Failed to reorder sections" },
      { status: 500 }
    );
  }
}
