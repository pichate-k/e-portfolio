import { NextResponse, NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  testGoogleDriveConnection,
  getEffectiveGoogleDriveConfig,
  extractFolderId,
} from "@/lib/googleDrive";

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const effective = await getEffectiveGoogleDriveConfig();

    const folderId = extractFolderId(body.folderId || effective.folderId);
    const clientEmail = (body.clientEmail || effective.clientEmail || "").trim();
    // If privateKey is masked or not provided in body, use effective privateKey
    let privateKey = body.privateKey;
    if (!privateKey || privateKey.includes("••••")) {
      privateKey = effective.privateKey;
    }

    if (!folderId) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ Google Drive Folder ID หรือ URL" },
        { status: 400 }
      );
    }

    if (!clientEmail) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ Google Service Account Email" },
        { status: 400 }
      );
    }

    if (!privateKey) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ Service Account Private Key" },
        { status: 400 }
      );
    }

    const testResult = await testGoogleDriveConnection({
      folderId,
      clientEmail,
      privateKey,
    });

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error("Test Google Drive connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "เกิดข้อผิดพลาดในการทดสอบ Google Drive",
      },
      { status: 500 }
    );
  }
}
