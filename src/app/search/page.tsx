import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { FileText, Database, Calendar, SearchX, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { EventActions } from "@/components/event-actions";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource-card";

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
        { title: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } }
      ]
    },
    include: { author: { select: { fullName: true } } }
  });

  const resourcesPromise = prisma.resource.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } }
      ]
    },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } }
    }
  });

  const roadmapResourcesPromise = prisma.roadmapResource.findMany({
    where: {
      step: { roadmap: { status: "PUBLISHED" } },
      OR: [
        { title: { contains: query, mode: "insensitive" } }
      ]
    }
  });

  const eventsPromise = prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } }
      ]
    } as any
  });

  const cheatsheetsPromise = prisma.cheatsheet.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ]
    }
  });

  const blogPostsPromise = prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } }
      ]
    },
    include: { _count: { select: { comments: true } } }
  });

  const toolsPromise = prisma.tool.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ]
    }
  });

  const modulesPromise = prisma.roadmapStep.findMany({
    where: {
      status: { not: "DELETED" },
      OR: [
        { roadmap: { status: "PUBLISHED" } },
        { roadmapId: null }
      ],
      AND: [
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { tags: { contains: query, mode: "insensitive" } }
          ]
        }
      ]
    } as any,
    include: { 
      roadmap: true,
      _count: { select: { topics: true, resources: true } }
    }
  });

  const [notes, globalResources, roadmapResources, events, modules, cheatsheets, blogPosts, tools] = await Promise.all([
    notesPromise,
    resourcesPromise,
    roadmapResourcesPromise,
    eventsPromise,
    modulesPromise,
    cheatsheetsPromise,
    blogPostsPromise,
    toolsPromise
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

  const seenModuleTitles = new Set();
  const finalModules = [];
  for (const mod of modules) {
    if (!seenModuleTitles.has(mod.title)) {
      seenModuleTitles.add(mod.title);
      finalModules.push(mod);
    }
  }

  const hasResults = notes.length > 0 || resources.length > 0 || events.length > 0 || finalModules.length > 0 || cheatsheets.length > 0 || blogPosts.length > 0 || tools.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground text-lg">
          Showing results for <span className="text-foreground font-semibold px-1">"{query}"</span>
        </p>

        {hasResults && (
          <div className="flex gap-2 flex-wrap pt-2">
            {finalModules.length > 0 && (
              <a href="#modules" className="flex items-center gap-1.5 bg-muted/60 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105">
                📁 Modules ({finalModules.length})
              </a>
            )}
            {blogPosts.length > 0 && (
              <a href="#blog" className="flex items-center gap-1.5 bg-muted/60 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105">
                📝 Blog ({blogPosts.length})
              </a>
            )}
            {cheatsheets.length > 0 && (
              <a href="#cheatsheets" className="flex items-center gap-1.5 bg-muted/60 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105">
                📋 Cheatsheets ({cheatsheets.length})
              </a>
            )}
            {tools.length > 0 && (
              <a href="#tools" className="flex items-center gap-1.5 bg-muted/60 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105">
                🔧 Tools ({tools.length})
              </a>
            )}
            {events.length > 0 && (
              <a href="#events" className="flex items-center gap-1.5 bg-muted/60 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105">
                📅 Events ({events.length})
              </a>
            )}
            {resources.length > 0 && (
              <a href="#resources" className="flex items-center gap-1.5 bg-muted/60 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105">
                📚 Resources ({resources.length})
              </a>
            )}
            {notes.length > 0 && (
              <a href="#notes" className="flex items-center gap-1.5 bg-muted/60 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105">
                📝 Notes ({notes.length})
              </a>
            )}
          </div>
        )}
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
              <h2 id="notes" className="text-2xl font-bold flex items-center border-b pb-4">
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

          {finalModules && finalModules.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 id="modules" className="text-2xl font-bold flex items-center border-b pb-4">
                 <FileText className="mr-2 h-6 w-6 text-primary" /> Modules & Guides <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{finalModules.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {finalModules.map((module: any) => {
                  const href = module.roadmapId ? `/modules/${module.id}?roadmapId=${module.roadmapId}` : `/modules/${module.id}`;
                  const hasTags = module.tags ? module.tags.split(",").filter(Boolean) : [];
                  
                  return (
                    <Link key={module.id} href={href} className="group block h-full">
                      <Card className="h-full hover:border-primary/40 transition-all relative overflow-hidden flex flex-col items-start bg-card">
                        <div 
                          className="absolute top-0 left-0 w-1 h-full opacity-60 group-hover:opacity-100 transition-opacity" 
                          style={{ backgroundColor: module.roadmap?.color || "#3B82F6" }} 
                        />
                        <CardHeader className="pl-6 w-full pb-3 border-b border-border/10">
                          <div className="flex justify-between items-start mb-3">
                            <div className="text-2xl bg-muted/50 p-2.5 rounded-xl shadow-sm border border-border/50 group-hover:bg-primary/5 transition-colors">
                              {module.icon || "📦"}
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider rounded-md border text-muted-foreground/80 bg-background/50 px-2 py-0.5">
                              {module.roadmap ? module.roadmap.title : "Standalone"}
                            </span>
                          </div>
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {module.title}
                          </CardTitle>
                          {hasTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {hasTags.map((t: string) => (
                                <span key={t} className="text-[10px] items-center px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                                  #{t.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="pl-6 pt-3 flex-1 flex flex-col w-full">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{module.description}</p>
                          <div className="flex items-center gap-3 mt-auto pt-3 border-t border-dashed text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                               {module._count?.topics || 0} Topics
                            </span>
                            <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                               {module._count?.resources || 0} Resources
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {resources.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 id="resources" className="text-2xl font-bold flex items-center border-b pb-4">
                 <Database className="mr-2 h-6 w-6 text-primary" /> Resources <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{resources.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource as any} />
                ))}
              </div>
            </section>
          )}

          {events.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 id="events" className="text-2xl font-bold flex items-center border-b pb-4">
                 <Calendar className="mr-2 h-6 w-6 text-primary" /> Events <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{events.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {events.map((event: any) => {
                  const images = event.imageUrls ? event.imageUrls.split(",").filter(Boolean) : [];
                  return (
                    <Card key={event.id} className="group flex flex-col hover:border-primary/50 transition-all overflow-hidden bg-card">
                      {images.length > 0 && (
                        <div className="h-44 w-full overflow-hidden border-b bg-muted/20">
                          <img 
                            src={images[0]} 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      
                      <CardHeader className="p-5 pb-3 bg-muted/20 border-b">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {event.type}
                          </span>
                        </div>
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{event.title}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                          {event.tags && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {event.tags.split(",").filter(Boolean).map((t: string) => (
                                <span key={t} className="text-[10px] items-center px-1.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                                  #{t.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t">
                          <div className="flex items-center text-xs font-medium text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.type === "MEETUP" ? "In-person" : "Online"}
                          </div>
                          <div className="flex items-center gap-2">
                             <EventActions eventId={event.id} isPast={new Date(event.startTime) < new Date()} />
                             {event.externalLink ? (
                              <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="h-8">
                                  Register / View <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              </a>
                             ) : (
                               <Button variant="outline" size="sm" className="h-8" disabled>Link TBA</Button>
                             )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {blogPosts.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 id="blog" className="text-2xl font-bold flex items-center border-b pb-4">
                 <FileText className="mr-2 h-6 w-6 text-sky-500" /> Blog Posts <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{blogPosts.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {blogPosts.map((post: any) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card className="group hover:border-primary/50 transition-colors h-full flex flex-col justify-between">
                         <CardHeader className="p-4">
                             <span className="text-[10px] uppercase font-bold tracking-wider text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded mb-2 w-fit">
                                {post.category || "General"}
                             </span>
                             <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{post.title}</CardTitle>
                         </CardHeader>
                         <CardContent className="p-4 pt-0">
                             <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                             <div className="flex justify-between items-center text-xs text-muted-foreground mt-auto pt-3 border-t">
                                 <span>{post.readTime} min read</span>
                                 <span>{post._count?.comments || 0} comments</span>
                             </div>
                         </CardContent>
                      </Card>
                    </Link>
                ))}
              </div>
            </section>
          )}

          {cheatsheets.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 id="cheatsheets" className="text-2xl font-bold flex items-center border-b pb-4">
                 <FileText className="mr-2 h-6 w-6 text-pink-500" /> Cheatsheets <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cheatsheets.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cheatsheets.map((sheet: any) => (
                    <Link key={sheet.id} href={`/cheatsheets/${sheet.slug}`}>
                      <Card className="group hover:border-primary/50 transition-colors p-4 flex flex-col h-full bg-card/60">
                         <div className="flex items-center gap-3 mb-2">
                             <div className="h-10 w-10 text-xl flex items-center justify-center bg-muted/50 rounded-lg">{sheet.icon || "📋"}</div>
                             <div>
                                 <h4 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1">{sheet.title}</h4>
                                 <span className="text-[10px] text-muted-foreground">{sheet.category}</span>
                             </div>
                         </div>
                         <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{sheet.description}</p>
                      </Card>
                    </Link>
                ))}
              </div>
            </section>
          )}

          {tools.length > 0 && (
            <section className="space-y-6 pt-4">
              <h2 id="tools" className="text-2xl font-bold flex items-center border-b pb-4">
                 <Database className="mr-2 h-6 w-6 text-emerald-500" /> Tools <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{tools.length}</span>
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {tools.map((tool: any) => (
                    <Link key={tool.id} href={`/tools/${tool.slug}`}>
                      <Card className="group hover:border-primary/50 transition-colors p-4 flex items-center gap-3 bg-card/60">
                         <div className="h-10 w-10 text-xl flex items-center justify-center bg-muted/50 rounded-lg">{tool.icon}</div>
                         <div>
                             <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{tool.name}</h4>
                             <span className="text-[10px] text-muted-foreground">{tool.category}</span>
                         </div>
                      </Card>
                    </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
