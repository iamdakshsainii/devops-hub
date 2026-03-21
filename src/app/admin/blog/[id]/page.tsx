import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BlogForm } from "../blog-form";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const post = await prisma.blogPost.findUnique({
    where: { id }
  });

  if (!post) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Blog Post</h1>
          <p className="text-muted-foreground text-sm">
             Update information describing your articles setups natively.
          </p>
        </div>
      </div>

      <BlogForm initialData={post} />
    </div>
  );
}
