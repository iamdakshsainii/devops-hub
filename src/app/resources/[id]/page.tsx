import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteActions } from "@/components/note-actions";
import { Calendar, User as UserIcon, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      {resource.imageUrl && (
        <div className="w-full h-64 md:h-96 bg-muted rounded-xl bg-card overflow-hidden mb-8 border">
          <img src={resource.imageUrl} alt={resource.title || "Resource Cover"} className="w-full h-full object-cover" />
        </div>
      )}
      <header className="mb-8 space-y-6 bg-card border rounded-xl p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex flex-wrap gap-2">
            <span className="text-xs uppercase tracking-wider bg-primary/10 text-primary font-bold px-2 py-1 rounded">
              {resource.type}
            </span>
            {resource.tags.split(',').map(t => (
              <span key={t} className="text-xs uppercase tracking-wider bg-secondary text-secondary-foreground font-semibold px-2 py-1 rounded">
                {t.trim()}
              </span>
            ))}
            {resource.status === "PENDING" && (
              <span className="text-xs uppercase tracking-wider bg-destructive/10 text-destructive font-semibold px-2 py-1 rounded">
                Pending Review
              </span>
            )}
          </div>
          <NoteActions 
            itemId={resource.id} 
            itemType="RESOURCE" 
            initialUpvoteCount={resource._count.upvotes} 
            hasUpvoted={hasUpvoted} 
            hasBookmarked={hasBookmarked} 
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{resource.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground pb-6 border-b">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <div className="bg-primary/20 p-1 rounded-full"><UserIcon className="h-4 w-4 text-primary" /></div>
            {resource.author.fullName || "Community Member"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(resource.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="pt-2 pb-6 text-lg leading-relaxed text-foreground/90">
          {resource.description}
        </div>

        <div className="bg-muted/50 p-6 rounded-lg border border-primary/20 flex flex-col items-center justify-center text-center space-y-4">
          <LinkIcon className="h-8 w-8 text-primary opacity-80" />
          <div>
            <h3 className="font-semibold text-lg">Ready to explore?</h3>
            <p className="text-sm text-muted-foreground mt-1 px-4 truncate max-w-[500px]">{resource.url}</p>
          </div>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
             <Button size="lg" className="mt-2">
               Open Resource <ExternalLink className="ml-2 h-4 w-4" />
             </Button>
          </a>
        </div>
      </header>
    </article>
  );
}
