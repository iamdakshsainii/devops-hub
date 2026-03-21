import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const anyUser = await prisma.user.findFirst();
  if (!anyUser) throw new Error("No user found!");

  const tool = await prisma.tool.create({
    data: {
      name: 'Test Setup Node',
      slug: 'test-setup-node-2',
      description: 'Side node inserted via script to check relation links flawlessly.',
      category: 'Other',
      icon: '🔧',
      status: 'PUBLISHED',
      authorId: anyUser.id
    }
  });
  console.log('✅ Tool created:', tool.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
