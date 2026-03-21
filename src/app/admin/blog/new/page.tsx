import { BlogForm } from "../blog-form";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Blog Post</h1>
          <p className="text-muted-foreground text-sm">
             Build articles to guide and share updates into devops.
          </p>
        </div>
      </div>

      <BlogForm />
    </div>
  );
}
