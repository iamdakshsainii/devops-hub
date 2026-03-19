import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized: Super Admin required." }, { status: 403 });
    }

    const { requestId, userId, action, permissions } = await req.json();

    if (!requestId || !userId || !action) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Update the request status
    await prisma.adminRequest.update({
      where: { id: requestId },
      data: { status: action } // "APPROVE" or "REJECT"
    });

    if (action === "APPROVE") {
      // Promote the user and set explicit permissions
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: "ADMIN",
          permissions: permissions || "", // "MANAGE_NOTES,MANAGE_EVENTS"
        }
      });

      // Notify User
      await prisma.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: "Admin Privileges Granted",
          message: `Your request has been approved. You have been granted the following permissions: ${permissions ? permissions.replace(/MANAGE_/g, "").replace(/,/g, ", ") : "None"}.`,
          link: "/admin"
        }
      });
    } else {
      // Notify User
      await prisma.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: "Admin Request Declined",
          message: "A Super Admin has reviewed your request but chose not to grant permissions at this time.",
        }
      });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
