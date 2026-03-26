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
          className="group relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full bg-background/80 backdrop-blur-md border border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:-translate-y-1 transition-all duration-300 pointer-events-auto overflow-hidden"
          title="Pinned Content"
        >
           {/* Pulsing Core */}
           <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="relative flex items-center gap-2">
             <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/40">
                <Pin className="h-3 w-3 md:h-3.5 md:w-3.5 text-white rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                </span>
             </div>
             
             <div className="flex flex-col items-start leading-none pr-1">
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-foreground/90 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">Perspectives</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Industry Bits</span>
             </div>
           </div>
           
           {/* Orbiting Ambient Glow */}
           <div className="absolute -inset-x-20 inset-y-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] md:w-full rounded-3xl p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-x-hidden">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 p-5 md:p-6 pb-2 md:pb-4 border-b border-border/10">
          <DialogHeader className="space-y-1">
             <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1">
               <Sparkles className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Industry Perspectives</span>
             </div>
             <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight leading-none">
                Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Growth Blueprint.</span>
             </DialogTitle>
             <p className="text-muted-foreground text-xs md:text-sm max-w-sm pt-1 leading-relaxed">
               Deep-dives into company culture, role expectations, and the reality of production engineering.
             </p>
          </DialogHeader>
        </div>

        <div className="px-5 md:px-6 py-5 md:py-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-4">
          <div className="flex flex-wrap items-center gap-3 mb-2">
             <Badge variant="outline" className="rounded-full px-3 py-1 bg-amber-500/5 border-amber-500/20 text-amber-600 flex items-center gap-1.5 shrink-0 text-[10px]">
               <Briefcase className="h-3 w-3" /> Career Blueprint
             </Badge>
             <Badge variant="outline" className="rounded-full px-3 py-1 bg-blue-500/5 border-blue-500/20 text-blue-600 flex items-center gap-1.5 shrink-0 text-[10px]">
               <Users className="h-3 w-3" /> Culture
             </Badge>
             <Badge variant="outline" className="rounded-full px-3 py-1 bg-purple-500/5 border-purple-500/20 text-purple-600 flex items-center gap-1.5 shrink-0 text-[10px]">
               <ArrowRight className="h-3 w-3" /> Dynamics
             </Badge>
          </div>

          <div className="grid gap-4">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} onClick={() => setOpen(false)} className="group">
                <Card className="border-border/40 bg-card/40 hover:bg-muted/10 transition-all duration-300 hover:border-amber-500/40 relative overflow-hidden group-hover:shadow-md">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
                   <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center min-w-0">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-bold uppercase tracking-wider ${
                           blog.category === 'Career' ? 'text-amber-600' : 'text-blue-600'
                         }`}>{blog.category}</span>
                         <span className="h-1 w-1 rounded-full bg-border" />
                         <span className="text-[10px] text-muted-foreground">{blog.readTime} min read</span>
                      </div>
                      <h3 className="font-bold text-sm md:text-base leading-snug group-hover:text-amber-600 transition-colors break-words line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 md:line-clamp-1 leading-relaxed">
                        {blog.excerpt || "Production-ready depth shared natively..."}
                      </p>
                    </div>
 
                    <div className="shrink-0 flex justify-end md:block">
                      <div className="bg-muted/20 p-2 rounded-xl group-hover:bg-amber-500/10 group-hover:text-amber-600 transition-all">
                         <ExternalLink className="h-4 w-4" />
                      </div>
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
