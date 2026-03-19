import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PenSquare, Clock, Eye, ThumbsUp, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sort?: string; q?: string }>;
}) {
  const { tag, sort = "latest", q = "" } = await searchParams;

  const orderBy: any = {};
  if (sort === "most-viewed") {
    orderBy.views = "desc";
  } else if (sort === "most-upvoted") {
    orderBy.upvotes = { _count: "desc" };
  } else {
    orderBy.createdAt = "desc";
  }

  const where: any = {
    status: "PUBLISHED",
  };

  if (tag) {
    where.tags = { contains: tag };
  }
  if (q) {
    where.title = { contains: q };
  }

  const notes = await prisma.note.findMany({
    where,
    orderBy,
    include: {
      author: { select: { fullName: true, id: true } },
      _count: { select: { upvotes: true } }
    }
  });

  // Calculate unique tags for filter
  const allNotes = await prisma.note.findMany({ where: { status: "PUBLISHED" }, select: { tags: true } });
  const uniqueTags = Array.from(new Set(allNotes.flatMap(n => n.tags.split(',').map(t => t.trim().toLowerCase())).filter(Boolean)));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Architecture Notes</h1>
          <p className="text-muted-foreground mt-1">Explore and leverage system design concepts, setups, and references.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Search Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input name="q" placeholder="Search titles..." defaultValue={q} className="pl-9" />
                {tag && <input type="hidden" name="tag" value={tag} />}
                {sort && <input type="hidden" name="sort" value={sort} />}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Sort By</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href={`/notes?sort=latest${tag ? `&tag=${tag}` : ''}${q ? `&q=${q}` : ''}`}>
                <Button variant={sort === "latest" ? "secondary" : "ghost"} className="w-full justify-start h-9">Latest</Button>
              </Link>
              <Link href={`/notes?sort=most-viewed${tag ? `&tag=${tag}` : ''}${q ? `&q=${q}` : ''}`}>
                <Button variant={sort === "most-viewed" ? "secondary" : "ghost"} className="w-full justify-start h-9">Most Viewed</Button>
              </Link>
              <Link href={`/notes?sort=most-upvoted${tag ? `&tag=${tag}` : ''}${q ? `&q=${q}` : ''}`}>
                <Button variant={sort === "most-upvoted" ? "secondary" : "ghost"} className="w-full justify-start h-9">Most Upvoted</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">Tags</CardTitle>
              {tag && <Link href={`/notes?sort=${sort}${q ? `&q=${q}` : ''}`} className="text-xs text-primary hover:underline">Clear</Link>}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.slice(0, 15).map(t => (
                  <Link key={t} href={`/notes?tag=${t}&sort=${sort}${q ? `&q=${q}` : ''}`}>
                    <span className={`inline-block px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${tag === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 hover:bg-muted border-border'}`}>
                      {t}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        <div className="md:col-span-3">
          {notes.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {notes.map((note) => (
                <Link key={note.id} href={`/notes/${note.id}`} className="group h-full">
                  <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md flex flex-col">
                    {note.coverImage && (
                      <div className="h-32 w-full bg-muted overflow-hidden rounded-t-lg">
                        <img src={note.coverImage} alt={note.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardHeader className="p-5 pb-3 grow">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {note.tags.split(',').slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] uppercase tracking-wider bg-secondary text-secondary-foreground font-semibold px-2 py-0.5 rounded">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                      <CardTitle className="text-xl leading-tight line-clamp-2">{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 mt-auto">
                      <p className="text-sm text-muted-foreground mb-4">By {note.author.fullName || "Member"}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {note.readTime} min
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {note.views}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {note._count.upvotes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/10">
              <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notes found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Try adjusting your search filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
