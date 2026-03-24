import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Heart, MessageSquare, Bookmark, Reply, Tag, Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogContent, SwitchViewButton } from "../blog-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  if (!post) return { title: "Not Found" };
  return { title: `${post.title} | DevOps Hub`, description: post.excerpt || "Engineering blog articles guides layout streams." };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { fullName: true, avatarUrl: true, bio: true, role: true, createdAt: true } },
      resources: { orderBy: { order: "asc" } },
      _count: { select: { comments: true } }
    }
  }).catch(() => null);



  if (!post || post.status === "DELETED") {
    return notFound();
  }

  const comments = await prisma.blogComment.findMany({
    where: { postId: post.id, status: "PUBLISHED" },
    include: {
       author: { select: { fullName: true, avatarUrl: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const authorJoinedStr = new Date(post.author?.createdAt || Date.now()).toLocaleDateString(undefined, {
      year: "numeric", month: "short"
  });

  const formatReadTime = (mins: number) => {
    if (mins >= 43200) return `${Math.floor(mins / 43200)} mon`;
    if (mins >= 1440) return `${Math.floor(mins / 1440)} days`;
    if (mins >= 60) return `${Math.floor(mins / 60)} hr`;
    return `${mins} min`;
  };

  const tagList = post.tags ? post.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

  const relatedResources = tagList.length > 0 ? await prisma.resource.findMany({
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 3
  }) : [];

  const relatedModules = tagList.length > 0 ? await prisma.roadmapStep.findMany({
    where: { OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 2
  }) : [];

  const relatedTools = tagList.length > 0 ? await prisma.tool.findMany({
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 1
  }) : [];

  const relatedCheatsheets = tagList.length > 0 ? await prisma.cheatsheet.findMany({
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 1
  }) : [];

  const recommendedItems = [
     ...relatedResources.map((r: any) => ({ id: r.id, title: r.title, description: r.description || "Access full documentation, videos, and tutorials in-app.", type: r.type || "Link", categoryType: "Resource", url: `/resources/${r.id}` })),
     ...relatedModules.map((m: any) => ({ id: m.id, title: m.title, description: "Master this core step part of roadmap workflows securely.", type: "Module", categoryType: "Module", url: `/roadmap?stepId=${m.id}` })),
     ...relatedCheatsheets.map((c: any) => ({ id: c.id, title: c.title, description: c.description || "Quick-reference sheet loaded with command notes layouts.", type: "Cheatsheet", categoryType: "Cheatsheet", url: `/cheatsheets/${c.slug}` })),
     ...relatedTools.map((t: any) => ({ id: t.id, title: t.name, description: t.description || "Discover premium developer tools setups.", type: "Tool", categoryType: "Tool", url: `/tools/${t.slug}` }))
  ].slice(0, 4);




  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">

      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
         <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      <header className="text-center space-y-4 max-w-3xl mx-auto mb-12">
         <div className="flex justify-center flex-wrap items-center gap-2">
              <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold rounded-full">
                  {post.category}
              </Badge>
         </div>
         <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {post.title}
         </h1>
         {post.excerpt && <p className="text-base text-muted-foreground">{post.excerpt}</p>}

         <div className="flex flex-col items-center justify-center gap-2 pt-4 border-t border-border/20 max-w-xs mx-auto">
             <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs ring-1 ring-primary/20 overflow-hidden">
                      {post.author?.avatarUrl ? (
                          <img src={post.author.avatarUrl} className="h-full w-full object-cover" alt={post.author.fullName || "Author"} />
                      ) : (
                          post.author?.fullName?.[0]?.toUpperCase() || "A"
                      )}
                  </div>
                  <div className="text-left">
                      <p className="text-xs font-bold text-foreground">{post.author?.fullName || "Admin"}</p>
                  </div>
             </div>
         </div>
         
         <div className="flex items-center justify-center gap-4 text-xs font-semibold text-muted-foreground border-t border-border/10 pt-4 mt-2">
             <span>{formattedDate}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatReadTime(post.readTime)}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.viewCount} views</span>
         </div>

         <SwitchViewButton />
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-8">
         {/* Main Content (7/10) */}
         <div className="lg:col-span-7">
              {/* Cover moved below Client layout Toggle to support stacking bounds */}


              <BlogContent post={post} initialComments={comments} />
         </div>

         <div className="lg:col-span-3 space-y-6 sticky top-24 self-start">
              <Card className="bg-gradient-to-br from-primary/5 via-card/40 to-background/10 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] shadow-primary/5">
                  <CardHeader className="pb-3 border-b border-border/10">
                      <CardTitle className="text-xs font-bold flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> Article Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 border border-border/10 bg-background/30 rounded-xl flex flex-col items-center justify-center">
                          <Eye className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold mt-1">{post.viewCount}</span>
                          <span className="text-[10px] text-muted-foreground">Views</span>
                      </div>
                      <div className="p-2 border border-border/10 bg-background/30 rounded-xl flex flex-col items-center justify-center">
                          <Heart className="h-4 w-4 text-red-500/80" />
                          <span className="text-xs font-bold mt-1">{post.likeCount}</span>
                          <span className="text-[10px] text-muted-foreground">Likes</span>
                      </div>
                      <div className="p-2 border border-border/10 bg-background/30 rounded-xl flex flex-col items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-blue-500/80" />
                          <span className="text-xs font-bold mt-1">{post._count.comments}</span>
                          <span className="text-[10px] text-muted-foreground">Comments</span>
                      </div>
                      <div className="p-2 border border-border/10 bg-background/30 rounded-xl flex flex-col items-center justify-center">
                          <Clock className="h-4 w-4 text-emerald-500/80" />
                          <span className="text-xs font-bold mt-1">{formatReadTime(post.readTime)}</span>
                          <span className="text-[10px] text-muted-foreground">Read</span>
                      </div>
                  </CardContent>
              </Card>

              {post.author && (
              <Card className="bg-gradient-to-br from-background/20 via-card/40 to-primary/5 backdrop-blur-xl rounded-2xl border border-border/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] shadow-primary/5">
                  <CardHeader className="pb-3 border-b border-border/10">
                      <CardTitle className="text-sm font-bold">About Author</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 flex flex-col items-center text-center">
                      <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center font-black text-lg ring-2 ring-primary/20 shadow-md overflow-hidden">
                          {post.author?.avatarUrl ? (
                              <img src={post.author.avatarUrl} className="h-full w-full object-cover" alt={post.author.fullName || "Author"} />
                          ) : (
                              post.author?.fullName?.[0]?.toUpperCase() || "A"
                          )}
                      </div>
                      <div>
                          <p className="text-sm font-bold text-foreground">{post.author.fullName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                          "{post.author.bio || "Covers devops ecosystem supportively native triggers workflows pipelines."}"
                      </p>
                      <span className="text-[10px] text-muted-foreground border-t border-border/5 pt-2 w-full mt-2">Joined {authorJoinedStr}</span>
                  </CardContent>
              </Card>
              )}

              {/* Catchy Tags Cloud */}
              {tagList.length > 0 && (
              <Card className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/10">
                  <CardHeader className="p-3 border-b border-border/10 flex items-center gap-1.5"><CardTitle className="text-xs font-bold flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-primary" /> Topics Covered</CardTitle></CardHeader>
                  <CardContent className="p-3 flex flex-wrap gap-1.5">
                     {tagList.map(t => (
                         <Badge key={t} variant="secondary" className="px-2 py-0.5 text-[10px] font-bold bg-primary/5 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-105 transition-all rounded-full cursor-pointer shadow-sm">
                              # {t}
                         </Badge>
                     ))}
                  </CardContent>
              </Card>
              )}

              {/* Related Resources */}
              {relatedResources.length > 0 && (
              <div className="space-y-3">
                  <div className="mb-4">
                      <div className="flex w-full items-center justify-between text-sm font-black uppercase tracking-wider text-muted-foreground/80 px-2 group">
                        <div className="flex items-center gap-2">
                          <Library className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> RECOMMENDED
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 mt-1 px-2 font-medium tracking-wide">Handpicked videos, docs & articles.</p>
                  </div>

                  <div className="space-y-2.5">
                     {relatedResources.map((r: any) => {
                         const isVideo = r.type.toLowerCase() === "video";
                         const isNotes = r.type.toLowerCase() === "notes" || r.type.toLowerCase() === "article";
                         return (
                          <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex flex-col gap-2 p-3.5 border border-border/10 rounded-2xl hover:bg-primary/5 hover:border-primary/20 bg-card/10 backdrop-blur-md transition-all group shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:shadow-primary/5">
                              <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105 shrink-0">
                                       {isVideo ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">{r.title}</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className="text-[9px] font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-md capitalize tracking-wide border border-border/5">{r.type.toLowerCase()}</span>
                                      </div>
                                  </div>
                              </div>
                              {r.description && (
                                  <p className="text-[10px] text-muted-foreground/80 line-clamp-2 leading-relaxed mt-1 font-medium pl-1 border-l border-border/10 ml-2">{r.description}</p>
                              )}
                          </a>
                        )
                      })}
                  </div>
              </div>
              )}



              {/* Related Content (Roadmap, Tool, Cheatsheet) */}
              <Card className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/10 shadow-sm">
                  <CardHeader className="p-4 border-b border-border/10 flex items-center gap-1.5"><CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> Related Content</CardTitle></CardHeader>
                  <CardContent className="p-3 space-y-2">
                     {relatedContent.length > 0 ? relatedContent.map(r => {
                          const isModule = r.type === "Module";
                          const isCheatsheet = r.type === "Cheatsheet";
                          return (
                          <Link key={r.id} href={r.url} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-all border border-transparent hover:border-border/10 hover:shadow-sm group">
                              <div className={`p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all`}>
                                   {isModule ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-emerald-400 transition-colors">{r.title}</p>
                                  <span className="text-[9px] font-bold text-emerald-400/80 bg-emerald-400/5 px-1.5 py-0.5 rounded-full mt-1.5 inline-block capitalize border border-emerald-400/10">{r.type}</span>
                              </div>
                          </Link>
                        )}) : (
                          <div className="p-4 text-center text-xs text-muted-foreground/50 border border-dashed border-border/10 rounded-xl">
                               No related modules or tools.
                          </div>
                      )}
                  </CardContent>
              </Card>

         </div>
      </div>
    </div>
  );
}

