"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Editor } from "@/components/editor";
import { Save, Code2, Type } from "lucide-react";

import { TagInput } from "@/components/ui/tag-input";

export default function NewNotePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"VISUAL" | "JSON">("VISUAL");
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("<p>Write your amazing DevOps note here...</p>");
  const [jsonInput, setJsonInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJsonPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonInput(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.coverImage) setCoverImage(parsed.coverImage);
      if (parsed.tags) {
        setTags(Array.isArray(parsed.tags) ? parsed.tags : parsed.tags.split(",").map((t:string) => t.trim()));
      }
      if (parsed.content) setContent(parsed.content);
      setError("");
    } catch (e) {
      setError("Invalid JSON format");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tags.length === 0) {
      setError("Please add at least one tag.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, coverImage, tags: tags.join(", "), content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit note");

      router.push("/notes");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Write a Note</h1>
          <p className="text-muted-foreground mt-1 text-sm">Share your DevOps knowledge with the community</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <Button 
            variant={mode === "VISUAL" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setMode("VISUAL")}
          ><Type className="h-4 w-4 mr-2" /> Visual</Button>
          <Button 
            variant={mode === "JSON" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setMode("JSON")}
          ><Code2 className="h-4 w-4 mr-2" /> JSON Mode</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">
                {error}
              </div>
            )}

            {mode === "JSON" && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Paste JSON object</label>
                <p className="text-xs text-muted-foreground">Requires keys: title, coverImage, tags, content (HTML string)</p>
                <textarea 
                  value={jsonInput}
                  onChange={handleJsonPaste}
                  className="w-full h-48 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={'{\n  "title": "My Note",\n  "content": "<p>Hello</p>",\n  "tags": ["docker", "aws"]\n}'}
                />
              </div>
            )}

            <div className={`space-y-6 ${mode === "JSON" ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Title</label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. A Deep Dive into Kubernetes Pods" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Cover Image URL (Optional)</label>
                <Input 
                  value={coverImage} 
                  onChange={e => setCoverImage(e.target.value)} 
                  placeholder="https://example.com/image.png" 
                />
                {coverImage && (
                  <div className="mt-2 text-xs text-muted-foreground">Preview:
                    <img src={coverImage} alt="Cover preview" className="mt-1 h-32 w-auto border rounded object-cover bg-muted" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Tags</label>
                <TagInput 
                  tags={tags} 
                  setTags={setTags} 
                  placeholder="Type tag and press Enter..." 
                />
                <p className="text-[10px] text-muted-foreground mt-1">Press enter or comma to add a tag.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none mb-2 block">Content</label>
                {/* Visual Editor Component */}
                <Editor content={content} onChange={setContent} />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Publishing..." : "Publish Note"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
