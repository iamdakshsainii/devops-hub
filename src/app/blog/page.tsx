import { prisma } from "@/lib/prisma";
import { BlogClient } from "./blog-client";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
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
      </div>

      <BlogClient initialData={posts} />
    </div>
  );
}
