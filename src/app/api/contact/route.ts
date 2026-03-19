import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, reason, message } = await req.json();

    if (!name || !email || !reason || !message) {
       return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Save to database
    const contactReq = await prisma.contactRequest.create({
      data: { name, email, reason, message }
    });

    const superAdmins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN" } });

    if (superAdmins.length > 0) {
      await prisma.notification.createMany({
        data: superAdmins.map(admin => ({
          userId: admin.id,
          type: "SYSTEM",
          title: "New Contact/Request",
          message: `${name} requested: ${reason.replace(/_/g, " ")}.`,
          link: `/admin/requests` // Redirect to detailed panel
        }))
      });
    }

    return NextResponse.json({ message: "Request received" }, { status: 201 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
