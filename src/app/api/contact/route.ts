import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, reason, message } = await req.json();

    if (!name || !email || !reason || !message) {
       return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Direct system notification for SUPER_ADMINs that someone contacted
    const superAdmins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN" } });

    if (superAdmins.length > 0) {
      await prisma.notification.createMany({
        data: superAdmins.map(admin => ({
          userId: admin.id,
          type: "SYSTEM",
          title: "New Contact/Request",
          message: `${name} (${email}) requested: ${reason.replace(/_/g, " ")}.`,
          link: "/admin" // Can redirect to dashboard alerts 
        }))
      });
    }

    return NextResponse.json({ message: "Request received" }, { status: 201 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
