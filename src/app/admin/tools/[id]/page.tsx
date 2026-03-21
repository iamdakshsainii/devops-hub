import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ToolForm } from "../tool-form";

export const dynamic = "force-dynamic";

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const tool = await prisma.tool.findUnique({
    where: { id }
  });

  if (!tool) return notFound();

  const formatted = {
      ...tool,
      pros: tool.pros ? JSON.parse(tool.pros) : [],
      cons: tool.cons ? JSON.parse(tool.cons) : [],
      useCases: tool.useCases ? JSON.parse(tool.useCases) : []
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Tool</h1>
          <p className="text-muted-foreground text-sm">
             Update information describing your catalog tools natively.
          </p>
        </div>
      </div>

      <ToolForm initialData={formatted} />
    </div>
  );
}
