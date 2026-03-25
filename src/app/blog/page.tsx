import { prisma } from "@/lib/prisma";
import { BlogClient } from "./blog-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
 
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
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">DevOps Blog</h1>
        <p className="text-lg text-muted-foreground">
          Articles, guides, and updates covering the DevOps ecosystem.
        </p>
        
        {isAdmin && (
           <div className="flex justify-center pt-2">
               <Link href="/admin/blog/new" target="_blank">
                     <Button className="font-bold gap-1.5 h-9 text-xs bg-amber-500 hover:bg-amber-600 text-black">
                         <PlusCircle className="h-4 w-4" /> Create Blog Post
                     </Button>
               </Link>
           </div>
        )}
      </div>
 
      <Suspense fallback={<div>Loading articles...</div>}>
         <BlogClient initialData={posts} />
      </Suspense>
    </div>
  );
}
