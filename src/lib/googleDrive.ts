import * as jose from "jose";
import { prisma } from "@/lib/prisma";

export interface GoogleDriveConfig {
  enabled: boolean;
  folderId: string;
  clientEmail?: string;
  privateKey?: string;
}

/**
 * Extracts a clean Google Drive folder ID from either a raw ID
 * or a full Google Drive URL (e.g. https://drive.google.com/drive/folders/1xyz... or /u/0/folders/1xyz...)
 */
export function extractFolderId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Formats a private key string so standard newlines are preserved
 */
export function formatPrivateKey(key: string): string {
  if (!key) return "";
  let clean = key.trim();
  // Strip surrounding quotes if present
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  // Replace escaped \n with actual newlines
  clean = clean.replace(/\\n/g, "\n");
  return clean;
}

/**
 * Loads effective Google Drive configuration, combining Database settings
 * with Environment variable fallbacks.
 */
export async function getEffectiveGoogleDriveConfig(): Promise<GoogleDriveConfig> {
  let dbConfig: Partial<GoogleDriveConfig> = {};

  try {
    if (process.env.DATABASE_URL) {
      const setting = await prisma.siteSetting.findFirst();
      if (setting?.googleDriveSettings) {
        dbConfig = JSON.parse(setting.googleDriveSettings);
      }
    }
  } catch (err) {
    console.warn("Could not load googleDriveSettings from DB:", err);
  }

  // Parse service account JSON from env if provided
  let envClientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let envPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  let envFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      if (parsed.client_email) envClientEmail = parsed.client_email;
      if (parsed.private_key) envPrivateKey = parsed.private_key;
    } catch (e) {
      console.warn("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
    }
  }

  const enabled = dbConfig.enabled ?? Boolean(envFolderId && envClientEmail);
  const folderId = extractFolderId(dbConfig.folderId || envFolderId || "");
  const clientEmail = (dbConfig.clientEmail || envClientEmail || "").trim();
  const privateKey = formatPrivateKey(dbConfig.privateKey || envPrivateKey || "");

  return {
    enabled,
    folderId,
    clientEmail,
    privateKey,
  };
}

/**
 * Generates an OAuth 2.0 Access Token from Google using a Service Account RS256 JWT.
 * Dependency-free via jose.
 */
export async function getGoogleDriveAccessToken(
  clientEmail: string,
  rawPrivateKey: string
): Promise<string> {
  if (!clientEmail || !rawPrivateKey) {
    throw new Error("Missing Google Service Account Client Email or Private Key.");
  }

  const privateKey = formatPrivateKey(rawPrivateKey);
  const pk = await jose.importPKCS8(privateKey, "RS256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(pk);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(
      `Google OAuth authentication failed: ${tokenData.error_description || tokenData.error || "Unknown error"}`
    );
  }

  return tokenData.access_token;
}

/**
 * Tests connection to a Google Drive folder using the given credentials.
 */
