import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourceCard } from "@/components/resource-card";
import { Search, FileText, Video, List, BookOpen, Database, Book, PlusCircle, Layers } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const FILTERS = [
  { label: "All", value: "ALL", icon: Layers },
  { label: "Docs", value: "DOCUMENTATION", icon: Book },
  { label: "Videos", value: "VIDEO", icon: Video },
  { label: "Playlists", value: "PLAYLIST", icon: List },
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

  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));

  const resources = await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } },
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10 relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-border/40">
        <div className="max-w-xl">
          <Badge variant="outline" className="mb-4 text-primary bg-primary/10 border-primary/20 tracking-[0.15em] font-extrabold text-[10px] uppercase shadow-sm">
             Curated Library
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
            Community Resources
          </h1>
          <p className="text-muted-foreground text-[15px] md:text-base leading-relaxed max-w-lg">
            A handpicked collection of high-quality tools, documentation, videos, and cheat sheets carefully organized to accelerate your learning.
          </p>
        </div>
        
        {isAdmin && (
           <Link href="/admin/resources/new" target="_blank" className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
               <Button className="font-extrabold gap-2 h-11 px-6 bg-amber-500 hover:bg-amber-600 text-black rounded-xl shadow-[0_5px_15px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 transition-all w-full md:w-auto">
                   <PlusCircle className="h-4 w-4" /> Add Resource
               </Button>
           </Link>
        )}
      </div>

      {/* Modern Search & Filter Bar - FORCED INLINE */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-center justify-between bg-card p-2 md:p-3 rounded-2xl border shadow-xl backdrop-blur-3xl">
        <form method="GET" action="/resources" className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            name="q"
            placeholder="Search resources..."
            defaultValue={q}
            className="pl-10 h-10 bg-background/50 border-0 shadow-inner rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 text-[14px] font-medium"
          />
          {activeType && <input type="hidden" name="type" value={activeType} />}
        </form>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = f.value === "ALL" ? !activeType : activeType === f.value;

            return (
              <Link
                key={f.value}
                href={`/resources?type=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="flex-shrink-0"
              >
                <Button
                  variant={isActive ? "default" : "secondary"}
                  size="sm"
                  className={`gap-1.5 h-8 px-3.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    isActive 
                      ? "shadow-md bg-primary text-primary-foreground" 
                      : "bg-muted/40 hover:bg-muted text-muted-foreground/80 hover:text-foreground border-transparent border"
                  }`}
                >
                  <Icon className={`h-3 w-3 ${isActive ? "opacity-100" : "opacity-40"}`} />
                  {f.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} isAdmin={isAdmin} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center border-2 rounded-3xl border-dashed bg-muted/5">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
               <Database className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight">No resources found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-[15px]">
              We couldn't find anything matching your search. Try different keywords or clear your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
