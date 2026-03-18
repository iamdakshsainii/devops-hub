import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Database, Calendar } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  let notes: any[] = [];
  let resources: any[] = [];
  let events: any[] = [];

  if (query) {
    [notes, resources, events] = await Promise.all([
      prisma.note.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query } },
            { tags: { contains: query } }
          ]
        },
        include: { author: { select: { fullName: true } } },
        take: 5
      }),
      prisma.resource.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query } },
            { tags: { contains: query } },
            { description: { contains: query } }
          ]
        },
        include: { author: { select: { fullName: true } } },
        take: 5
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 5
      })
    ]);
  }

  const totalResults = notes.length + resources.length + events.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
      <div className="flex flex-col items-center max-w-2xl mx-auto text-center space-y-6 mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Global Search</h1>
        <form className="relative w-full" action="/search" method="GET">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input 
            name="q"
            defaultValue={query}
            placeholder="Search notes, resources, events..." 
            className="pl-11 h-12 rounded-full border-primary/20 bg-background/50 text-base"
          />
          <Button type="submit" className="absolute right-1 top-1 rounded-full h-10 px-4">
            Search
          </Button>
        </form>
        {query && <p className="text-muted-foreground">{totalResults} results for "{query}"</p>}
      </div>

      {!query ? (
        <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10">
           <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto" />
           <h3 className="text-lg font-medium mb-2">Search the DevOps Hub</h3>
           <p className="text-muted-foreground max-w-sm mx-auto mb-6">
             Find anything across notes, curated resources, and upcoming events in one place.
           </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10">
           <h3 className="text-lg font-medium mb-2">No results found for "{query}"</h3>
           <p className="text-muted-foreground max-w-sm mx-auto">
             Try adjusting your search terms or using broader keywords.
           </p>
        </div>
      ) : (
        <div className="space-y-12">
          {notes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><FileText className="h-5 w-5 text-primary" /> Notes ({notes.length})</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {notes.map(note => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <Card className="hover:border-primary/50 transition-colors h-full">
                      <CardHeader className="p-4 pb-2">
                        <span className="text-xs bg-muted px-2 py-1 rounded w-max text-muted-foreground mb-2">{note.tags.split(',')[0]}</span>
                        <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">By {note.author.fullName || "Member"}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {resources.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Database className="h-5 w-5 text-primary" /> Resources ({resources.length})</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {resources.map(resource => (
                  <Link key={resource.id} href={`/resources/${resource.id}`}>
                    <Card className="hover:border-primary/50 transition-colors h-full">
                      <CardHeader className="p-4 pb-2">
                        <span className="text-xs tracking-wider uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-max mb-2">{resource.type}</span>
                        <CardTitle className="text-lg line-clamp-1">{resource.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">By {resource.author.fullName || "Member"}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {events.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Calendar className="h-5 w-5 text-primary" /> Events ({events.length})</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
