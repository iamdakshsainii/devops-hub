import { prisma } from "@/lib/prisma";
import { BlogClient } from "./blog-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
 
export default async function BlogPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));
 
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
      _count: {
         select: { comments: true },
      }
    },
    orderBy: { createdAt: "desc" },
  });
 
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10 relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-border/40">
        <div className="max-w-xl">
          <Badge variant="outline" className="mb-4 text-primary bg-primary/10 border-primary/20 tracking-[0.15em] font-extrabold text-[10px] uppercase shadow-sm">
             Engineering Updates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
            DevOps Blog
          </h1>
          <p className="text-muted-foreground text-[15px] md:text-base leading-relaxed max-w-lg">
            Technical articles, architectural teardowns, and modern ecosystem updates designed to keep you at the bleeding edge.
          </p>
        </div>
        
        {isAdmin && (
           <Link href="/admin/blog/new" target="_blank" className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
               <Button className="font-extrabold gap-2 h-11 px-6 bg-amber-500 hover:bg-amber-600 text-black rounded-xl shadow-[0_5px_15px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 transition-all w-full md:w-auto">
                   <PlusCircle className="h-4 w-4" /> Create Blog Post
               </Button>
           </Link>
        )}
      </div>
 
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-muted-foreground font-semibold">Loading articles...</div>}>
         <BlogClient initialData={posts} />
      </Suspense>
    </div>
  );
}
