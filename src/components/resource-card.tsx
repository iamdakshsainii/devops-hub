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

export function ResourceCard({ resource }: ResourceCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'YOUTUBE': return <Youtube className="h-5 w-5 text-red-500" />;
      case 'PDF': return <FileText className="h-5 w-5 text-red-400" />;
      case 'IMAGE': return <ImageIcon className="h-5 w-5 text-green-500" />;
      default: return <LinkIcon className="h-5 w-5 text-primary" />;
    }
  };

  const getButtonText = (type: string) => {
    switch (type) {
      case 'YOUTUBE': return "Watch Video";
      case 'PDF': return "Download PDF";
      case 'IMAGE': return "View Image";
      default: return "Visit Link";
    }
  };

  const tag = resource.tags ? resource.tags.split(',')[0] : "Resource";

  return (
    <Card className="flex flex-col hover:border-primary/50 transition-colors overflow-hidden group h-full">
      {resource.imageUrl && (
        <div className="w-full h-48 bg-muted overflow-hidden border-b">
          <img src={resource.imageUrl} alt={resource.title || "Resource cover"} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        </div>
      )}
      <CardHeader className={resource.imageUrl ? "p-4 pb-2" : "p-5 pb-3"}>
        <div className="flex items-start justify-between mb-2">
          <div className="bg-muted p-2 rounded-lg">
            {getIcon(resource.type)}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {tag}
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2 h-10 mt-2 text-sm">{resource.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-2 mt-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>By {resource.author?.fullName || "Member"}</span>
          {resource._count ? <span>{resource._count.upvotes} Upvotes</span> : <span>0 Upvotes</span>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="secondary" className="w-full h-8 text-xs">{getButtonText(resource.type)}</Button>
          </a>
          <Link href={`/resources/${resource.id}`} className="w-full">
            <Button variant="outline" className="w-full h-8 text-xs">Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
