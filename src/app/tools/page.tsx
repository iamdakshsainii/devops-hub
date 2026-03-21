import { prisma } from "@/lib/prisma";
import { ToolsClient } from "./tools-client";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await prisma.tool.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">DevOps Tools</h1>
        <p className="text-lg text-muted-foreground">
          Explore every tool in the DevOps ecosystem, documentation setups overlays layout.
        </p>
      </div>

      <ToolsClient initialData={tools} />
    </div>
  );
}
