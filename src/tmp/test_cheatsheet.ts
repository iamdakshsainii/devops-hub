import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
     console.error("No user found in DB");
     return;
  }
  
  const payload = {
    title: "Container Lifecycle Management",
    slug: "container-lifecycle-management-test-" + Date.now(),
    description: "A production-ready Docker cheatsheet covering container lifecycle...",
    category: "Docker",
    icon: "📋",
    difficulty: "INTERMEDIATE",
    readTime: 10,
    coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b",
    tags: "Docker, Containers, DevOps",
    status: "DRAFT",
    authorId: user.id,
    sections: [
      {
        title: "Container Lifecycle Management",
        order: 0,
        subsections: [
          {
            title: "Create and Start a Container",
            content: "Run a named container in detached mode with port binding:\n\n```bash\ndocker run -d --name my-app -p 8080:80 nginx:latest\n```",
            order: 0
          }
        ]
      }
    ]
  };

  try {
    const cheatsheet = await prisma.$transaction(async (tx) => {
      const createdCheatsheet = await tx.cheatsheet.create({
        data: {
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          category: payload.category,
          icon: payload.icon,
          difficulty: payload.difficulty,
          readTime: payload.readTime,
          coverImage: payload.coverImage,
          tags: payload.tags,
          status: payload.status,
          authorId: payload.authorId
        }
      });

      for (const sec of payload.sections) {
        const createdSec = await tx.cheatsheetSection.create({
          data: {
            title: sec.title,
            order: sec.order,
            cheatsheetId: createdCheatsheet.id
          }
        });

        if (sec.subsections) {
          await tx.cheatsheetSubsection.createMany({
            data: sec.subsections.map((sub) => ({
              title: sub.title,
              content: sub.content,
              order: sub.order,
              sectionId: createdSec.id
            }))
          });
        }
      }
      return createdCheatsheet;
    });
    console.log("Success! Created cheatsheet:", cheatsheet.id);
  } catch (error) {
    console.error("Transaction failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
