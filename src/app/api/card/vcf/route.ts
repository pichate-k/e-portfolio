import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";
    const isTh = lang === "th";
    const idOrSlug = searchParams.get("id") || searchParams.get("slug");

    let card = null;

    if (idOrSlug) {
      card = await prisma.namecard.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
      });
    }

    if (!card) {
      // Find default card, or first card
      card = await prisma.namecard.findFirst({
        orderBy: [{ isDefault: "desc" }, { orderIndex: "asc" }],
      });
    }

    let name = "";
    let position = "";
    let organization = "";
    let department = "";
    let email = "";
    let phone = "";
    let address = "";
    let websiteUrl = "";
    let linkedinUrl = "";
    let githubUrl = "";
    let lineId = "";

    if (card) {
      name = (isTh && card.fullNameTh) || card.fullName || "Name";
      position = (isTh && card.positionTh) || card.position || "";
      organization = (isTh && card.organizationTh) || card.organization || "";
      department = (isTh && card.departmentTh) || card.department || "";
      email = card.email || "";
      phone = card.phone || "";
      address = (isTh && card.addressTh) || card.address || "";
      websiteUrl = card.websiteUrl || "";
      linkedinUrl = card.linkedinUrl || "";
      githubUrl = card.githubUrl || "";
      lineId = card.lineId || "";
    } else {
      // Fallback to Profile
      const profile = await prisma.profile.findFirst();
      if (!profile) {
        return NextResponse.json({ error: "Profile or card not found" }, { status: 404 });
      }
      name = (isTh && profile.fullNameTh) || profile.fullName;
      position = (isTh && profile.currentPositionTh) || profile.currentPosition;
      organization = (isTh && profile.workplaceTh) || profile.workplace;
      email = profile.email || "";
      phone = profile.phone || "";
      address = (isTh && profile.addressTh) || profile.address;
      websiteUrl = profile.websiteUrl || "";
      linkedinUrl = profile.linkedinUrl || "";
      githubUrl = profile.githubUrl || "";
    }

    const orgLine = [organization, department].filter(Boolean).join(" - ");

    // Build standard vCard 3.0
    const vCardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN;CHARSET=UTF-8:${name}`,
      `N;CHARSET=UTF-8:${name};;;;`,
      position ? `TITLE;CHARSET=UTF-8:${position}` : "",
      orgLine ? `ORG;CHARSET=UTF-8:${orgLine}` : "",
      email ? `EMAIL;TYPE=INTERNET,WORK:${email}` : "",
      phone ? `TEL;TYPE=CELL,VOICE:${phone}` : "",
      address ? `ADR;TYPE=WORK;CHARSET=UTF-8:;;${address};;;;` : "",
      websiteUrl ? `URL;TYPE=WORK:${websiteUrl}` : "",
      linkedinUrl ? `X-SOCIALPROFILE;type=linkedin:${linkedinUrl}` : "",
      githubUrl ? `X-SOCIALPROFILE;type=github:${githubUrl}` : "",
      lineId ? `X-LINE-ID:${lineId}` : "",
      "NOTE;CHARSET=UTF-8:Digital Business Card (E-Card)",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");

    const safeFilename = encodeURIComponent(
      name.replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, "_")
    );

    return new Response(vCardLines, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}.vcf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("vCard error:", error);
    return NextResponse.json({ error: "Failed to generate vCard" }, { status: 500 });
  }
}
