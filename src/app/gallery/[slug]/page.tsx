import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdminAndData } from "@/lib/autoSeed";
import { listFilesInFolder, DriveImageFile } from "@/lib/googleDrive";
import { ActivityFolderView } from "@/components/gallery/ActivityFolderView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await ensureDefaultAdminAndData();
  const activity = await (prisma as any).galleryActivity.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
  });

  if (!activity) {
    return {
      title: "Activity Gallery | User Portfolio",
    };
  }

  return {
    title: `${activity.title} | Activity Gallery`,
    description: activity.description || `${activity.title} - ${activity.eventDate} at ${activity.location}`,
  };
}

export default async function ActivityFolderPage({ params }: PageProps) {
  await ensureDefaultAdminAndData();

  const activity = await (prisma as any).galleryActivity.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
  });

  if (!activity) {
    notFound();
  }

  // Fetch photos from Google Drive
  const driveResult = await listFilesInFolder(activity.driveFolderId);
  let files: DriveImageFile[] = driveResult.files;

  // Curated demo photos fallback if folder has no files or offline demo
  if (files.length === 0) {
    if (activity.slug.includes("workshop")) {
      files = [
        {
          id: "demo-w1",
          name: "Edge AI Microcontroller Lab Session",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-w2",
          name: "Neural Network Quantization Demonstration",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-w3",
          name: "Student Engineering Team Group Photo",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-w4",
          name: "Embedded Sensor Integration Hardware",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-w5",
          name: "Model Inference Performance Benchmark",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-w6",
          name: "Certificate Awarding Ceremony",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=85",
        },
      ];
    } else {
      files = [
        {
          id: "demo-c1",
          name: "Keynote Research Paper Presentation",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-c2",
          name: "Conference Stage Demonstration",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-c3",
          name: "Interactive Robotics Exhibition Booth",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-c4",
          name: "International Academic Exchange & Discussion",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=85",
        },
        {
          id: "demo-c5",
          name: "Autonomous Mobile Robot Demonstration",
          mimeType: "image/jpeg",
          thumbnailUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
          fullUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1920&q=85",
        },
      ];
    }
  }

  return (
    <ActivityFolderView
      activity={activity}
      initialFiles={files}
      folderName={driveResult.folderName}
      driveError={driveResult.error}
    />
  );
}
