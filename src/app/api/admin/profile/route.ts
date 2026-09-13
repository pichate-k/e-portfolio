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
      googleScholarUrl: "",
      avatarUrl: "",
      bio: "Academic researcher and engineering educator specializing in Machine Learning, Embedded Systems, and Intelligent Data Engineering.",
      bioTh: "นักวิจัยและอาจารย์ผู้เชี่ยวชาญด้านการเรียนรู้ของเครื่อง และระบบสมองกลฝังตัว",
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
      fullName: data.fullName || "Dr. Pichate K.",
      fullNameTh: data.fullNameTh || null,
      currentPosition: data.currentPosition || "Assistant Professor & Lead AI Researcher",
      currentPositionTh: data.currentPositionTh || null,
      workplace: data.workplace || "Faculty of Engineering, Rajamangala University of Technology Thanyaburi",
      workplaceTh: data.workplaceTh || null,
      address: data.address || "Pathum Thani, Thailand",
      addressTh: data.addressTh || null,
      email: data.email || "pichate.k@rmutt.ac.th",
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
