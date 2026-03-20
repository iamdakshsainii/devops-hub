import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource-card";
import { Database, Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { type, q = "" } = await searchParams;

  // Resource table is now the single source of truth.
  // RoadmapResource rows are mirrored here on every module save.
  // Notes table is empty — not queried here.
  const where: any = { status: "PUBLISHED" };

  if (type && type !== "ALL") {
    if (type === "YOUTUBE") {
      where.type = { in: ["YOUTUBE", "VIDEO"] };
    } else if (type === "LINK") {
      where.type = { in: ["LINK", "ARTICLE", "TOOL"] };
    } else {
      where.type = type;
    }
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const resources = await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } },
    },
  });

  const filters = [
    { label: "All", value: "ALL" },
    { label: "PDFs", value: "PDF" },
    { label: "YouTube", value: "YOUTUBE" },
    { label: "Images", value: "IMAGE" },
    { label: "Links", value: "LINK" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Community Resources ({resources.length})
        </h1>
        <p className="text-muted-foreground mt-1">
          Curated links, PDFs, tools, and videos published by modern Admins.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border">
        <form className="relative w-full md:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search resources..."
            defaultValue={q}
            className="pl-9 bg-background"
          />
          {type && <input type="hidden" name="type" value={type} />}
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {filters.map((f) => (
            <Link key={f.value} href={`/resources?type=${f.value}${q ? `&q=${q}` : ""}`}>
              <Button
                variant={(!type && f.value === "ALL") || type === f.value ? "secondary" : "ghost"}
                size="sm"
              >
                {f.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/10">
            <Database className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}