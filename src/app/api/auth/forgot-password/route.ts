import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return 200 anyway for security (don't reveal if email exists)
      return NextResponse.json({ message: "If an account exists, a reset link was sent" }, { status: 200 });
    }

    // In a real production app, generate a token, save to DB, and send an email via SendGrid/Resend
    // Example:
    // await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({ message: "If an account exists, a reset link was sent" }, { status: 200 });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
