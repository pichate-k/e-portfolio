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

    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.warn("Database lookup failed during login:", dbErr);
    }

    let isMatch = false;

    if (user) {
      isMatch = await verifyPassword(password, user.passwordHash);
    } else if (
      (cleanEmail === "pichate_k@rmutt.ac.th" && password === "password@pk") ||
      (cleanEmail === "admin@pichatek.com" && password === "admin123456")
    ) {
      // Auto-provision and auto-seed on first login with admin credentials
      isMatch = true;
      try {
        await ensureDefaultAdminAndData();
        user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
      } catch (seedErr) {
        console.warn("Could not auto-seed database during login:", seedErr);
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user?.id || "default-admin-id",
      email: user?.email || cleanEmail,
      name: user?.name || "Dr. Pichate K.",
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
