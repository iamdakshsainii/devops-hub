import { prisma } from "./src/lib/prisma.js";

async function run() {
  const posts = await prisma.blogPost.findMany({ select: { id: true, slug: true, content: true } });
  
  posts.forEach(p => {
    if (p.content.includes("<script>")) {
       console.log(`[FOUND SCRIPT TAG] in ${p.slug}`);
    }
  });

  console.log("Check complete.");
}

run();
