import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Youtube, FileText, Link as LinkIcon, Image as ImageIcon, PlusCircle, Database } from "lucide-react";
import { ResourceCard } from "@/components/resource-card";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { type, q = "" } = resolvedSearchParams;

  const where: any = {
    status: "PUBLISHED",
  };

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
    where.title = { contains: q, mode: "insensitive" };
  }

  const resourcesPromise = prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } }
    }
  });

  const roadmapResourcesPromise = prisma.roadmapResource.findMany({
    where: {
      step: { roadmap: { status: "PUBLISHED" } },
      ...(where.type ? { type: where.type } : {}),
      ...(where.title ? { title: where.title } : {})
    },
    orderBy: { createdAt: "desc" }
  });

  const [globalResources, roadmapResources] = await Promise.all([
    resourcesPromise,
    roadmapResourcesPromise
  ]);

  const mergedResources = [
    ...globalResources,
    ...roadmapResources.map((r: any) => ({
      ...r,
      tags: r.tags || "",
      author: { fullName: "Modules Guide" },
      _count: { upvotes: 0 }
    }))
  ];

  const seenUrls = new Set();
  const resources = [];
  for (const res of mergedResources) {
    if (!seenUrls.has(res.url)) {
      seenUrls.add(res.url);
      resources.push(res);
    }
  }

  resources.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getIcon = (type: string) => {
    switch(type) {
      case 'YOUTUBE': return <Youtube className="h-5 w-5 text-red-500" />;
      case 'PDF': return <FileText className="h-5 w-5 text-red-400" />;
      case 'IMAGE': return <ImageIcon className="h-5 w-5 text-green-500" />;
      default: return <LinkIcon className="h-5 w-5 text-primary" />;
    }
  };

  const getButtonText = (type: string) => {
    switch(type) {
      case 'YOUTUBE': return "Watch Video";
      case 'PDF': return "Download PDF";
      case 'IMAGE': return "View Image";
      default: return "Visit Link";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Community Resources</h1>
          <p className="text-muted-foreground mt-1">Curated links, PDFs, tools, and videos published by modern Admins.</p>
        </div>
      </div>
        
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border">
        <form className="relative w-full md:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input name="q" placeholder="Search resources..." defaultValue={q} className="pl-9 bg-background" />
          {type && <input type="hidden" name="type" value={type} />}
        </form>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Link href={`/resources?type=ALL${q ? `&q=${q}` : ''}`}>
             <Button variant={!type || type === "ALL" ? "secondary" : "ghost"} size="sm">All</Button>
          </Link>
          <Link href={`/resources?type=PDF${q ? `&q=${q}` : ''}`}>
             <Button variant={type === "PDF" ? "secondary" : "ghost"} size="sm">PDFs</Button>
          </Link>
          <Link href={`/resources?type=LINK${q ? `&q=${q}` : ''}`}>
             <Button variant={type === "LINK" ? "secondary" : "ghost"} size="sm">Links</Button>
          </Link>
          <Link href={`/resources?type=YOUTUBE${q ? `&q=${q}` : ''}`}>
             <Button variant={type === "YOUTUBE" ? "secondary" : "ghost"} size="sm">YouTube</Button>
          </Link>
          <Link href={`/resources?type=IMAGE${q ? `&q=${q}` : ''}`}>
             <Button variant={type === "IMAGE" ? "secondary" : "ghost"} size="sm">Images</Button>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.length > 0 ? (
          resources.map(resource => (
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
