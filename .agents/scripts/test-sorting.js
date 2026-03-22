const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const latestResources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, title: true, createdAt: true }
  });
  console.log("== Latest Resources (desc) ==");
  console.log(latestResources);

  const upcomingEvents = await prisma.event.findMany({
    orderBy: { startTime: "asc" },
    take: 4,
    select: { id: true, title: true, startTime: true }
  });
  console.log("\n== Upcoming Events (asc) ==");
  console.log(upcomingEvents);

  const mySubmissions = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, title: true, createdAt: true }
  });
  console.log("\n== My Submissions (desc) ==");
  console.log(mySubmissions);
  
  await prisma.$disconnect();
}

main().catch(console.error);
