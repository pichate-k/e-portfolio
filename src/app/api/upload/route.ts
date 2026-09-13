import { NextResponse, NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getEffectiveGoogleDriveConfig,
  uploadFileToGoogleDrive,
} from "@/lib/googleDrive";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extended valid types: images and documents (certificates, PDFs, research papers)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    const fileType = file.type || "application/octet-stream";
    const isAllowedType =
      validTypes.includes(fileType) ||
      file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf|doc|docx|xls|xlsx|txt)$/i);

    if (!isAllowedType) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Supported formats: JPG, PNG, WEBP, GIF, SVG, PDF, DOC, DOCX, XLS, XLSX, TXT.",
        },
        { status: 400 }
      );
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Check if Google Drive storage is enabled and configured
    const gdConfig = await getEffectiveGoogleDriveConfig();
    if (gdConfig.enabled) {
      if (!gdConfig.folderId) {
        return NextResponse.json(
          {
            error:
              "เปิดใช้งาน Google Drive แล้ว แต่ยังไม่ได้ระบุ Folder ID หรือ Folder Link ในหน้า Settings กรุณาตั้งค่าก่อนอัปโหลดครับ",
          },
          { status: 400 }
        );
      }

      if (!gdConfig.clientEmail || !gdConfig.privateKey) {
        return NextResponse.json(
          {
            error:
              "เปิดใช้งาน Google Drive แล้ว แต่ยังไม่ได้ใส่ Service Account Email หรือ Private Key ในหน้า Settings กรุณาตั้งค่ากุญแจความปลอดภัยก่อนครับ",
          },
          { status: 400 }
        );
      }

      try {
        const gdResult = await uploadFileToGoogleDrive({
          buffer,
          fileName: file.name || `upload_${Date.now()}`,
          mimeType: fileType,
          folderId: gdConfig.folderId,
          clientEmail: gdConfig.clientEmail,
          privateKey: gdConfig.privateKey,
        });

        return NextResponse.json({
          success: true,
          url: gdResult.url,
          googleDriveFileId: gdResult.fileId,
          webViewLink: gdResult.webViewLink,
          webContentLink: gdResult.webContentLink,
          storage: "google_drive",
          size: file.size,
        });
      } catch (gdErr: any) {
        console.error("Google Drive upload error:", gdErr);
        return NextResponse.json(
          {
            error: `ไม่สามารถอัปโหลดไฟล์ไปยัง Google Drive ได้: ${
              gdErr?.message || "กรุณาตรวจสอบสิทธิ์การแชร์โฟลเดอร์ให้ Service Account"
            }`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Fallback: Local Filesystem or Base64 Data URL
    const mime = fileType || "image/jpeg";
    const ext = path.extname(file.name) || (mime.startsWith("image/") ? ".jpg" : ".pdf");
    const uniqueName = `upload_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}${ext}`;

    let publicUrl = "";

    // Try saving to public/uploads
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, buffer);
      publicUrl = `/api/uploads/${uniqueName}`;
    } catch (fsErr) {
      console.warn("Filesystem write not possible on this environment:", fsErr);

      // On serverless / read-only environments (e.g. Vercel), check size limit
      if (file.size > 1.5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error:
              "เนื่องจากเซิร์ฟเวอร์ Cloud (Vercel) เป็นแบบ Read-Only ไม่สามารถเก็บไฟล์ขนาดใหญ่กว่า 1.5MB ได้ กรุณานำไฟล์ไปไว้ในโฟลเดอร์ Google Drive แล้วคัดลอกลิงก์มาวางแทนครับ",
          },
          { status: 400 }
        );
      }

      publicUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      storage: publicUrl.startsWith("data:") ? "base64" : "local",
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}

