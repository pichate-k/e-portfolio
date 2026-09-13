import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdminAndData } from "@/lib/autoSeed";
import { GalleryLanding } from "@/components/gallery/GalleryLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activity Gallery | User Portfolio",
  description:
    "Photographic gallery of academic engineering workshops, research demonstrations, and scientific conferences.",
};

export default async function GalleryPage() {
  let activities: any[] = [];

  try {
    await ensureDefaultAdminAndData();
    activities = await (prisma as any).galleryActivity.findMany({
      where: { isVisible: true },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.warn("Could not query gallery activities:", err);
  }

  return <GalleryLanding initialActivities={activities} />;
}
