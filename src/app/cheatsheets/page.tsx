import { prisma } from "@/lib/prisma";
import { CheatsheetsClient } from "./cheatsheets-client";

export const dynamic = "force-dynamic";

export default async function CheatsheetsPage() {
  const cheatsheets = await prisma.cheatsheet.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
      _count: {
         select: { sections: true },
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">DevOps Cheatsheets</h1>
        <p className="text-lg text-muted-foreground">
          Quick reference guides for Docker, Kubernetes, Terraform, Linux and more.
        </p>
      </div>

      <CheatsheetsClient initialData={cheatsheets} />
    </div>
  );
}
