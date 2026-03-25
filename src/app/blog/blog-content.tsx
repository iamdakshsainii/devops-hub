"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Twitter, Linkedin, Facebook, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { parseMarkdown } from "@/lib/markdown";


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

import { StepViewer } from "@/components/step-viewer";

export function BlogContent({ post, initialComments }: { post: any; initialComments: any[] }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likeCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"continuous" | "stepwise">("continuous");

  useEffect(() => {
     const handleTrigger = () => setViewMode("stepwise");
     window.addEventListener("switch-to-stepwise", handleTrigger);
     return () => window.removeEventListener("switch-to-stepwise", handleTrigger);
  }, []);

  const parseBlogToStep = (p: any) => {
     const sections = p.content.split(/\n##\s+/);
     const intro = sections[0];
     const rest = sections.slice(1);

     const topics = rest.map((sec: string, idx: number) => {
         const lines = sec.split("\n");
         const title = lines[0].replace(/^##\s+/, "").trim() || `Section ${idx + 1}`;
         const content = lines.slice(1).join("\n").trim();
         return { id: `topic-${idx}`, title, content: content || "...", order: idx + 1, subtopics: [] };
     });

     if (topics.length === 0) {
         topics.push({ id: "topic-0", title: "Article", content: p.content, order: 1, subtopics: [] });
     }

     return {
         id: p.id,
         title: "Overview",
         description: p.title,
         icon: "📖",
         order: 1,
         topics,
         resources: p.resources || [],
         author: p.author
     };
  };




  useEffect(() => {
     wireCopyButtons();
     // Increment viewCount safely from Client without pre-fetch triggers
     fetch(`/api/blog/${post.slug}/view`, { method: "POST" }).catch(() => {});
  }, [post.content, post.slug]);

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

  const mockStep = parseBlogToStep(post);
  const mockRoadmap = { id: "blog-post", title: "Blog", description: "", icon: "BookOpen", color: "primary" };

  if (viewMode === "stepwise") {
       return (
           <div className="fixed inset-0 z-50 bg-background overflow-hidden">
               <div className="absolute top-3 right-4 z-[60]">
                   <Button variant="secondary" size="sm" className="text-xs font-bold gap-1 bg-background/80 backdrop-blur-md border border-border/20 shadow-md hover:bg-background/95" onClick={() => setViewMode("continuous")}>
                        👓 Continuous View
                   </Button>
               </div>
               <div className="h-full w-full overflow-auto">
                   <StepViewer step={mockStep as any} roadmap={mockRoadmap} isStandalone={true} isBlog={true} />
               </div>
           </div>
       );
  }



  return (
    <div className="space-y-12">
      {post.coverImage && (
          <div className="w-full relative overflow-hidden rounded-2xl border border-border/20 mb-8 bg-card/60 shadow-sm flex items-center justify-center">
              <img src={post.coverImage} className="object-contain w-full h-auto max-h-[480px]" alt={post.title} />
          </div>
      )}

      {/* Content */}
      <div 
         className="devhub-prose prose prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm md:text-base"
         dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
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
                              <span className="text-[10px] text-muted-foreground/60" suppressHydrationWarning>{new Date(c.createdAt).toLocaleDateString()}</span>
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

export function SwitchViewButton() {
  const triggerToggle = () => {
      window.dispatchEvent(new Event("switch-to-stepwise"));
  };

  return (
    <div className="flex justify-center pt-2">
        <Button variant="default" size="sm" onClick={triggerToggle} className="text-xs font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-sm px-4 h-8 transition-transform hover:scale-105 active:scale-95">
             🧭 Switch to Step-wise View
        </Button>
    </div>
  );
}
