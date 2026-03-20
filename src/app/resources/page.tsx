import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource-card";
import { Database, Search, FileText, Video, List, FileType2, BookOpen, LayoutGrid } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FILTERS = [
  { label: "All", value: "ALL", icon: LayoutGrid },
  { label: "Article", value: "ARTICLE", icon: FileText },
  { label: "Video", value: "VIDEO", icon: Video },
  { label: "Playlist", value: "PLAYLIST", icon: List },

  { label: "Notes", value: "NOTES", icon: BookOpen },
];

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { type, q = "" } = await searchParams;
  const activeType = type && type !== "ALL" ? type : null;

  const where: any = { status: "PUBLISHED" };

  if (activeType) {
    where.type = activeType;
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

      {/* Search + Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border">
        {/* Search — submits as GET so type param is preserved via hidden input */}
        <form method="GET" action="/resources" className="relative w-full md:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search resources..."
            defaultValue={q}
            className="pl-9 bg-background"
          />
          {activeType && <input type="hidden" name="type" value={activeType} />}
        </form>

        {/* Filter pills with icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 flex-nowrap">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive =
              f.value === "ALL"
                ? !activeType
                : activeType === f.value;

            return (
              <Link
                key={f.value}
                href={`/resources?type=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-1.5 whitespace-nowrap h-8 text-xs font-medium ${isActive ? "font-semibold" : "text-muted-foreground"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {f.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Resource grid */}
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
