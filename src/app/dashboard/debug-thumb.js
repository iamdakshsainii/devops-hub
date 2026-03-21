require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function isYouTubeType(type) {
  const t = type?.toUpperCase();
  return t === "YOUTUBE" || t === "VIDEO";
}

async function main() {
  const latestResources = await prisma.resource.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  latestResources.forEach(r => {
    const youtubeId = isYouTubeType(r.type) ? extractYouTubeId(r.url || "") : null;
    const finalImageUrl = r.imageUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

    console.log(`TITLE: ${r.title}`);
    console.log(`youtubeId: ${youtubeId}`);
    console.log(`finalImageUrl: ${finalImageUrl}`);
    console.log("---");
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
