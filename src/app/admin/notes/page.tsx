import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminApprovalActions } from "@/components/admin-approval-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNotesPage() {
  const pendingNotes = await prisma.note.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { fullName: true, email: true } } }
  });

  const publishedNotes = await prisma.note.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { author: { select: { fullName: true } } }
  });

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notes & Modules Queue</h1>
            <p className="text-muted-foreground mt-1">Direct master panel managing community-submitted learning payloads.</p>
          </div>
          <Link href="/notes/new">
             <Button size="sm">+ Create Note</Button>
          </Link>
        </div>

        {pendingNotes.length > 0 ? (
          <div className="space-y-4">
            {pendingNotes.map(note => (
              <Card key={note.id}>
                <CardHeader className="p-5 pb-3 bg-muted/20 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded mr-2">
                        {note.tags}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Link href={`/notes/${note.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                       </Link>
                       <AdminApprovalActions itemId={note.id} itemType="NOTE" initialStatus={note.status} />
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-3">{note.title}</CardTitle>
                  <CardDescription>Submitted by {note.author.fullName} ({note.author.email})</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex gap-4 items-center border-b pb-4 mb-4 text-sm text-muted-foreground">
                    <span>Read length: {note.readTime} min</span>
                    <a href={`/notes/${note.id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-7 text-xs">Preview Note <ExternalLink className="ml-1.5 h-3 w-3" /></Button>
                    </a>
                  </div>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 opacity-80"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border border-dashed rounded-xl p-12 text-center bg-muted/10">
             <p className="text-muted-foreground">The notes queue is empty. Great job!</p>
          </div>
        )}
      </section>

      <section className="space-y-6 pt-8 border-t">
        <h2 className="text-xl font-bold tracking-tight">Recently Published</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {publishedNotes.map(note => (
             <Card key={note.id} className="opacity-80">
               <CardHeader className="p-4 pb-2">
                 <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
               </CardHeader>
               <CardContent className="p-4 pt-0 flex justify-between items-end">
                 <p className="text-xs text-muted-foreground">By {note.author.fullName}</p>
                 <div className="flex items-center gap-1">
                    <Link href={`/notes/${note.id}/edit`}>
                       <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <AdminApprovalActions itemId={note.id} itemType="NOTE" initialStatus={note.status} />
                 </div>
               </CardContent>
             </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
