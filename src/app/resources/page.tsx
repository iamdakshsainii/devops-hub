import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Youtube, FileText, Link as LinkIcon, Image as ImageIcon, PlusCircle, Database } from "lucide-react";

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
    where.type = type;
  }
  if (q) {
    where.title = { contains: q };
  }

  const resources = await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } }
    }
  });

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
          <p className="text-muted-foreground mt-1">Curated links, PDFs, tools, and videos shared by the community.</p>
        </div>
        <Link href="/resources/new">
          <Button className="rounded-full shadow-md px-6">+ Share Resource</Button>
        </Link>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start sm:items-center gap-3 shadow-sm text-primary">
         <span className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-background border">🎯</span>
         <div>
           <p className="text-sm font-semibold">Earn Community Credits!</p>
           <p className="text-xs text-foreground/80 mt-0.5">Share high-quality resources. Once approved, you earn +10 Score on your profile and get notified!</p>
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
             <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-colors overflow-hidden group">
               {resource.imageUrl && (
                 <div className="w-full h-40 bg-muted overflow-hidden border-b">
                   <img src={resource.imageUrl} alt={resource.title || "Resource cover"} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                 </div>
               )}
               <CardHeader className={resource.imageUrl ? "p-4 pb-2" : "p-5 pb-3"}>
                 <div className="flex items-start justify-between mb-2">
                   <div className="bg-muted p-2 rounded-lg">
                     {getIcon(resource.type)}
                   </div>
                   <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                     {resource.tags.split(',')[0]}
                   </span>
                 </div>
                 <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">{resource.title}</CardTitle>
                 <CardDescription className="line-clamp-2 h-10 mt-2 text-sm">{resource.description}</CardDescription>
               </CardHeader>
               <CardContent className="p-5 pt-2 mt-auto">
                 <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                   <span>By {resource.author.fullName || "Member"}</span>
                   <span>{resource._count.upvotes} Upvotes</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <a href={resource.url} target="_blank" rel="noopener noreferrer" className="w-full">
                     <Button variant="secondary" className="w-full h-8 text-xs">{getButtonText(resource.type)}</Button>
                   </a>
                   <Link href={`/resources/${resource.id}`} className="w-full">
                     <Button variant="outline" className="w-full h-8 text-xs">Details</Button>
                   </Link>
                 </div>
               </CardContent>
             </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/10">
              <Database className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No resources found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Be the first to share a helpful link, video, or document.
              </p>
              <Link href="/resources/new">
                <Button>Share Resource</Button>
              </Link>
          </div>
        )}
      </div>
    </div>
  );
}
