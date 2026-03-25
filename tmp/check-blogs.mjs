import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const blogs = await prisma.blogPost.findMany({
    where: { isPinned: true },
    select: { title: true, coverImage: true }
  });
  console.log(JSON.stringify(blogs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
