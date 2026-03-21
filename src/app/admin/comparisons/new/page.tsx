import { prisma } from "@/lib/prisma";
import { ComparisonForm } from "../comparison-form";

export const dynamic = "force-dynamic";

export default async function NewComparisonPage() {
  const tools = await prisma.tool.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Comparison</h1>
          <p className="text-muted-foreground text-sm">
             Setup bench aggregates pitting two platforms platforms together.
          </p>
        </div>
      </div>

      <ComparisonForm tools={tools} />
    </div>
  );
}
