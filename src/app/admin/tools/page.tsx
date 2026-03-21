import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ToolsList } from "./tools-list";

export const dynamic = "force-dynamic";

export default async function AdminToolsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const tools = await prisma.tool.findMany({
    where: {
      status: { not: "DELETED" },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Tools</h1>
          <p className="text-muted-foreground text-sm">
            Add and update tools for the catalog directory.
          </p>
        </div>
      </div>

      <ToolsList initialData={tools} />
    </div>
  );
}
