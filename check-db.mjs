import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, tags: true, status: true }
  });
  console.log(JSON.stringify(events, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
