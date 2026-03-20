import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.note.count();
  const notes = await prisma.note.findMany({
    select: { id: true, title: true, status: true, createdAt: true },
    take: 10,
  });
  console.log(`Total notes in DB: ${count}`);
  notes.forEach(n => console.log(`  [${n.status}] ${n.title} — ${n.createdAt.toISOString().split("T")[0]}`));
  await prisma.$disconnect();
}

main().catch(console.error);
