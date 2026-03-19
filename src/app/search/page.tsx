import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { FileText, Database, Calendar, SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  
  if (!q) {
    redirect("/");
  }

  const query = q.trim();

  const notesPromise = prisma.note.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { tags: { contains: query } }
      ]
    },
    include: { author: { select: { fullName: true } } }
  });

  const resourcesPromise = prisma.resource.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { tags: { contains: query } }
      ]
    }
  });

  const eventsPromise = prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query } },
        { description: { contains: query } }
      ]
    }
  });

  const [notes, resources, events] = await Promise.all([notesPromise, resourcesPromise, eventsPromise]);

  const hasResults = notes.length > 0 || resources.length > 0 || events.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground text-lg">
          Showing results for <span className="text-foreground font-semibold px-1">"{query}"</span>
        </p>
      </div>

      {!hasResults ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-3xl bg-muted/10 border-dashed">
          <div className="bg-background p-4 rounded-full border shadow-sm mb-6">
            <SearchX className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No results found</h2>
          <p className="text-muted-foreground max-w-md">We couldn't find anything matching your search. Try adjusting your keywords or browse the platform.</p>
          <div className="flex gap-4 mt-8">
            <Link href="/notes"><Button variant="outline">Browse Notes</Button></Link>
            <Link href="/events"><Button variant="outline">View Events</Button></Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          
          {notes.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center border-b pb-4">
                 <FileText className="mr-2 h-6 w-6 text-primary" /> Architecture Notes <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{notes.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {notes.map(note => (
                  <Card key={note.id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {note.tags.split(',')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">{note.readTime} min read</span>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-4">By {note.author.fullName || "Community Member"}</p>
                      <Link href={`/notes/${note.id}`}>
                        <Button variant="secondary" className="w-full h-8 cursor-pointer">Read Note</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {resources.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 className="text-2xl font-bold flex items-center border-b pb-4">
                 <Database className="mr-2 h-6 w-6 text-primary" /> Resources <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{resources.length}</span>
              </h2>
              <div className="grid gap-4">
                {resources.map(resource => (
                  <Card key={resource.id} className="group hover:border-foreground/30 transition-all flex flex-col sm:flex-row overflow-hidden">
                    {resource.imageUrl && (
                      <div className="sm:w-48 h-32 sm:h-auto bg-muted shrink-0 border-b sm:border-b-0 sm:border-r overflow-hidden relative">
                         <img src={resource.imageUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold uppercase text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded">{resource.type}</span>
                      </div>
                      <CardTitle className="text-lg mt-1 group-hover:text-primary transition-colors">{resource.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm mt-2">{resource.description}</CardDescription>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                         <Link href={`/resources/${resource.id}`}>
                           <Button variant="secondary" size="sm" className="h-8 group-hover:bg-primary group-hover:text-primary-foreground">View Resource</Button>
                         </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {events.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 className="text-2xl font-bold flex items-center border-b pb-4">
                 <Calendar className="mr-2 h-6 w-6 text-primary" /> Events <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{events.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {events.map(event => (
                  <Card key={event.id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader className="p-5 pb-3 bg-muted/20 border-b">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {event.type}
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                      <div className="text-xs text-muted-foreground pt-4 border-t">
                         Scheduled: {new Date(event.startTime).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
