import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteActions } from "@/components/note-actions";
import { Clock, Eye, Calendar, User as UserIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id: id },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } }
    }
  });

  if (!note || (note.status !== "PUBLISHED" && session?.user?.role !== "ADMIN" && note.authorId !== session?.user?.id)) {
    notFound();
  }

  // Increment views
  await prisma.note.update({
    where: { id: note.id },
    data: { views: { increment: 1 } }
  });

  // Check state
  let hasUpvoted = false;
  let hasBookmarked = false;

  if (session?.user?.id) {
    const [upvote, bookmark] = await Promise.all([
      prisma.upvote.findFirst({ where: { userId: session.user.id, itemType: "NOTE", noteId: note.id } }),
      prisma.bookmark.findFirst({ where: { userId: session.user.id, itemType: "NOTE", noteId: note.id } })
    ]);
    hasUpvoted = !!upvote;
    hasBookmarked = !!bookmark;
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {note.coverImage && (
        <div className="w-full h-48 md:h-80 bg-muted rounded-xl overflow-hidden mb-8 border">
          <img src={note.coverImage} alt={note.title} className="w-full h-full object-cover" />
        </div>
      )}

      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {note.tags.split(',').map(t => (
            <span key={t} className="text-xs uppercase tracking-wider bg-secondary text-secondary-foreground font-semibold px-2 py-1 rounded">
              {t.trim()}
            </span>
          ))}
          {note.status === "PENDING" && (
            <span className="text-xs uppercase tracking-wider bg-destructive/10 text-destructive font-semibold px-2 py-1 rounded">
              Pending Review
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{note.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <div className="bg-primary/20 p-1 rounded-full"><UserIcon className="h-4 w-4 text-primary" /></div>
              {note.author.fullName || "Community Member"}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {note.readTime} min read
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {note.views + 1} views
            </div>
          </div>

          <NoteActions 
            itemId={note.id} 
            itemType="NOTE" 
            initialUpvoteCount={note._count.upvotes} 
            hasUpvoted={hasUpvoted} 
            hasBookmarked={hasBookmarked} 
          />
        </div>
      </header>

      {/* Note Content body formatting */}
      <div 
        className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
        prose-headings:tracking-tight prose-a:text-primary 
        prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:border"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
      
    </article>
  );
}
