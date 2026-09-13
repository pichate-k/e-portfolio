import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdminAndData } from "@/lib/autoSeed";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      profile: {
        fullName: "User Name",
        fullNameTh: "ผู้ใช้งานระบบ",
        currentPosition: "Researcher & Software Engineer",
        currentPositionTh: "นักวิจัยและวิศวกรซอฟต์แวร์",
        workplace: "Faculty of Engineering, University",
        workplaceTh: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัย",
        address: "Bangkok, Thailand",
        addressTh: "กรุงเทพมหานคร ประเทศไทย",
        email: "user@example.com",
        phone: "+66 (0) 2-000-0000",
        websiteUrl: "https://example.com",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
        avatarUrl: "",
        bio: "Academic researcher and software engineer specializing in Intelligent Systems, Cloud Computing, and Data Engineering.",
        bioTh: "นักวิจัยและวิศวกรซอฟต์แวร์ มุ่งเน้นการพัฒนาระบบอัจฉริยะ คลาวด์คอมพิวติ้ง และวิศวกรรมข้อมูล",
      },
      setting: {
        siteTitle: "Academic & Professional Portfolio",
        bioTagline: "Researcher, Educator & Software Engineer",
        requireCvPassword: true,
      },
      sections: [],
    });
  }

  try {
    await ensureDefaultAdminAndData();
    const profile = await prisma.profile.findFirst();
    const setting = await prisma.siteSetting.findFirst();

    const sections = await prisma.cvSection.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: "asc" },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({
      profile,
      setting: {
        siteTitle: setting?.siteTitle || "Academic & Professional Portfolio",
        bioTagline: setting?.bioTagline || "",
        requireCvPassword: setting?.requireCvPassword ?? true,
      },
      sections,
    });
  } catch (error) {
    console.error("Public CV fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load CV information" },
      { status: 500 }
    );
  }
}
