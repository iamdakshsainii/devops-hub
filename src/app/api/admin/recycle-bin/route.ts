import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, type, action } = await req.json();

    if (!id || !type || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (action === "restore") {
      // Restore to PUBLISHED (not PENDING — deleted items were live before deletion)
      switch (type) {
        case "MODULE":
          await prisma.roadmapStep.update({
            where: { id },
            data: { status: "PUBLISHED" },
          });
          break;

        case "RESOURCE":
          await prisma.resource.update({
            where: { id },
            data: { status: "PUBLISHED" },
          });
          // If this resource has a linked RoadmapResource, it's already live
          // in the module — no extra action needed.
          break;

        case "EVENT":
          await prisma.event.update({
            where: { id },
            data: { status: "PUBLISHED" },
          });
          break;

        case "ROADMAP":
          await prisma.roadmap.update({
            where: { id },
            data: { status: "PUBLISHED" },
          });
          break;

        case "CHEATSHEET":
          await prisma.cheatsheet.update({ where: { id }, data: { status: "PUBLISHED" } });
          break;
        case "BLOG":
          await prisma.blogPost.update({ where: { id }, data: { status: "PUBLISHED" } });
          break;
        // case "TOOL" removed - decommissioned

        default:
          return NextResponse.json({ message: "Unknown type" }, { status: 400 });
      }
    } else if (action === "purge") {
      // Permanently delete from database
      switch (type) {
        case "MODULE":
          // Cascade in schema handles topics, subtopics, roadmapResources
          await prisma.roadmapStep.delete({ where: { id } });
          break;

        case "RESOURCE": {
          // Before deleting the global Resource row, clean up any RoadmapResource
          // rows that were mirroring it (have globalResourceId pointing to this id).
          // Without this, RoadmapResource rows become orphans with a dangling reference.
          await prisma.roadmapResource.deleteMany({
            where: { globalResourceId: id },
          });
          await prisma.resource.delete({ where: { id } });
          break;
        }

        case "EVENT":
          await prisma.event.delete({ where: { id } });
          break;

        case "ROADMAP":
          // Cascade in schema handles steps, topics, subtopics, resources
          await prisma.roadmap.delete({ where: { id } });
          break;

        case "CHEATSHEET":
          await prisma.cheatsheet.delete({ where: { id } });
          break;
        case "BLOG":
          await prisma.blogPost.delete({ where: { id } });
          break;
        // case "TOOL" removed - decommissioned

        default:
          return NextResponse.json({ message: "Unknown type" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Success" });
  } catch (err) {
    console.error("[recycle-bin] Error:", err);
    return NextResponse.json({ message: "Operation failed" }, { status: 500 });
  }
}
