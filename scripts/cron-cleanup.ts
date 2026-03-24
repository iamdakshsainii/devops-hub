import { PrismaClient } from "@prisma/client";
import { deleteFromCloudinary } from "../src/lib/cloudinary";

const prisma = new PrismaClient();

// Helper to extract public_id from Cloudinary URL
function extractPublicId(url: string): string | null {
  // Matches: .../v12345678/folder/asset_id.jpg
  const match = url.match(/\/v\d+\/([^\s]+)\.\w+$/);
  if (match && match[1]) {
    return match[1]; // Includes folder/file-name without ext
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
        console.log(`Deleted asset: ${publicId}`);
      } catch (err) {
        console.error(`Failed deleting Cloudinary asset ${publicId}:`, err);
      }
    }
  }
}

async function runCleanup() {
  console.log("Starting soft-delete sweeping...");

  const olderThan30Days = new Date();
  olderThan30Days.setDate(olderThan30Days.getDate() - 30);

  try {
    // 1. Find Cheatsheets soft-deleted over 30 days ago
    const cheatsheetsToSweep = await prisma.cheatsheet.findMany({
      where: { status: "DELETED", updatedAt: { lte: olderThan30Days } },
      include: { sections: { include: { subsections: true } } }
    });

    console.log(`Found ${cheatsheetsToSweep.length} cheatsheets candidates for Hard Deletion.`);

    for (const cheatsheet of cheatsheetsToSweep) {
      console.log(`Hard deleting cheatsheet: [${cheatsheet.id}] ${cheatsheet.title}`);
      let contentBlock = (cheatsheet.description || "") + "\n" + (cheatsheet.coverImage || "");
      cheatsheet.sections.forEach(sec => {
          sec.subsections.forEach(sub => { contentBlock += "\n" + sub.content; });
      });
      await destroyCloudinaryImages(contentBlock);
      await prisma.cheatsheet.delete({ where: { id: cheatsheet.id } });
    }

    // 2. Find BlogPosts soft-deleted over 30 days ago
    const blogsToSweep = await prisma.blogPost.findMany({
      where: { status: "DELETED", updatedAt: { lte: olderThan30Days } }
    });
    console.log(`Found ${blogsToSweep.length} blogs candidates for Hard Deletion.`);
    for (const blog of blogsToSweep) {
       console.log(`Hard deleting blog: [${blog.id}] ${blog.title}`);
       const contentBlock = (blog.content || "") + "\n" + (blog.coverImage || "") + "\n" + (blog.excerpt || "");
       await destroyCloudinaryImages(contentBlock);
       await prisma.blogPost.delete({ where: { id: blog.id } });
    }

    // 3. Tools and Comparisons are decommissioned - no action required

    console.log("Cleanup cycle complete!");
  } catch (err) {
    console.error("Cleanup sweeping failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runCleanup();
