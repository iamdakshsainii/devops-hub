"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Pin, X, ExternalLink, Sparkles, Coffee, Briefcase, 
  ArrowRight, Heart, MessageSquare, Clock, FileText, Users
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PinnedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  readTime: number;
  createdAt: string;
  author?: {
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export function PinnedBlogs({ blogs }: { blogs: any[] }) {
  const [open, setOpen] = useState(false);

  if (blogs.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="group relative flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          title="Essential Reads"
        >
           <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
           </span>
           <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-600 dark:text-amber-500">Essential Insight</span>
           <ArrowRight className="h-2.5 w-2.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-[95vw] rounded-3xl p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 p-6 pb-4">
          <DialogHeader className="space-y-1">
             <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1">
               <Sparkles className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Industry Perspectives</span>
             </div>
             <DialogTitle className="text-3xl font-black tracking-tight leading-none">
                Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Growth Blueprint.</span>
             </DialogTitle>
             <p className="text-muted-foreground text-sm max-w-sm pt-1">
               Deep-dives into company culture, role expectations, and the reality of production engineering.
             </p>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-4">
          <div className="flex items-center gap-4 mb-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
             <Badge variant="outline" className="rounded-full px-3 py-1 bg-amber-500/5 border-amber-500/20 text-amber-600 flex items-center gap-1.5 shrink-0">
               <Briefcase className="h-3 w-3" /> Career Blueprint
             </Badge>
             <Badge variant="outline" className="rounded-full px-3 py-1 bg-blue-500/5 border-blue-500/20 text-blue-600 flex items-center gap-1.5 shrink-0">
               <Users className="h-3 w-3" /> Company Culture
             </Badge>
             <Badge variant="outline" className="rounded-full px-3 py-1 bg-purple-500/5 border-purple-500/20 text-purple-600 flex items-center gap-1.5 shrink-0">
               <ArrowRight className="h-3 w-3" /> Work Dynamics
             </Badge>
          </div>

          <div className="grid gap-4">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} onClick={() => setOpen(false)} className="group">
                <Card className="border-border/40 bg-card/40 hover:bg-muted/10 transition-all duration-300 hover:border-amber-500/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-bold uppercase tracking-wider ${
                           blog.category === 'Career' ? 'text-amber-600' : 'text-blue-600'
                         }`}>{blog.category}</span>
                         <span className="h-1 w-1 rounded-full bg-border" />
                         <span className="text-[10px] text-muted-foreground">{blog.readTime} min read</span>
                      </div>
                      <h3 className="font-bold text-sm leading-snug group-hover:text-amber-600 transition-colors truncate">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 line-clamp-1 leading-normal">
                        {blog.excerpt || "Production-ready depth shared natively..."}
                      </p>
                    </div>

                    <div className="bg-muted/20 p-2 rounded-xl group-hover:bg-amber-500/10 group-hover:text-amber-600 transition-all">
                       <ExternalLink className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Link href="/blog?category=Career" className="block w-full pt-2" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/30">
              EXPLORE ALL PERSPECTIVES <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
