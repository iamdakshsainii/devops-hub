import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteActions } from "@/components/note-actions";
import { Calendar, User as UserIcon, Link as LinkIcon, ExternalLink, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const resource = await prisma.resource.findUnique({
    where: { id: id },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } }
    }
  });

  if (!resource || (resource.status !== "PUBLISHED" && session?.user?.role !== "ADMIN" && resource.authorId !== session?.user?.id)) {
    notFound();
  }

  // Check state
  let hasUpvoted = false;
  let hasBookmarked = false;

  if (session?.user?.id) {
    const [upvote, bookmark] = await Promise.all([
      prisma.upvote.findFirst({ where: { userId: session.user.id, itemType: "RESOURCE", resourceId: resource.id } }),
      prisma.bookmark.findFirst({ where: { userId: session.user.id, itemType: "RESOURCE", resourceId: resource.id } })
    ]);
    hasUpvoted = !!upvote;
    hasBookmarked = !!bookmark;
  }

  return (
    <article className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
      {resource.imageUrl && (
        <div className="relative group w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-black/5 bg-muted">
           <img 
            src={resource.imageUrl} 
            alt={resource.title || "Resource Cover"} 
            className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-125 transition-all duration-1000 blur-3xl opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent opacity-80" />
          <div className="relative w-full h-full flex items-center justify-center p-6 md:p-12 overflow-hidden">
             <img 
               src={resource.imageUrl} 
               alt={resource.title || "Resource Cover"} 
               className="w-full h-full object-cover rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transform-gpu group-hover:scale-[1.02] transition-transform duration-700 ring-1 ring-white/20" 
             />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-6 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                    {resource.type}
                </Badge>
                {resource.status === "PENDING" && (
                    <Badge variant="destructive" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Pending Review
                    </Badge>
                )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] drop-shadow-sm">
                {resource.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-muted-foreground bg-muted/30 w-fit mx-auto px-5 py-2.5 rounded-full border border-border/40">
                <div className="flex items-center gap-2 text-foreground">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        <UserIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {resource.author.fullName || "Community Member"}
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(resource.createdAt).toLocaleDateString()}
                </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
                <NoteActions 
                    itemId={resource.id} 
                    itemType="RESOURCE" 
                    initialUpvoteCount={resource._count.upvotes} 
                    hasUpvoted={hasUpvoted} 
                    hasBookmarked={hasBookmarked} 
                />
                {session?.user?.role === "ADMIN" && (
                    <Link href={`/admin/resources?search=${encodeURIComponent(resource.title)}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-full font-bold gap-2 hover:bg-amber-500/10 hover:text-amber-600 transition-all">
                           <Edit className="h-4 w-4" /> Edit Mode
                        </Button>
                    </Link>
                )}
            </div>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="text-lg md:text-xl leading-relaxed text-foreground/80 font-medium text-center italic opacity-90">
                "{resource.description}"
            </div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 shadow-xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group/link mt-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover/link:scale-110 group-hover/link:rotate-6 transition-all duration-500">
                <LinkIcon className="h-10 w-10 text-primary shadow-sm" />
            </div>
            <div className="space-y-2">
                <h3 className="font-black text-2xl tracking-tight">Access the Resource</h3>
                <p className="text-sm text-muted-foreground font-mono bg-muted/60 px-4 py-2 rounded-lg border max-w-sm truncate mx-auto">{resource.url}</p>
            </div>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="relative z-10">
                <Button size="lg" className="h-14 px-10 rounded-full font-black text-lg shadow-2xl hover:scale-105 transition-transform bg-primary hover:bg-primary/90">
                    Open Resource <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
            </a>
        </div>
        
        {resource.tags && (
            <div className="flex flex-wrap justify-center gap-2 pt-8">
                {resource.tags.split(",").map(t => (
                    <span key={t} className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground border border-border/20 shadow-sm hover:bg-primary/5 transition-colors">
                        #{t.trim()}
                    </span>
                ))}
            </div>
        )}
      </div>
    </article>
  );
}
