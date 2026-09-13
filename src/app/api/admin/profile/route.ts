import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ensureTablesExist } from "@/lib/autoSeed";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isDbConfigured = Boolean(process.env.DATABASE_URL);
  let profile = null;

  if (isDbConfigured) {
    try {
      await ensureTablesExist();
      profile = await prisma.profile.findFirst();
    } catch (err) {
      console.warn("Could not fetch profile from DB, using defaults:", err);
    }
  }

  if (!profile) {
    profile = {
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
      googleScholarUrl: "",
      avatarUrl: "",
      bio: "Academic researcher and software engineer specializing in Intelligent Systems, Cloud Computing, and Data Engineering.",
      bioTh: "นักวิจัยและวิศวกรซอฟต์แวร์ มุ่งเน้นการพัฒนาระบบอัจฉริยะ คลาวด์คอมพิวติ้ง และวิศวกรรมข้อมูล",
    } as any;
  }

  return NextResponse.json({
    ...profile,
    _dbConfigured: isDbConfigured,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL is not configured on Vercel! Please add DATABASE_URL in Vercel Dashboard -> Settings -> Environment Variables, then redeploy.",
      },
      { status: 400 }
    );
  }

  try {
    await ensureTablesExist();
    const data = await req.json();
    const existing = await prisma.profile.findFirst();

    const payload = {
      fullName: data.fullName || "User Name",
      fullNameTh: data.fullNameTh || null,
      currentPosition: data.currentPosition || "Researcher & Software Engineer",
      currentPositionTh: data.currentPositionTh || null,
      workplace: data.workplace || "Faculty of Engineering, University",
      workplaceTh: data.workplaceTh || null,
      address: data.address || "Bangkok, Thailand",
      addressTh: data.addressTh || null,
      email: data.email || "user@example.com",
      phone: data.phone || null,
      websiteUrl: data.websiteUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      githubUrl: data.githubUrl || null,
      googleScholarUrl: data.googleScholarUrl || null,
      avatarUrl: data.avatarUrl || null,
      bio: data.bio || null,
      bioTh: data.bioTh || null,
    };

    if (existing) {
      const updated = await prisma.profile.update({
        where: { id: existing.id },
        data: payload,
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.profile.create({
        data: payload,
      });
      return NextResponse.json(created);
    }
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile information" },
      { status: 500 }
    );
  }
}
