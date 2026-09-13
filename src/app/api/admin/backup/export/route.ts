import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch Profile
    const profile = await prisma.profile.findFirst();

    // 2. Fetch SiteSetting
    const siteSetting = await prisma.siteSetting.findFirst();

    // 3. Fetch all CV Sections with items
    const sections = await prisma.cvSection.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    // 4. Fetch all Namecards
    const namecards = await prisma.namecard.findMany({
      orderBy: [{ isDefault: "desc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
    });

    // Total counts for summary
    const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

    const backupPayload = {
      version: "1.0",
      system: "PichateK-Portfolio",
      exportedAt: new Date().toISOString(),
      summary: {
        hasProfile: Boolean(profile),
        sectionsCount: sections.length,
        itemsCount: totalItems,
        namecardsCount: namecards.length,
      },
      data: {
        profile,
        siteSetting,
        sections,
        namecards,
      },
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `pichatek-portfolio-backup-${dateStr}.json`;

    return new Response(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Backup export error:", error);
    return NextResponse.json(
      { error: "Failed to generate backup export", details: error.message },
      { status: 500 }
    );
  }
}
