import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdminAndData } from "@/lib/autoSeed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureDefaultAdminAndData();

    const activities = await (prisma as any).galleryActivity.findMany({
      where: { isVisible: true },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, activities });
  } catch (err: any) {
    console.error("Error fetching gallery activities:", err);
    return NextResponse.json(
      { error: "Failed to load gallery activities", details: err.message },
      { status: 500 }
    );
  }
}
