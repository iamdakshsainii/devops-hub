import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheatsheetsList } from "./cheatsheets-list";

export const dynamic = "force-dynamic";

export default async function AdminCheatsheetsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const cheatsheets = await prisma.cheatsheet.findMany({
    where: {
      status: { not: "DELETED" },
    },
    include: {
      author: {
        select: {
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: { sections: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Cheatsheets</h1>
          <p className="text-muted-foreground text-sm">
            Create, edit, and publish cheatsheets for the community.
          </p>
        </div>
      </div>

      <CheatsheetsList initialData={cheatsheets} />
    </div>
  );
}
