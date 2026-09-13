import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, hashPassword, verifyPassword } from "@/lib/auth";
import { ensureTablesExist } from "@/lib/autoSeed";
import { getEffectiveGoogleDriveConfig } from "@/lib/googleDrive";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      siteTitle: "Academic & Professional Portfolio",
      bioTagline: "Researcher, Educator & Software Engineer",
      requireCvPassword: true,
      hasCvPassword: true,
      googleDrive: {
        enabled: false,
        folderId: "",
        clientEmail: "",
        hasPrivateKey: false,
      },
    });
  }

  try {
    await ensureTablesExist();
  } catch (e) {
    console.warn("Could not ensure tables in settings GET:", e);
  }

  let setting = null;
  try {
    setting = await prisma.siteSetting.findFirst();
  } catch (e) {
    console.warn("Could not fetch siteSetting:", e);
  }

  const gdEffective = await getEffectiveGoogleDriveConfig();
  let savedFolderLink = "";
  try {
    if (setting?.googleDriveSettings) {
      const parsed = JSON.parse(setting.googleDriveSettings);
      savedFolderLink = parsed.folderLink || parsed.folderId || "";
    }
  } catch {}
  if (!savedFolderLink) {
    savedFolderLink = gdEffective.folderId || "";
  }

  return NextResponse.json({
    siteTitle: setting?.siteTitle || "Academic & Professional Portfolio",
    bioTagline: setting?.bioTagline || "",
    requireCvPassword: setting?.requireCvPassword ?? true,
    hasCvPassword: Boolean(setting?.downloadPasswordHash),
    googleDrive: {
      enabled: Boolean(gdEffective.enabled),
      folderLink: savedFolderLink,
      folderId: gdEffective.folderId || savedFolderLink,
      clientEmail: gdEffective.clientEmail || "",
      hasPrivateKey: Boolean(gdEffective.privateKey),
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on Vercel. Please configure it in Vercel Settings." },
      { status: 400 }
    );
  }

  try {
    await ensureTablesExist();
    const body = await req.json();
    const {
      siteTitle,
      bioTagline,
      requireCvPassword,
      newCvPassword,
      currentAdminPassword,
      newAdminPassword,
      googleDrive,
    } = body;

    // 1. Update CV download password or general settings
    const setting = await prisma.siteSetting.findFirst();

    const updateData: {
      siteTitle?: string;
      bioTagline?: string;
      requireCvPassword?: boolean;
      downloadPasswordHash?: string;
      googleDriveSettings?: string;
    } = {};

    if (siteTitle !== undefined) updateData.siteTitle = siteTitle;
    if (bioTagline !== undefined) updateData.bioTagline = bioTagline;
    if (requireCvPassword !== undefined) updateData.requireCvPassword = Boolean(requireCvPassword);

    if (newCvPassword && newCvPassword.trim().length >= 4) {
      updateData.downloadPasswordHash = await hashPassword(newCvPassword.trim());
    }

    if (googleDrive !== undefined) {
      let existingGD: any = {};
      try {
        if (setting?.googleDriveSettings) {
          existingGD = JSON.parse(setting.googleDriveSettings);
        }
      } catch {}

      const incomingGD = googleDrive || {};
      const folderLink =
        incomingGD.folderLink !== undefined
          ? incomingGD.folderLink.trim()
          : incomingGD.folderId !== undefined
          ? incomingGD.folderId.trim()
          : (existingGD.folderLink || existingGD.folderId || "");

      const folderId = incomingGD.folderId !== undefined ? incomingGD.folderId.trim() : (existingGD.folderId || folderLink);
      const clientEmail = incomingGD.clientEmail !== undefined ? incomingGD.clientEmail.trim() : (existingGD.clientEmail || "");
      const privateKey =
        incomingGD.privateKey && !incomingGD.privateKey.includes("••••")
          ? incomingGD.privateKey.trim()
          : (existingGD.privateKey || "");

      const enabled =
        incomingGD.enabled !== undefined
          ? Boolean(incomingGD.enabled)
          : (existingGD.enabled ?? Boolean(folderLink));

      const updatedGD = {
        enabled,
        folderLink,
        folderId,
        clientEmail,
        privateKey,
      };

      updateData.googleDriveSettings = JSON.stringify(updatedGD);
    }

    if (setting) {
      await prisma.siteSetting.update({
        where: { id: setting.id },
        data: updateData,
      });
    } else {
      const defaultHash = await hashPassword("download123");
      await prisma.siteSetting.create({
        data: {
          siteTitle: siteTitle || "Academic & Professional Portfolio",
          bioTagline: bioTagline || "",
          requireCvPassword: requireCvPassword !== undefined ? Boolean(requireCvPassword) : true,
          downloadPasswordHash: updateData.downloadPasswordHash || defaultHash,
          googleDriveSettings: updateData.googleDriveSettings || "{}",
        },
      });
    }

    // 2. Update Admin Password if requested
    if (newAdminPassword) {
      if (!currentAdminPassword) {
        return NextResponse.json(
          { error: "Current admin password is required to change password." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const isCurrentMatch = await verifyPassword(
        currentAdminPassword,
        user.passwordHash
      );
      if (!isCurrentMatch) {
        return NextResponse.json(
          { error: "Incorrect current admin password." },
          { status: 400 }
        );
      }

      if (newAdminPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const newAdminHash = await hashPassword(newAdminPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newAdminHash },
      });
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
