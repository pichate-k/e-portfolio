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
    return NextResponse.json({
      includeProfile: true,
      profileTemplate: "academic",
      selectedSectionIds: [],
    });
  }

  try {
    await ensureTablesExist();
    const setting = await prisma.siteSetting.findFirst();
    let exportSettings = {};
    if (setting?.exportSettings) {
      try {
        exportSettings = JSON.parse(setting.exportSettings);
      } catch (e) {
        exportSettings = {};
      }
    }

    return NextResponse.json({
      includeProfile: true,
      profileTemplate: "academic",
      selectedSectionIds: [],
      ...exportSettings,
    });
  } catch (error) {
    console.error("Fetch export settings error:", error);
    return NextResponse.json(
      { includeProfile: true, profileTemplate: "academic", selectedSectionIds: [] },
      { status: 200 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 400 }
    );
  }

  try {
    await ensureTablesExist();
    const body = await req.json();

    const setting = await prisma.siteSetting.findFirst();
    const exportSettingsStr = typeof body === "string" ? body : JSON.stringify(body);

    if (setting) {
      await prisma.siteSetting.update({
        where: { id: setting.id },
        data: {
          exportSettings: exportSettingsStr,
        },
      });
    }

    // Also update any sectionConfigs if provided in the body
    if (body.sectionConfigs && typeof body.sectionConfigs === "object") {
      for (const [sectionId, config] of Object.entries(body.sectionConfigs)) {
        try {
          await prisma.cvSection.update({
            where: { id: sectionId },
            data: {
              exportConfig: typeof config === "string" ? config : JSON.stringify(config),
            },
          });
        } catch (secErr) {
          console.warn(`Could not update exportConfig for section ${sectionId}:`, secErr);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Export settings saved successfully" });
  } catch (error) {
    console.error("Save export settings error:", error);
    return NextResponse.json(
      { error: "Failed to save export settings" },
      { status: 500 }
    );
  }
}
