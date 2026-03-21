import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ComparisonsList } from "./comparisons-list";

export const dynamic = "force-dynamic";

export default async function AdminComparisonsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const comparisons = await prisma.toolComparison.findMany({
    where: {
      status: { not: "DELETED" },
    },
    include: {
      toolA: { select: { name: true } },
      toolB: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tool Comparisons</h1>
          <p className="text-muted-foreground text-sm">
             Create vs layouts benchmarking different platform utilities setup native.
          </p>
        </div>
      </div>

      <ComparisonsList initialData={comparisons} />
    </div>
  );
}
