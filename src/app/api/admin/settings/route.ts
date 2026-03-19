import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ message: "Key required" }, { status: 400 });

  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return NextResponse.json({ value: setting?.value || "7" });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ message: "Key required" }, { status: 400 });

    await prisma.systemSetting.upsert({
         where: { key },
         update: { value: value.toString() },
         create: { key, value: value.toString() }
    });

    return NextResponse.json({ message: "Updated" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
