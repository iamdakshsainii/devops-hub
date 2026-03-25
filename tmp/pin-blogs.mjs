import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.blogPost.updateMany({
    where: { status: 'PUBLISHED' },
    data: { isPinned: true }
  });
  console.log(`Pinned ${count.count} blogs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
