import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemIds } = await req.json();

    if (!Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: "Invalid payload: itemIds must be an array" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      itemIds.map((id: string, index: number) =>
        prisma.cvItem.update({
          where: { id },
          data: { orderIndex: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder items error:", error);
    return NextResponse.json(
      { error: "Failed to reorder entries" },
      { status: 500 }
    );
  }
}
