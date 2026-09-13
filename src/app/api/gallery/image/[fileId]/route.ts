import { NextResponse, NextRequest } from "next/server";
import { fetchGoogleDriveImage } from "@/lib/googleDrive";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;
  if (!fileId) {
    return new NextResponse("Missing file ID", { status: 400 });
  }

  // If this is a demo mockup ID, redirect to sample image
  if (fileId.startsWith("demo-")) {
    return NextResponse.redirect(
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
    );
  }

  try {
    const result = await fetchGoogleDriveImage(fileId);

    if (result && result.buffer) {
      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": result.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }

    // Fallback direct redirect to Google CDN if Service Account is unavailable
    const googleCdnUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    return NextResponse.redirect(googleCdnUrl);
  } catch (err) {
    console.warn(`Error proxying Google Drive image ${fileId}:`, err);
    return NextResponse.redirect(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`);
  }
}
