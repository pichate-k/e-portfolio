import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdminAndData } from "@/lib/autoSeed";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      profile: {
        fullName: "Dr. Pichate K.",
        fullNameTh: "ดร. พิเชษฐ์ เค.",
        currentPosition: "Assistant Professor & Lead AI Researcher",
        currentPositionTh: "ผู้ช่วยศาสตราจารย์ และหัวหน้าทีมนักวิจัย AI",
        workplace: "Faculty of Engineering, Rajamangala University of Technology Thanyaburi",
        workplaceTh: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
        address: "Pathum Thani, Thailand",
        addressTh: "จ.ปทุมธานี ประเทศไทย",
        email: "pichate.k@rmutt.ac.th",
        phone: "+66 (0) 2-549-3400",
        websiteUrl: "https://pichatek.com",
        linkedinUrl: "https://linkedin.com/in/pichatek",
        githubUrl: "https://github.com/pichatek",
        avatarUrl: "",
        bio: "Academic researcher and engineering educator specializing in Machine Learning, Embedded Systems, and Intelligent Data Engineering.",
        bioTh: "นักวิจัยและอาจารย์ผู้เชี่ยวชาญด้านการเรียนรู้ของเครื่อง และระบบสมองกลฝังตัว",
      },
      setting: {
        siteTitle: "Dr. Pichate K. Portfolio",
        bioTagline: "Assistant Professor, AI Researcher & Engineering Educator",
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
        siteTitle: setting?.siteTitle || "Pichate K. Portfolio",
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
