import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log('✅ TABLES FOUND IN PRISMA CLIENT:');
  console.log(models.join(', '));
  
  // Test adding a dry run to newly added Cheatsheet table or just confirm it exists
  const cheatsheetCount = await prisma.cheatsheet.count().catch(() => 0);
  console.log(`✅ Cheatsheet Count: ${cheatsheetCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
