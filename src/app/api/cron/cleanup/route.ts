import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function extractPublicId(url: string): string | null {
  const match = url.match(/\/v\d+\/([^\s]+)\.\w+$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

async function destroyCloudinaryImages(contentBlock: string) {
  const imgMatches = Array.from(contentBlock.matchAll(/!\[.*?\]\((https:\/\/res\.cloudinary\.com\/.*?)\)/g));
  const htmlImgMatches = Array.from(contentBlock.matchAll(/<img[^>]+src="(https:\/\/res\.cloudinary\.com\/[^">]+)"/g));

  const imageUrls = Array.from(new Set([
    ...imgMatches.map(m => m[1]),
    ...htmlImgMatches.map(m => m[1])
  ]));

  for (const url of imageUrls) {
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (err) {
        console.error(`Failed deleting Cloudinary asset ${publicId}:`, err);
      }
    }
  }
}

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Auth header
  const authHeader = request.headers.get("Authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const olderThan30Days = new Date();
  olderThan30Days.setDate(olderThan30Days.getDate() - 30);

  const stats = { cheatsheets: 0, blogs: 0 };

  try {
    // A. Sweeps Cheatsheets
    const cheatsheetsToSweep = await prisma.cheatsheet.findMany({
      where: { status: "DELETED", updatedAt: { lte: olderThan30Days } },
      include: { sections: { include: { subsections: true } } }
    });
    for (const cheatsheet of cheatsheetsToSweep) {
      let contentBlock = (cheatsheet.description || "") + "\n" + (cheatsheet.coverImage || "");
      cheatsheet.sections.forEach(sec => {
          sec.subsections.forEach(sub => { contentBlock += "\n" + sub.content; });
      });
      await destroyCloudinaryImages(contentBlock);
      await prisma.cheatsheet.delete({ where: { id: cheatsheet.id } });
      stats.cheatsheets++;
    }

    // B. Sweeps BlogPosts
    const blogsToSweep = await prisma.blogPost.findMany({
      where: { status: "DELETED", updatedAt: { lte: olderThan30Days } }
    });
    for (const blog of blogsToSweep) {
       const contentBlock = (blog.content || "") + "\n" + (blog.coverImage || "") + "\n" + (blog.excerpt || "");
       await destroyCloudinaryImages(contentBlock);
       await prisma.blogPost.delete({ where: { id: blog.id } });
       stats.blogs++;
    }

    // C. Sweeps Tools - decommissioned

    return NextResponse.json({ success: true, message: "Cleanup complete", stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
