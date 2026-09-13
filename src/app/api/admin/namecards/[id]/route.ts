import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET single card
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const card = await prisma.namecard.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Namecard not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, card });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch namecard", details: err.message },
      { status: 500 }
    );
  }
}

// PUT update card
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const existing = await prisma.namecard.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Namecard not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    let finalSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      const cleanSlug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const conflict = await prisma.namecard.findFirst({
        where: { slug: cleanSlug, id: { not: params.id } },
      });

      if (conflict) {
        return NextResponse.json(
          { error: `Slug '${cleanSlug}' is already in use by another card.` },
          { status: 400 }
        );
      }
      finalSlug = cleanSlug;
    }

    // If marked as default, clear others
    if (data.isDefault && !existing.isDefault) {
      await prisma.namecard.updateMany({
        where: { id: { not: params.id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.namecard.update({
      where: { id: params.id },
      data: {
        slug: finalSlug,
        title: data.title !== undefined ? data.title.trim() : existing.title,
        template: data.template !== undefined ? data.template : existing.template,
        isDefault: data.isDefault !== undefined ? Boolean(data.isDefault) : existing.isDefault,
        fullName: data.fullName !== undefined ? data.fullName.trim() : existing.fullName,
        fullNameTh: data.fullNameTh !== undefined ? data.fullNameTh?.trim() || null : existing.fullNameTh,
        position: data.position !== undefined ? data.position.trim() : existing.position,
        positionTh: data.positionTh !== undefined ? data.positionTh?.trim() || null : existing.positionTh,
        organization: data.organization !== undefined ? data.organization?.trim() || null : existing.organization,
        organizationTh: data.organizationTh !== undefined ? data.organizationTh?.trim() || null : existing.organizationTh,
        department: data.department !== undefined ? data.department?.trim() || null : existing.department,
        departmentTh: data.departmentTh !== undefined ? data.departmentTh?.trim() || null : existing.departmentTh,
        email: data.email !== undefined ? data.email?.trim() || null : existing.email,
        phone: data.phone !== undefined ? data.phone?.trim() || null : existing.phone,
        websiteUrl: data.websiteUrl !== undefined ? data.websiteUrl?.trim() || null : existing.websiteUrl,
        address: data.address !== undefined ? data.address?.trim() || null : existing.address,
        addressTh: data.addressTh !== undefined ? data.addressTh?.trim() || null : existing.addressTh,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl?.trim() || null : existing.avatarUrl,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl?.trim() || null : existing.logoUrl,
        linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl?.trim() || null : existing.linkedinUrl,
        githubUrl: data.githubUrl !== undefined ? data.githubUrl?.trim() || null : existing.githubUrl,
        googleScholarUrl: data.googleScholarUrl !== undefined ? data.googleScholarUrl?.trim() || null : (existing as any).googleScholarUrl,
        lineId: data.lineId !== undefined ? data.lineId?.trim() || null : existing.lineId,
        bio: data.bio !== undefined ? data.bio?.trim() || null : (existing as any).bio,
        bioTh: data.bioTh !== undefined ? data.bioTh?.trim() || null : (existing as any).bioTh,
        backTagline: data.backTagline !== undefined ? data.backTagline?.trim() || null : existing.backTagline,
        backTaglineTh: data.backTaglineTh !== undefined ? data.backTaglineTh?.trim() || null : existing.backTaglineTh,
        backSubtitle: data.backSubtitle !== undefined ? data.backSubtitle?.trim() || null : existing.backSubtitle,
        qrType: data.qrType !== undefined ? data.qrType : existing.qrType,
        customQrUrl: data.customQrUrl !== undefined ? data.customQrUrl?.trim() || null : existing.customQrUrl,
        primaryColor: data.primaryColor !== undefined ? data.primaryColor : existing.primaryColor,
        accentColor: data.accentColor !== undefined ? data.accentColor : existing.accentColor,
        backgroundColor: data.backgroundColor !== undefined ? data.backgroundColor : existing.backgroundColor,
        textColor: data.textColor !== undefined ? data.textColor : existing.textColor,
        cardStyleJson: data.cardStyleJson !== undefined ? data.cardStyleJson : existing.cardStyleJson,
      },
    });

    // If updated card is default, sync changes into Profile table for system-wide consistency
    if (updated.isDefault) {
      try {
        const existingProfile = await prisma.profile.findFirst();
        const profilePayload = {
          fullName: updated.fullName,
          fullNameTh: updated.fullNameTh,
          currentPosition: updated.position,
          currentPositionTh: updated.positionTh,
          workplace: updated.organization || "",
          workplaceTh: updated.organizationTh,
          address: updated.address || "",
          addressTh: updated.addressTh,
          email: updated.email || "",
          phone: updated.phone,
          websiteUrl: updated.websiteUrl,
          linkedinUrl: updated.linkedinUrl,
          githubUrl: updated.githubUrl,
          googleScholarUrl: (updated as any).googleScholarUrl,
          avatarUrl: updated.avatarUrl,
          bio: (updated as any).bio,
          bioTh: (updated as any).bioTh,
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

    return NextResponse.json({ success: true, card: updated });
  } catch (err: any) {
    console.error("Error updating namecard:", err);
    return NextResponse.json(
      { error: "Failed to update namecard", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE card
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cardCount = await prisma.namecard.count();
    if (cardCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only namecard. You must keep at least 1 card." },
        { status: 400 }
      );
    }

    const card = await prisma.namecard.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Namecard not found" }, { status: 404 });
    }

    await prisma.namecard.delete({
      where: { id: params.id },
    });

    // If deleted card was default, set the first remaining card as default
    if (card.isDefault) {
      const firstRemaining = await prisma.namecard.findFirst({
        orderBy: { orderIndex: "asc" },
      });
      if (firstRemaining) {
        await prisma.namecard.update({
          where: { id: firstRemaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Namecard deleted" });
  } catch (err: any) {
    console.error("Error deleting namecard:", err);
    return NextResponse.json(
      { error: "Failed to delete namecard", details: err.message },
      { status: 500 }
    );
  }
}
