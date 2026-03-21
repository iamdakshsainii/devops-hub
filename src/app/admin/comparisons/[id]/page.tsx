import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ComparisonForm } from "../comparison-form";

export const dynamic = "force-dynamic";

export default async function EditComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const comp = await prisma.toolComparison.findUnique({
    where: { id }
  });

  if (!comp) return notFound();

  const tools = await prisma.tool.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, name: true }
  });

  const formatted = {
      ...comp,
      criteria: comp.criteria ? JSON.parse(comp.criteria) : []
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Comparison</h1>
          <p className="text-muted-foreground text-sm">
             Update benchmark aggregates pitting two platforms platforms together.
          </p>
        </div>
      </div>

      <ComparisonForm initialData={formatted} tools={tools} />
    </div>
  );
}
