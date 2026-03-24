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

async function runCleanup() {
  console.log("Starting soft-delete sweeping...");

  const olderThan30Days = new Date();
  olderThan30Days.setDate(olderThan30Days.getDate() - 30);

  try {
    // 1. Find Cheatsheets soft-deleted over 30 days ago
    const cheatsheetsToSweep = await prisma.cheatsheet.findMany({
      where: {
        status: "DELETED",
        updatedAt: { lte: olderThan30Days }
      },
      include: {
        sections: { include: { subsections: true } }
      }
    });

    console.log(`Found ${cheatsheetsToSweep.length} cheatsheets candidates for Hard Deletion.`);

    for (const cheatsheet of cheatsheetsToSweep) {
      console.log(`Hard deleting cheatsheet: [${cheatsheet.id}] ${cheatsheet.title}`);

      // Collect all raw content to parse media URLs
      let contentBlock = cheatsheet.description || "";
      cheatsheet.sections.forEach(sec => {
          sec.subsections.forEach(sub => {
              contentBlock += "\n" + sub.content;
          });
      });

      // Find Cloudinary matches
      const imgMatches = Array.from(contentBlock.matchAll(/!\[.*?\]\((https:\/\/res\.cloudinary\.com\/.*?)\)/g));
      const htmlImgMatches = Array.from(contentBlock.matchAll(/<img[^>]+src="(https:\/\/res\.cloudinary\.com\/[^">]+)"/g));

      const imageUrls = Array.from(new Set([
        ...imgMatches.map(m => m[1]),
        ...htmlImgMatches.map(m => m[1])
      ]));

      // Destroy pictures in Cloudinary
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

      // Hard Delete from DB
      await prisma.cheatsheet.delete({
        where: { id: cheatsheet.id }
      });
      console.log(`Hard deleted from DB: ${cheatsheet.id}`);
    }

    console.log("Cleanup cycle complete!");
  } catch (err) {
    console.error("Cleanup sweeping failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runCleanup();
