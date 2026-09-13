import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const mode = body.mode === "replace" ? "replace" : "merge";
    const backupData = body.data || body;

    if (!backupData || (!backupData.sections && !backupData.profile && !backupData.namecards)) {
      return NextResponse.json(
        { error: "Invalid backup file structure. Missing data." },
        { status: 400 }
      );
    }

    const { profile, siteSetting, sections = [], namecards = [] } = backupData;

    let restoredSectionsCount = 0;
    let restoredItemsCount = 0;
    let restoredCardsCount = 0;

    await prisma.$transaction(async (tx) => {
      // =================================================================
      // 1. CLEAN REPLACE MODE: Wipe existing records first
      // =================================================================
      if (mode === "replace") {
        await tx.cvItem.deleteMany();
        await tx.cvSection.deleteMany();
        await tx.namecard.deleteMany();
      }

      // =================================================================
      // 2. RESTORE PROFILE
      // =================================================================
      if (profile) {
        const existingProfile = await tx.profile.findFirst();
        const profileData = {
          fullName: profile.fullName || "Dr. Pichate K.",
          fullNameTh: profile.fullNameTh || null,
          currentPosition: profile.currentPosition || "Researcher",
          currentPositionTh: profile.currentPositionTh || null,
          workplace: profile.workplace || "University",
          workplaceTh: profile.workplaceTh || null,
          address: profile.address || "",
          addressTh: profile.addressTh || null,
          email: profile.email || "pichate.k@rmutt.ac.th",
          phone: profile.phone || null,
          websiteUrl: profile.websiteUrl || null,
          linkedinUrl: profile.linkedinUrl || null,
          githubUrl: profile.githubUrl || null,
          googleScholarUrl: profile.googleScholarUrl || null,
          avatarUrl: profile.avatarUrl || null,
          bio: profile.bio || null,
          bioTh: profile.bioTh || null,
        };

        if (existingProfile) {
          await tx.profile.update({
            where: { id: existingProfile.id },
            data: profileData,
          });
        } else {
          await tx.profile.create({
            data: profileData,
          });
        }
      }

      // =================================================================
      // 3. RESTORE SITE SETTING (Optional)
      // =================================================================
      if (siteSetting) {
        const existingSetting = await tx.siteSetting.findFirst();
        const settingData: any = {};
        if (siteSetting.siteTitle) settingData.siteTitle = siteSetting.siteTitle;
        if (siteSetting.bioTagline !== undefined) settingData.bioTagline = siteSetting.bioTagline;
        if (siteSetting.themePreference) settingData.themePreference = siteSetting.themePreference;
        if (siteSetting.exportSettings) settingData.exportSettings = siteSetting.exportSettings;
        if (siteSetting.googleDriveSettings) settingData.googleDriveSettings = siteSetting.googleDriveSettings;
        if (siteSetting.requireCvPassword !== undefined) settingData.requireCvPassword = Boolean(siteSetting.requireCvPassword);

        if (existingSetting && Object.keys(settingData).length > 0) {
          await tx.siteSetting.update({
            where: { id: existingSetting.id },
            data: settingData,
          });
        }
      }

      // =================================================================
      // 4. RESTORE SECTIONS & ITEMS
      // =================================================================
      if (Array.isArray(sections)) {
        for (const sec of sections) {
          if (!sec.slug || !sec.title) continue;

          let targetSectionId = "";

          if (mode === "replace") {
            // Direct create in clean replace
            const createdSec = await tx.cvSection.create({
              data: {
                slug: sec.slug,
                title: sec.title,
                titleTh: sec.titleTh || null,
                description: sec.description || null,
                descriptionTh: sec.descriptionTh || null,
                orderIndex: sec.orderIndex !== undefined ? sec.orderIndex : 0,
                isSystem: Boolean(sec.isSystem),
                isVisible: sec.isVisible !== undefined ? Boolean(sec.isVisible) : true,
                icon: sec.icon || null,
                contentType: sec.contentType || "text",
                customFields: sec.customFields || "[]",
                exportConfig: sec.exportConfig || "{}",
              },
            });
            targetSectionId = createdSec.id;
            restoredSectionsCount++;
          } else {
            // Merge mode: match by slug
            const existingSec = await tx.cvSection.findUnique({
              where: { slug: sec.slug },
            });

            if (existingSec) {
              const updatedSec = await tx.cvSection.update({
                where: { id: existingSec.id },
                data: {
                  title: sec.title,
                  titleTh: sec.titleTh || existingSec.titleTh,
                  description: sec.description || existingSec.description,
                  descriptionTh: sec.descriptionTh || existingSec.descriptionTh,
                  icon: sec.icon || existingSec.icon,
                  orderIndex: sec.orderIndex !== undefined ? sec.orderIndex : existingSec.orderIndex,
                  isVisible: sec.isVisible !== undefined ? Boolean(sec.isVisible) : existingSec.isVisible,
                  customFields: sec.customFields || existingSec.customFields,
                  exportConfig: sec.exportConfig || existingSec.exportConfig,
                },
              });
              targetSectionId = updatedSec.id;
              restoredSectionsCount++;
            } else {
              const createdSec = await tx.cvSection.create({
                data: {
                  slug: sec.slug,
                  title: sec.title,
                  titleTh: sec.titleTh || null,
                  description: sec.description || null,
                  descriptionTh: sec.descriptionTh || null,
                  orderIndex: sec.orderIndex !== undefined ? sec.orderIndex : 0,
                  isSystem: Boolean(sec.isSystem),
                  isVisible: sec.isVisible !== undefined ? Boolean(sec.isVisible) : true,
                  icon: sec.icon || null,
                  contentType: sec.contentType || "text",
                  customFields: sec.customFields || "[]",
                  exportConfig: sec.exportConfig || "{}",
                },
              });
              targetSectionId = createdSec.id;
              restoredSectionsCount++;
            }
          }

          // Restore items in this section
          if (Array.isArray(sec.items) && targetSectionId) {
            for (const item of sec.items) {
              if (!item.title && !item.titleTh) continue;

              const itemData = {
                sectionId: targetSectionId,
                title: item.title || item.titleTh || "Item",
                titleTh: item.titleTh || null,
                subtitle: item.subtitle || null,
                subtitleTh: item.subtitleTh || null,
                organization: item.organization || null,
                organizationTh: item.organizationTh || null,
                location: item.location || null,
                locationTh: item.locationTh || null,
                startDate: item.startDate || null,
                endDate: item.endDate || null,
                isCurrent: Boolean(item.isCurrent),
                description: item.description || null,
                descriptionTh: item.descriptionTh || null,
                url: item.url || null,
                imageUrl: item.imageUrl || null,
                customData: item.customData || "{}",
                tags: item.tags || null,
                orderIndex: item.orderIndex !== undefined ? item.orderIndex : 0,
              };

              if (mode === "replace") {
                await tx.cvItem.create({ data: itemData });
                restoredItemsCount++;
              } else {
                // In merge mode: check if item with same title exists in this section
                const existingItem = await tx.cvItem.findFirst({
                  where: {
                    sectionId: targetSectionId,
                    title: itemData.title,
                  },
                });

                if (existingItem) {
                  await tx.cvItem.update({
                    where: { id: existingItem.id },
                    data: itemData,
                  });
                } else {
                  await tx.cvItem.create({ data: itemData });
                }
                restoredItemsCount++;
              }
            }
          }
        }
      }

      // =================================================================
      // 5. RESTORE NAMECARDS
      // =================================================================
      if (Array.isArray(namecards)) {
        for (const nc of namecards) {
          if (!nc.slug || !nc.title) continue;

          const cardData = {
            slug: nc.slug,
            title: nc.title,
            template: nc.template || "executive",
            isDefault: Boolean(nc.isDefault),
            fullName: nc.fullName || "Dr. Pichate K.",
            fullNameTh: nc.fullNameTh || null,
            position: nc.position || "Researcher",
            positionTh: nc.positionTh || null,
            organization: nc.organization || null,
            organizationTh: nc.organizationTh || null,
            department: nc.department || null,
            departmentTh: nc.departmentTh || null,
            email: nc.email || null,
            phone: nc.phone || null,
            websiteUrl: nc.websiteUrl || null,
            address: nc.address || null,
            addressTh: nc.addressTh || null,
            avatarUrl: nc.avatarUrl || null,
            logoUrl: nc.logoUrl || null,
            linkedinUrl: nc.linkedinUrl || null,
            githubUrl: nc.githubUrl || null,
            lineId: nc.lineId || null,
            backTagline: nc.backTagline || null,
            backTaglineTh: nc.backTaglineTh || null,
            backSubtitle: nc.backSubtitle || null,
            qrType: nc.qrType || "card_url",
            customQrUrl: nc.customQrUrl || null,
            primaryColor: nc.primaryColor || "#ea580c",
            accentColor: nc.accentColor || "#f97316",
            backgroundColor: nc.backgroundColor || "#0f172a",
            textColor: nc.textColor || "#ffffff",
            cardStyleJson: nc.cardStyleJson || "{}",
            orderIndex: nc.orderIndex !== undefined ? nc.orderIndex : 0,
          };

          if (mode === "replace") {
            await tx.namecard.create({ data: cardData });
            restoredCardsCount++;
          } else {
            const existingCard = await tx.namecard.findUnique({
              where: { slug: nc.slug },
            });

            if (existingCard) {
              await tx.namecard.update({
                where: { id: existingCard.id },
                data: cardData,
              });
            } else {
              await tx.namecard.create({ data: cardData });
            }
            restoredCardsCount++;
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      mode,
      restored: {
        profile: Boolean(profile),
        sectionsCount: restoredSectionsCount,
        itemsCount: restoredItemsCount,
        namecardsCount: restoredCardsCount,
      },
      message: `Restored successfully: ${restoredSectionsCount} sections, ${restoredItemsCount} items, ${restoredCardsCount} namecards.`,
    });
  } catch (error: any) {
    console.error("Backup import error:", error);
    return NextResponse.json(
      { error: "Failed to import backup data", details: error.message },
      { status: 500 }
    );
  }
}