export async function testGoogleDriveConnection(config: {
  folderId: string;
  clientEmail: string;
  privateKey: string;
}): Promise<{
  success: boolean;
  message: string;
  folderName?: string;
}> {
  try {
    const cleanFolderId = extractFolderId(config.folderId);
    if (!cleanFolderId) {
      return { success: false, message: "กรุณาระบุ Google Drive Folder ID" };
    }
    if (!config.clientEmail) {
      return { success: false, message: "กรุณาระบุ Service Account Email" };
    }
    if (!config.privateKey) {
      return { success: false, message: "กรุณาระบุ Service Account Private Key" };
    }

    const token = await getGoogleDriveAccessToken(
      config.clientEmail,
      config.privateKey
    );

    // Fetch folder info from Drive v3
    const folderRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        cleanFolderId
      )}?fields=id,name,mimeType,capabilities,trashed`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const folderData = await folderRes.json();
    if (!folderRes.ok) {
      if (folderRes.status === 404) {
        return {
          success: false,
          message: `ไม่พบโฟลเดอร์ ID "${cleanFolderId}" ใน Google Drive หรือยังไม่ได้กดแชร์โฟลเดอร์ให้ ${config.clientEmail}`,
        };
      }
      return {
        success: false,
        message: folderData.error?.message || "ไม่สามารถเข้าถึงโฟลเดอร์ได้",
      };
    }

    if (folderData.trashed) {
      return {
        success: false,
        message: `โฟลเดอร์ "${folderData.name}" อยู่ในถังขยะ (Trash)`,
      };
    }

    if (folderData.mimeType !== "application/vnd.google-apps.folder") {
      return {
        success: false,
        message: `ID ที่ระบุคือไฟล์ "${folderData.name}" ไม่ใช่โฟลเดอร์`,
      };
    }

    return {
      success: true,
      message: `เชื่อมต่อสำเร็จ! สามารถเข้าถึงโฟลเดอร์ "${folderData.name}" ได้เรียบร้อย`,
      folderName: folderData.name,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ Google Drive",
    };
  }
}

/**
 * Uploads a file buffer directly to Google Drive via multipart REST API v3.
 * Automatically makes the file publicly viewable and generates optimized links.
 */
export async function uploadFileToGoogleDrive({
  buffer,
  fileName,
  mimeType,
  folderId,
  clientEmail,
  privateKey,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folderId: string;
  clientEmail: string;
  privateKey: string;
}): Promise<{
  fileId: string;
  url: string;
  webViewLink?: string;
  webContentLink?: string;
}> {
  const token = await getGoogleDriveAccessToken(clientEmail, privateKey);
  const cleanFolderId = extractFolderId(folderId);

  const boundary = `----GDUploadBoundary${Date.now()}`;
  const metadata = {
    name: fileName,
    parents: cleanFolderId ? [cleanFolderId] : [],
  };

  const metadataPart = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}\r\n`
  );

  const fileHeader = Buffer.from(
    `--${boundary}\r\nContent-Type: ${mimeType || "application/octet-stream"}\r\n\r\n`
  );

  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);

  const multipartBody = Buffer.concat([metadataPart, fileHeader, buffer, footer]);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": multipartBody.length.toString(),
      },
      body: multipartBody,
    }
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.id) {
    throw new Error(
      `Google Drive upload error: ${uploadData.error?.message || "Failed to upload file to Google Drive"}`
    );
  }

  const fileId = uploadData.id;

  // Make file publicly readable so site visitors can see image/download PDF
  try {
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      }
    );
  } catch (permErr) {
    console.warn("Could not set public permission on Google Drive file:", permErr);
  }

  // Determine direct preview or display URL
  const isImage = mimeType.startsWith("image/");
  let directUrl: string;

  if (isImage) {
    // High-res direct preview URL that works seamlessly in <img> tags
    directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
  } else {
    // Direct download/preview link for documents & PDFs
    directUrl = uploadData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
  }

  return {
    fileId,
    url: directUrl,
    webViewLink: uploadData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    webContentLink: uploadData.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

export interface DriveImageFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime?: string;
  thumbnailUrl: string;
  fullUrl: string;
  webViewLink?: string;
}

/**
 * Lists all image files in a Google Drive folder using the Service Account credentials.
 */
export async function listFilesInFolder(folderIdOrUrl: string): Promise<{
  files: DriveImageFile[];
  folderName?: string;
  error?: string;
}> {
  const cleanFolderId = extractFolderId(folderIdOrUrl);
  if (!cleanFolderId) {
    return { files: [], error: "Missing folder ID" };
  }

  try {
    const config = await getEffectiveGoogleDriveConfig();
    if (!config.clientEmail || !config.privateKey) {
      return {
        files: [],
        error: "Google Drive Service Account is not configured. Please configure in Admin Settings.",
      };
    }

    const token = await getGoogleDriveAccessToken(config.clientEmail, config.privateKey);

    // Fetch folder name
    let folderName: string | undefined;
    try {
      const folderMetaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cleanFolderId)}?fields=name`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (folderMetaRes.ok) {
        const folderMeta = await folderMetaRes.json();
        folderName = folderMeta.name;
      }
    } catch {}

    // List image files in folder
    const query = `'${cleanFolderId}' in parents and trashed = false and mimeType contains 'image/'`;
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query
      )}&fields=files(id,name,mimeType,size,createdTime,thumbnailLink,webContentLink,webViewLink)&pageSize=100&orderBy=createdTime desc`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    const listData = await listRes.json();
    if (!listRes.ok) {
      throw new Error(listData.error?.message || "Failed to list files from Google Drive");
    }

    const rawFiles: any[] = listData.files || [];
    const files: DriveImageFile[] = rawFiles.map((file) => ({
      id: file.id,
      name: file.name.replace(/\.[^/.]+$/, ""), // clean filename without extension
      mimeType: file.mimeType,
      size: file.size ? Number(file.size) : undefined,
      createdTime: file.createdTime,
      thumbnailUrl: `/api/gallery/image/${file.id}?size=thumb`,
      fullUrl: `/api/gallery/image/${file.id}?size=full`,
      webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    }));

    return { files, folderName };
  } catch (err: any) {
    console.error("Error listing files from Google Drive:", err);
    return { files: [], error: err.message || "Failed to load photos from Google Drive" };
  }
}

/**
 * Fetches raw image media stream from Google Drive via Service Account.
 */
export async function fetchGoogleDriveImage(fileId: string): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
} | null> {
  try {
    const config = await getEffectiveGoogleDriveConfig();
    if (!config.clientEmail || !config.privateKey) {
      return null;
    }

    const token = await getGoogleDriveAccessToken(config.clientEmail, config.privateKey);

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return { buffer, contentType };
  } catch (err) {
    console.warn(`Could not fetch Google Drive image ${fileId}:`, err);
    return null;
  }
}
