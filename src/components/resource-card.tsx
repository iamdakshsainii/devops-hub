"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, FileText, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

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

// Extracts YouTube video ID from any YouTube URL format:
// - https://www.youtube.com/watch?v=ID
// - https://youtu.be/ID
// - https://youtu.be/ID?si=...
// - https://www.youtube.com/embed/ID
// - https://www.youtube.com/shorts/ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

// Checks if a resource is YouTube-type regardless of casing (VIDEO, Video, YOUTUBE, etc.)
function isYouTubeType(type: string): boolean {
  const t = type?.toUpperCase();
  return t === "YOUTUBE" || t === "VIDEO";
}

export function ResourceCard({ resource }: ResourceCardProps) {
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
    <Card className="flex flex-col hover:border-primary/50 transition-colors overflow-hidden group h-full">
      {finalImageUrl && (
        <div className="w-full h-48 bg-muted overflow-hidden border-b">
          <img
            src={finalImageUrl}
            alt={resource.title || "Resource cover"}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className={finalImageUrl ? "p-4 pb-2" : "p-5 pb-3"}>
        <div className="flex items-start justify-between mb-2">
          <div className="bg-muted p-2 rounded-lg">{getIcon(resource.type)}</div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {tag}
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {resource.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 h-10 mt-2 text-sm">
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-2 mt-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>By {resource.author?.fullName || "Member"}</span>
          {resource._count ? (
            <span>{resource._count.upvotes} Upvotes</span>
          ) : (
            <span>0 Upvotes</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="secondary" className="w-full h-8 text-xs">
              {getButtonText(resource.type)}
            </Button>
          </a>
          <Link href={`/resources/${resource.id}`} className="w-full">
            <Button variant="outline" className="w-full h-8 text-xs">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}