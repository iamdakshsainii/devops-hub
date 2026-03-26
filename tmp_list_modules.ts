import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const modules = await prisma.module.findMany({
    select: { id: true, title: true, description: true }
  });
  console.log("Available Modules:", JSON.stringify(modules, null, 2));
}

main().finally(() => prisma.$disconnect())
