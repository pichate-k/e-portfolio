import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { ensureDefaultAdminAndData, checkAdminExists } from "@/lib/autoSeed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminExists = await checkAdminExists();
    return NextResponse.json({
      needsSetup: !adminExists,
    });
  } catch (error: any) {
    console.error("Check setup status error:", error);
    return NextResponse.json(
      { needsSetup: true, error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminExists = await checkAdminExists();
    if (adminExists) {
      return NextResponse.json(
        {
          error:
            "ระบบได้รับการตั้งค่าบัญชีผู้ดูแลระบบ (Admin) เรียบร้อยแล้ว ไม่สามารถลงทะเบียนหรือตั้งค่าซ้ำได้",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, confirmPassword, cvDownloadPassword } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อ-นามสกุล หรือ Display Name ของผู้ดูแลระบบ" },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "กรุณาระบุอีเมลที่ถูกต้องสำหรับใช้เข้าสู่ระบบ" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // 1. Ensure DB tables and default content exist
    await ensureDefaultAdminAndData();

    // 2. Hash Password
    const passwordHash = await hashPassword(password);

    // 3. Create Admin User
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: "ADMIN",
      },
    });

    // 4. Update Profile with new admin name and email
    try {
      await prisma.profile.updateMany({
        data: {
          fullName: cleanName,
          email: cleanEmail,
        },
      });
    } catch (profErr) {
      console.warn("Could not update profile during setup:", profErr);
    }

    // 5. Update CV Download password if custom password provided
    if (cvDownloadPassword && cvDownloadPassword.trim()) {
      try {
        const dlHash = await hashPassword(cvDownloadPassword.trim());
        await prisma.siteSetting.updateMany({
          data: {
            downloadPasswordHash: dlHash,
          },
        });
      } catch (setErr) {
        console.warn("Could not update download password during setup:", setErr);
      }
    }

    // 6. Sign JWT session and log in immediately
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: "ตั้งค่าบัญชีผู้ดูแลระบบเสร็จสมบูรณ์ พร้อมเข้าสู่ระบบ",
      user: sessionPayload,
      redirect: "/admin",
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการตั้งค่าผู้ดูแลระบบ" },
      { status: 500 }
    );
  }
}
