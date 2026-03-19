const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Delete the duplicate admin entries
  await prisma.user.deleteMany({
    where: { email: "admin@devopshub.com" },
  });
  console.log("Cleaned up duplicate admin accounts");

  // Ensure your email exists and is SUPER_ADMIN
  const user = await prisma.user.upsert({
    where: { email: "sainidaksh70@gmail.com" },
    update: { role: "SUPER_ADMIN", fullName: "Daksh Saini" },
    create: {
      email: "sainidaksh70@gmail.com",
      fullName: "Daksh Saini",
      role: "SUPER_ADMIN",
      passwordHash: require("bcryptjs").hashSync("admin123", 10),
    },
  });
  console.log("SUPER_ADMIN:", user.email, user.role);
}

main().catch(console.error).finally(() => prisma.$disconnect());
