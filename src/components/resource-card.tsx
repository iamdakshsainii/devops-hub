"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, FileText, Link as LinkIcon, Image as ImageIcon, Heart } from "lucide-react";
import { extractYouTubeId, isYouTubeType } from "@/lib/utils";

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    type: string;
    url: string;
    imageUrl?: string | null;
    tags?: string | null;
    author?: { fullName: string | null } | null;
    _count?: { upvotes: number };
  };
}



export function ResourceCard({ resource }: ResourceCardProps) {
  const [upvotes, setUpvotes] = useState(resource._count?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loadingUpvote, setLoadingUpvote] = useState(false);

  const descParts = resource.description.split("· From:");
  const mainDesc = descParts[0].trim();
  const fromSource = descParts[1] ? descParts[1].trim() : null;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loadingUpvote) return;
    setLoadingUpvote(true);
    
    try {
      const res = await fetch("/api/resources/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: resource.id })
      });
      if (res.ok) {
        const data = await res.json();
        setHasUpvoted(data.upvoted);
        setUpvotes(prev => data.upvoted ? prev + 1 : Math.max(0, prev - 1));
      }
    } catch (err) {}
    setLoadingUpvote(false);
  };

  const getIcon = (type: string) => {
    const t = type?.toUpperCase();
    if (t === "YOUTUBE" || t === "VIDEO") return <Youtube className="h-5 w-5 text-red-500" />;
    if (t === "PDF") return <FileText className="h-5 w-5 text-red-400" />;
    if (t === "IMAGE") return <ImageIcon className="h-5 w-5 text-green-500" />;
    return <LinkIcon className="h-5 w-5 text-primary" />;
  };

  const getButtonText = (type: string) => {
    const t = type?.toUpperCase();
    if (t === "YOUTUBE" || t === "VIDEO") return "Watch Video";
    if (t === "PDF") return "Download PDF";
    if (t === "IMAGE") return "View Image";
    return "Visit Link";
  };

  const tag = resource.tags ? resource.tags.split(",")[0].trim() : "Resource";

  // Auto-fetch YouTube thumbnail if no cover image was manually set
  const youtubeId = isYouTubeType(resource.type)
    ? extractYouTubeId(resource.url)
    : null;

  const finalImageUrl =
    resource.imageUrl ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

  return (
    <Card className="flex flex-col bg-background/30 backdrop-blur-lg border border-border/30 rounded-2xl overflow-hidden group h-full transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 relative">
      {/* Dynamic Background Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {finalImageUrl ? (
        <div className="w-full h-48 bg-muted overflow-hidden border-b border-border/20 relative">
          <img
            src={finalImageUrl}
            alt={resource.title || "Resource cover"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="w-full h-48 overflow-hidden border-b border-border/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center relative">
          <ImageIcon className="h-12 w-12 text-primary/30 stroke-[1.5] transition-transform duration-500 group-hover:scale-110" />
        </div>
      )}
      
      <CardHeader className={finalImageUrl ? "p-4 pb-2 relative z-10" : "p-5 pb-3 relative z-10"}>
        <div className="flex items-start justify-between mb-2">
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
            {getIcon(resource.type)}
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            {tag}
          </span>
        </div>
         <CardTitle className="text-lg line-clamp-2 font-bold leading-tight group-hover:text-primary transition-colors duration-300">
          {resource.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 h-10 mt-1.5 text-xs text-muted-foreground/80 leading-relaxed font-medium">
          {mainDesc}
        </CardDescription>

        {fromSource && (
          <div className="text-[10px] text-primary/80 font-bold mt-2 flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 w-fit">
             <span className="shrink-0">Linked:</span> <span className="underline truncate">{fromSource}</span>
          </div>
        )}

        {resource.tags && (
          <div className="flex flex-wrap gap-1 mt-3">
            {resource.tags.split(",").filter(Boolean).map((t: string) => (
              <span key={t} className="text-[9px] items-center px-2 py-0.5 rounded-full font-bold bg-muted/50 text-muted-foreground border border-border/30 group-hover:border-primary/20 group-hover:text-foreground transition-all">
                #{t.trim()}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-2 mt-auto relative z-10">
         <div className="flex items-center justify-between text-xs text-muted-foreground/80 mb-3 border-t border-border/10 pt-3">
          <span className="font-medium">By {resource.author?.fullName || "Member"}</span>
          <button 
             type="button"
             onClick={handleUpvote} 
             disabled={loadingUpvote}
             className={`flex items-center gap-1 font-bold h-7 px-2.5 rounded-full border transition-all duration-300 ${hasUpvoted ? "text-red-500 border-red-500/20 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.2)]" : "hover:text-red-500 text-muted-foreground bg-muted/40 border-border/10 hover:bg-red-500/5 hover:border-red-500/10"}`}
          >
             <Heart className={`h-3.5 w-3.5 ${hasUpvoted ? "fill-current animate-pulse" : "group-hover/btn:text-red-400"}`} />
             <span className="text-[11px]">{upvotes}</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="w-full h-9 text-xs font-semibold bg-primary/5 border-primary/10 hover:bg-primary/10 hover:border-primary/20 text-primary transition-all rounded-xl">
              {getButtonText(resource.type)}
            </Button>
          </a>
          <Link href={`/resources/${resource.id}`} className="w-full">
            <Button variant="ghost" className="w-full h-9 text-xs font-semibold border border-dashed border-border/50 hover:bg-muted/50 rounded-xl transition-all">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
