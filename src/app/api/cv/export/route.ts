import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { generateCvPdf } from "@/lib/export/pdf";
import { generateCvDocx } from "@/lib/export/docx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, format, lang = "en" } = body;
    const isTh = lang === "th";

    const setting = await prisma.siteSetting.findFirst();

    if (setting && setting.requireCvPassword) {
      if (!password) {
        return NextResponse.json(
          { error: "Access password is required to download CV." },
          { status: 401 }
        );
      }

      const isValid = await verifyPassword(password, setting.downloadPasswordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Incorrect access password. Please try again." },
          { status: 401 }
        );
      }
    }

    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json(
        { error: "Profile information not found." },
        { status: 404 }
      );
    }

    // Parse global export settings if saved in DB
    let savedExportSettings: any = {};
    if (setting?.exportSettings) {
      try {
        savedExportSettings = JSON.parse(setting.exportSettings);
      } catch (e) {
        savedExportSettings = {};
      }
    }

    const effectiveIncludeProfile =
      body.includeProfile !== undefined
        ? Boolean(body.includeProfile)
        : savedExportSettings.includeProfile !== undefined
        ? Boolean(savedExportSettings.includeProfile)
        : true;

    const effectiveProfileTemplate =
      body.profileTemplate || savedExportSettings.profileTemplate || "academic";

    const effectiveSelectedSectionIds: string[] =
      Array.isArray(body.selectedSectionIds) && body.selectedSectionIds.length > 0
        ? body.selectedSectionIds
        : Array.isArray(savedExportSettings.selectedSectionIds) &&
          savedExportSettings.selectedSectionIds.length > 0
        ? savedExportSettings.selectedSectionIds
        : [];

    const sectionsWhere: any = { isVisible: true };
    if (effectiveSelectedSectionIds.length > 0) {
      sectionsWhere.id = { in: effectiveSelectedSectionIds };
    }

    const sections = await prisma.cvSection.findMany({
      where: sectionsWhere,
      orderBy: { orderIndex: "asc" },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    const rawName = isTh && profile.fullNameTh ? profile.fullNameTh : profile.fullName || "Pichate_K";
    const safeName = rawName
      .replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, "_")
      .replace(/_+/g, "_");

    const exportOptions = {
      includeProfile: effectiveIncludeProfile,
      profileTemplate: effectiveProfileTemplate as "academic" | "modern" | "compact",
    };

    if (format === "docx") {
      const docxBuffer = await generateCvDocx(profile, sections, lang, exportOptions);
      return new Response(new Uint8Array(docxBuffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}_CV_${lang.toUpperCase()}.docx"`,
        },
      });
    } else {
      // Default to PDF
      const pdfBuffer = await generateCvPdf(profile, sections, lang, exportOptions);
      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}_CV_${lang.toUpperCase()}.pdf"`,
        },
      });
    }
  } catch (error) {
    console.error("CV Export error:", error);
    return NextResponse.json(
      { error: "Failed to generate CV document." },
      { status: 500 }
    );
  }
}
