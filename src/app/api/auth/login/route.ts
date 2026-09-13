import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth";
import { ensureDefaultAdminAndData } from "@/lib/autoSeed";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      if (userCount === 0) {
        return NextResponse.json(
          {
            error: "ยังไม่มีบัญชีผู้ดูแลระบบในระบบ กรุณาคลิกเพื่อทำการตั้งค่าบัญชีในครั้งแรก",
            needsSetup: true,
          },
          { status: 400 }
        );
      }
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.warn("Database lookup failed during login:", dbErr);
    }

    let isMatch = false;

    if (user) {
      isMatch = await verifyPassword(password, user.passwordHash);
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user?.id || "default-admin-id",
      email: user?.email || cleanEmail,
      name: user?.name || "User Portfolio",
      role: user?.role || "ADMIN",
    };

    const token = await signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    // Set secure session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
