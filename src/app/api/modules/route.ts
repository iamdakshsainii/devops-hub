import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all published modules (used by public modules page)
export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url);
      const all = searchParams.get("all") === "true";

      const steps = await prisma.roadmapStep.findMany({
         where: all ? {} : { status: "PUBLISHED" },
         orderBy: { createdAt: "desc" },
         include: {
            roadmap: { select: { id: true, title: true, color: true, status: true } },
            _count: { select: { topics: true, resources: true } },
         },
      });

      return NextResponse.json(steps);
   } catch {
      return NextResponse.json({ message: "Server error" }, { status: 500 });
   }
}

// POST — create a standalone module (no roadmap required)
export async function POST(req: Request) {
   try {
      const session = await getServerSession(authOptions);
      if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const { title, description, icon, status: payloadStatus, roadmapId, tags, topics, resources, order } = await req.json();

      if (!title) return NextResponse.json({ message: "Title required" }, { status: 400 });

      // roadmapId is truly optional — null means standalone
      // Never create a dummy "General Modules" roadmap
      const targetRoadmapId = roadmapId || null;

      const maxOrder = await prisma.roadmapStep.aggregate({
         where: targetRoadmapId ? { roadmapId: targetRoadmapId } : { roadmapId: null },
         _max: { order: true },
      });

      const status = payloadStatus || "PENDING";

      const step = await prisma.$transaction(async (tx) => {
         const s = await tx.roadmapStep.create({
            data: {
               title,
               description: description || "",
               icon: icon || "📦",
               order: order !== undefined ? parseInt(order as any) : (maxOrder._max.order ?? -1) + 1,
               roadmapId: targetRoadmapId,
               tags: tags || "",
               status,
               authorId: session.user.id,
               topics: {
                  create: (topics || []).map((t: any, idx: number) => ({
                     title: t.title,
                     content: t.content || "",
                     order: idx,
                  })),
               },
            },
         });

         // Mirror resources to global Resource table
         if (resources?.length) {
            for (let idx = 0; idx < resources.length; idx++) {
               const r = resources[idx];
               if (!r.title && !r.url) continue;

               const created = await tx.roadmapResource.create({
                  data: {
                     stepId: s.id,
                     title: r.title || "",
                     url: r.url || "",
                     type: r.type || "ARTICLE",
                     description: r.description || "",
                     imageUrl: r.imageUrl || null,
                     order: idx,
                  },
               });

               if (r.url) {
                  const existingGlobal = await tx.resource.findFirst({ where: { url: r.url } });
                  if (!existingGlobal) {
                     const global = await tx.resource.create({
                        data: {
                           title: r.title || "Module Resource",
                           url: r.url,
                           type: r.type || "ARTICLE",
                           description: r.description || `Resource from module: ${title}`,
                           tags: tags || "Module",
                           status: "PUBLISHED",
                           authorId: session.user.id,
                        },
                     });
                     await tx.roadmapResource.update({
                        where: { id: created.id },
                        data: { globalResourceId: global.id },
                     });
                  }
               }
            }
         }

         return s;
      });

      return NextResponse.json({ message: "Created", step }, { status: 201 });
   } catch (err) {
      console.error("Module create error:", err);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
   }
}