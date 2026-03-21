import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BlogList } from "./blog-list";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const posts = await prisma.blogPost.findMany({
    where: {
      status: { not: "DELETED" },
    },
    include: {
      author: {
        select: {
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Blog Posts</h1>
          <p className="text-muted-foreground text-sm">
            Create, edit, and publish blogs for the community.
          </p>
        </div>
      </div>

      <BlogList initialData={posts} />
    </div>
  );
}
