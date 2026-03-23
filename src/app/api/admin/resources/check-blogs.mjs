import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, category: true, tags: true }
  });
  console.log("Total Published Posts:", posts.length);
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
