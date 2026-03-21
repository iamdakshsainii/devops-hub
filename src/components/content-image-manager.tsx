"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";

interface ContentImageManagerProps {
  content: string;
  onChange: (newContent: string) => void;
}

export function ContentImageManager({ content, onChange }: ContentImageManagerProps) {
  const [uploading, setUploading] = useState<string | null>(null);

  if (!content) return null;

  // Find all <img> tags from Tiptap HTML string
  const htmlImgMatches = Array.from(content.matchAll(/<img[^>]+src="([^">]+)"/g));
  
  // Find all ![]() markdown images (e.g., from AI paste which hasn't saved to Editor yet)
  const mdImgMatches = Array.from(content.matchAll(/!\[.*?\]\((.*?)\)/g));

  const imageUrls = Array.from(new Set([
    ...htmlImgMatches.map(m => m[1]),
    ...mdImgMatches.map(m => m[1])
  ]));

  const handleSwapImage = async (oldUrl: string, file: File | undefined) => {
    if (!file) return;
    setUploading(oldUrl);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        const newContent = content.replaceAll(oldUrl, data.url);
        onChange(newContent);
      }
    } catch (err) {
      alert("Image swap failed");
    } finally {
      setUploading(null);
    }
  };

  if (imageUrls.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5" /> Images in this section ({imageUrls.length})
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {imageUrls.map((url, i) => (
          <div key={i} className="group aspect-video relative rounded-lg border bg-muted/20 overflow-hidden flex items-center justify-center border-border/50 hover:border-primary/20 transition-all">
            <img 
              src={url} 
              alt={`Content img ${i + 1}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              onError={(e) => {
                // Fallback for broken links
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/400x225/111116/55555d?text=Broken+Link";
              }}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 px-2">
              <label className="text-[10px] bg-white text-black font-extrabold rounded-md px-2 py-1 cursor-pointer hover:bg-white/90 hover:scale-105 transition-all shadow-md flex items-center gap-1">
                {uploading === url ? <Loader2 className="h-3 w-3 animate-spin" /> : "Swap Image"}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleSwapImage(url, e.target.files?.[0])} 
                  disabled={!!uploading}
                />
              </label>
              <div className="text-[9px] text-white/70 truncate w-full text-center px-1 font-mono">
                 {url.split("/").pop()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
