import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, FileText, Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookmarksPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || "notes";

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      note: { include: { author: { select: { fullName: true } } } },
      resource: { include: { author: { select: { fullName: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });

  const noteBookmarks = bookmarks.filter(b => b.itemType === "NOTE" && b.note);
  const resourceBookmarks = bookmarks.filter(b => b.itemType === "RESOURCE" && b.resource);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
        <p className="text-muted-foreground mt-1 text-lg">Your saved notes and resources.</p>
      </div>

      <div className="flex border-b">
        <Link href="/bookmarks?tab=notes" className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Notes ({noteBookmarks.length})
        </Link>
        <Link href="/bookmarks?tab=resources" className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'resources' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Resources ({resourceBookmarks.length})
        </Link>
      </div>

      {activeTab === "notes" && (
        <div className="space-y-6">
          {noteBookmarks.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {noteBookmarks.map(({ note }) => note && (
                <Card key={note.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {note.tags.split(',')[0]}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2 line-clamp-2 leading-tight">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground mb-4">By {note.author?.fullName || "Member"}</p>
                    <Link href={`/notes/${note.id}`}>
                      <Button variant="secondary" className="w-full h-8">Read Note</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-16 border border-dashed rounded-lg bg-muted/10">
               <Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto" />
               <h3 className="text-lg font-medium mb-2">No notes saved</h3>
               <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                 When you find a helpful community note, click the bookmark icon to save it here.
               </p>
               <Link href="/notes"><Button variant="outline">Browse Notes</Button></Link>
             </div>
          )}
        </div>
      )}

      {activeTab === "resources" && (
        <div className="space-y-6">
          {resourceBookmarks.length > 0 ? (
             <div className="grid sm:grid-cols-2 gap-4">
              {resourceBookmarks.map(({ resource }) => resource && (
                <Card key={resource.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {resource.type}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2 line-clamp-2 leading-tight">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm mt-1">{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 mt-auto">
                    <Link href={`/resources/${resource.id}`}>
                      <Button variant="secondary" className="w-full h-8 mt-2">View Resource</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed rounded-lg bg-muted/10">
               <Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto" />
               <h3 className="text-lg font-medium mb-2">No resources saved</h3>
               <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                 When you find a useful PDF, link, or video, click the bookmark icon to save it here.
               </p>
               <Link href="/resources"><Button variant="outline">Browse Resources</Button></Link>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
