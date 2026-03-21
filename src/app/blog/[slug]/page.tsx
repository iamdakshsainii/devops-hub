import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart, Eye, Heart, MessageSquare, Twitter, Linkedin, Facebook, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogContent } from "../blog-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  if (!post) return { title: "Not Found" };
  return { title: `${post.title} | DevOps Hub`, description: post.excerpt || "Engineering blog articles guides layout streams." };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.blogPost.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
    include: {
      author: { select: { fullName: true, avatarUrl: true, bio: true, role: true, createdAt: true } },
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
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
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">
                     {post.author?.fullName?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="text-left">
                      <p className="text-xs font-bold text-foreground">{post.author?.fullName || "Admin"}</p>
                  </div>
             </div>
         </div>
         
         <div className="flex items-center justify-center gap-4 text-xs font-semibold text-muted-foreground border-t border-border/10 pt-4 mt-2">
             <span>{formattedDate}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime} min</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.viewCount} views</span>
         </div>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-8">
         {/* Main Content (7/10) */}
         <div className="lg:col-span-7">
              {post.coverImage && (
                  <div className="w-full h-64 md:h-80 relative overflow-hidden rounded-2xl border border-border/20 mb-8 bg-muted shadow-sm">
                      <img src={post.coverImage} className="object-cover w-full h-full" alt={post.title} />
                  </div>
              )}
              <BlogContent post={post} initialComments={comments} />
         </div>

         {/* Sidebar (3/10) */}
         <div className="lg:col-span-3 space-y-6">
              <Card className="bg-gradient-to-br from-primary/5 via-card/40 to-background/10 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] shadow-primary/5 sticky top-24">
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
                          <span className="text-xs font-bold mt-1">{post.readTime}m</span>
                          <span className="text-[10px] text-muted-foreground">Read</span>
                      </div>
                  </CardContent>
              </Card>

              {post.author && (
              <Card className="bg-gradient-to-br from-background/20 via-card/40 to-primary/5 backdrop-blur-xl rounded-2xl border border-border/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] shadow-primary/5 sticky top-[18.5rem]">
                  <CardHeader className="pb-3 border-b border-border/10">
                      <CardTitle className="text-sm font-bold">About Author</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 flex flex-col items-center text-center">
                      <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center font-black text-lg ring-2 ring-primary/20 shadow-md">
                           {post.author.fullName?.[0]?.toUpperCase() || "A"}
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
         </div>
      </div>
    </div>
  );
}
