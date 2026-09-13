import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Helper to seed initial card from profile if none exist
async function ensureDefaultCardExists() {
  const count = await prisma.namecard.count();
  if (count > 0) return;

  const profile = await prisma.profile.findFirst();

  await prisma.namecard.create({
    data: {
      slug: "academic",
      title: "Academic & Research Card",
      template: "academic",
      isDefault: true,
      fullName: profile?.fullName || "User Name",
      fullNameTh: profile?.fullNameTh || "ผู้ใช้งานระบบ",
      position: profile?.currentPosition || "Researcher & Software Engineer",
      positionTh: profile?.currentPositionTh || "นักวิจัยและวิศวกรซอฟต์แวร์",
      organization: profile?.workplace || "Faculty of Engineering, University",
      organizationTh: profile?.workplaceTh || "คณะวิศวกรรมศาสตร์ มหาวิทยาลัย",
      department: "Department of Computer Engineering",
      departmentTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      email: profile?.email || "user@example.com",
      phone: profile?.phone || "+66 (0) 2-000-0000",
      websiteUrl: profile?.websiteUrl || "https://example.com",
      address: profile?.address || "Bangkok, Thailand",
      addressTh: profile?.addressTh || "กรุงเทพมหานคร ประเทศไทย",
      avatarUrl: profile?.avatarUrl || null,
      linkedinUrl: profile?.linkedinUrl || null,
      githubUrl: profile?.githubUrl || null,
      googleScholarUrl: profile?.googleScholarUrl || null,
      lineId: null,
      bio: profile?.bio || null,
      bioTh: profile?.bioTh || null,
      backTagline: "Innovating AI, Embedded Systems & Engineering Education",
      backTaglineTh: "สร้างสรรค์นวัตกรรม AI ระบบสมองกลฝังตัว และการศึกษาวิศวกรรมศาสตร์",
      backSubtitle: "Research • Academic • Consulting",
      qrType: "card_url",
      primaryColor: "#1e3a8a",
      accentColor: "#d97706",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      orderIndex: 0,
    },
  });
}

// GET all namecards
export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDefaultCardExists();

    const cards = await prisma.namecard.findMany({
      orderBy: [{ isDefault: "desc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, cards });
  } catch (err: any) {
    console.error("Error fetching namecards:", err);
    return NextResponse.json(
      { error: "Failed to load namecards", details: err.message },
      { status: 500 }
    );
  }
}

// POST create a new namecard
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    let baseSlug = (data.slug || data.title || "card")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "card";

    // Ensure unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.namecard.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // If marked as default, unset others
    if (data.isDefault) {
      await prisma.namecard.updateMany({
        data: { isDefault: false },
      });
    }

    const cardCount = await prisma.namecard.count();

    const newCard = await prisma.namecard.create({
      data: {
        slug: finalSlug,
        title: data.title?.trim() || "Digital Namecard",
        template: data.template || "executive",
        isDefault: Boolean(data.isDefault || cardCount === 0),
        fullName: data.fullName?.trim() || "User Name",
        fullNameTh: data.fullNameTh?.trim() || null,
        position: data.position?.trim() || "Researcher",
        positionTh: data.positionTh?.trim() || null,
        organization: data.organization?.trim() || null,
        organizationTh: data.organizationTh?.trim() || null,
        department: data.department?.trim() || null,
        departmentTh: data.departmentTh?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        websiteUrl: data.websiteUrl?.trim() || null,
        address: data.address?.trim() || null,
        addressTh: data.addressTh?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        linkedinUrl: data.linkedinUrl?.trim() || null,
        githubUrl: data.githubUrl?.trim() || null,
        googleScholarUrl: data.googleScholarUrl?.trim() || null,
        lineId: data.lineId?.trim() || null,
        bio: data.bio?.trim() || null,
        bioTh: data.bioTh?.trim() || null,
        backTagline: data.backTagline?.trim() || null,
        backTaglineTh: data.backTaglineTh?.trim() || null,
        backSubtitle: data.backSubtitle?.trim() || null,
        qrType: data.qrType || "card_url",
        customQrUrl: data.customQrUrl?.trim() || null,
        primaryColor: data.primaryColor || "#ea580c",
        accentColor: data.accentColor || "#f97316",
        backgroundColor: data.backgroundColor || "#0f172a",
        textColor: data.textColor || "#ffffff",
        cardStyleJson: data.cardStyleJson || "{}",
        orderIndex: cardCount,
      },
    });

    // If marked default, synchronize to Profile table for legacy compatibility
    if (newCard.isDefault) {
      try {
        const existingProfile = await prisma.profile.findFirst();
        const profilePayload = {
          fullName: newCard.fullName,
          fullNameTh: newCard.fullNameTh,
          currentPosition: newCard.position,
          currentPositionTh: newCard.positionTh,
          workplace: newCard.organization || "",
          workplaceTh: newCard.organizationTh,
          address: newCard.address || "",
          addressTh: newCard.addressTh,
          email: newCard.email || "",
          phone: newCard.phone,
          websiteUrl: newCard.websiteUrl,
          linkedinUrl: newCard.linkedinUrl,
          githubUrl: newCard.githubUrl,
          googleScholarUrl: newCard.googleScholarUrl,
          avatarUrl: newCard.avatarUrl,
          bio: newCard.bio,
          bioTh: newCard.bioTh,
        };

        if (existingProfile) {
          await prisma.profile.update({
            where: { id: existingProfile.id },
            data: profilePayload,
          });
        } else {
          await prisma.profile.create({
            data: profilePayload,
          });
        }
      } catch (syncErr) {
        console.warn("Could not sync to Profile table:", syncErr);
      }
    }

    return NextResponse.json({ success: true, card: newCard }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating namecard:", err);
    return NextResponse.json(
      { error: "Failed to create namecard", details: err.message },
      { status: 500 }
    );
  }
}
