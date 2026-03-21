"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Twitter, Linkedin, Facebook, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

function buildRenderer() {
  const renderer = new marked.Renderer();
  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const trimmed = text.replace(/^\n+/, "").replace(/\n+$/, "");
    const isPlain = !lang || !hljs.getLanguage(lang);
    const validLang = isPlain ? "plaintext" : lang!;
    const highlighted = hljs.highlight(trimmed, { language: validLang }).value;

    const encoded = encodeURIComponent(trimmed);
    const label = validLang.toUpperCase();

    return `
<div class="devhub-code-block" data-lang="${validLang}">
  <div class="devhub-code-header">
    <span class="devhub-lang-label">${label}</span>
    <button class="devhub-copy-btn" data-code="${encoded}" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      <span>Copy</span>
    </button>
  </div>
  <pre class="devhub-pre"><code class="hljs language-${validLang}">${highlighted}</code></pre>
</div>`;
  };
  return renderer;
}

marked.use({ gfm: true, breaks: false, renderer: buildRenderer() });

function wireCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>(".devhub-copy-btn").forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "true";

    btn.addEventListener("click", async () => {
      const text = decodeURIComponent(btn.dataset.code ?? "");
      await navigator.clipboard.writeText(text).catch(() => { });

      const span = btn.querySelector("span");
      if (span) {
         span.innerText = "Copied!";
         setTimeout(() => span.innerText = "Copy", 1500);
      }
    });
  });
}

export function BlogContent({ post, initialComments }: { post: any; initialComments: any[] }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likeCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
     wireCopyButtons();
  }, [post.content]);

  const handleLike = async () => {
     if (hasLiked) return;
     setLikes(likes + 1);
     setHasLiked(true);
     try {
         await fetch(`/api/blog/${post.slug}/like`, { method: "POST" });
     } catch (err) { console.error(err); }
  };

  const handleComment = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!commentText.trim() || isSubmitting) return;

     setIsSubmitting(true);
     try {
         const res = await fetch(`/api/blog/${post.slug}/comments`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ content: commentText })
         });
         if (res.ok) {
             const { comment } = await res.json();
             setComments([comment, ...comments]);
             setCommentText("");
         }
     } catch (err) { console.error(err); }
     setIsSubmitting(false);
  };

  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => { setShareUrl(window.location.href); }, []);

  return (
    <div className="space-y-12">
      {/* Content */}
      <div 
         className="devhub-prose prose prose-invert max-w-none text-muted-foreground leading-relaxed text-sm md:text-base"
         dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border/20 gap-4">
         <Button onClick={handleLike} disabled={hasLiked} variant="outline" className="gap-2 font-semibold">
             <Heart className={`h-4 w-4 ${hasLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} /> {likes} Likes
         </Button>

         <div className="flex items-center gap-2">
             <span className="text-xs text-muted-foreground mr-1">Share</span>
             <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70"><Twitter className="h-4 w-4" /></Button>
             </a>
             <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70"><Linkedin className="h-4 w-4" /></Button>
             </a>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                 <Copy className="h-4 w-4" />
             </Button>
         </div>
      </div>

      <div className="h-px bg-border/20" />

      {/* Comments Section */}
      <div className="space-y-6" id="comments">
         <h3 className="text-xl font-bold">{comments.length} Comments</h3>

         {session ? (
             <form onSubmit={handleComment} className="space-y-3">
                 <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Leave a comment..." className="w-full p-3 bg-muted/10 border border-border/20 rounded-xl text-sm h-24 font-medium" />
                 <Button type="submit" disabled={isSubmitting || !commentText.trim()} size="sm" className="gap-1.5 h-8">Post Comment</Button>
             </form>
         ) : (
             <div className="p-4 bg-muted/20 border border-border/10 rounded-xl text-center text-sm text-muted-foreground">
                 <Link href="/login" className="text-primary font-bold hover:underline">Login</Link> to post a comment layout.
             </div>
         )}

         <div className="space-y-4">
             {comments.map((c: any) => (
                 <div key={c.id} className="p-4 bg-gradient-to-br from-background/30 via-card/50 to-background/10 backdrop-blur-xl rounded-xl border border-border/10 flex gap-3 relative shadow-sm">
                     <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">
                          {c.author?.fullName?.[0]?.toUpperCase() || "A"}
                     </div>
                     <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{c.author?.fullName || "Contributor"}</span>
                              <span className="text-[10px] text-muted-foreground/60">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground/90">{c.content}</p>
                     </div>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
}
