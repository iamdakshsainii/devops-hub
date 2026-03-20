"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Save, PlusCircle } from "lucide-react";

import { TagInput } from "@/components/ui/tag-input";

export default function NewResourcePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("LINK");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");

  const fetchNotes = async () => {
     try {
        const r = await fetch("/api/notes");
        const data = await r.json();
        // Adjust based on typical payload structure
        setNotes(data.notes || data || []);
     } catch {}
  };

  const handleTypeChange = (newType: string) => {
     setType(newType);
     if (newType === "NOTES") {  fetchNotes(); }
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
      let imageUrl = undefined;
      
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const json = await uploadRes.json();
        imageUrl = json.url;
      }

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Join tags back into comma separated string for backward compatibility with schema
        body: JSON.stringify({ title, description, type, url, tags: tags.join(", "), imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit resource");

      router.push("/resources");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Share a Resource</h1>
        <p className="text-muted-foreground mt-1 text-sm">Help the community discover great tools and knowledge.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Resource Type</label>
              <select 
                value={type} 
                onChange={e => handleTypeChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="LINK">External Link</option>
                <option value="NOTES">Attached Note</option>
                <option value="YOUTUBE">YouTube Video / Channel</option>

                <option value="IMAGE">Image / Infographic (URL)</option>
              </select>
            </div>

            {type === "NOTES" && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Select Note</label>
                <select 
                  value={selectedNoteId}
                  onChange={e => {
                     const id = e.target.value;
                     setSelectedNoteId(id);
                     const note = Array.isArray(notes) ? notes.find(n => n.id === id) : null;
                     if (note) {
                        setTitle(note.title);
                        setDescription(note.content ? note.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + "..." : "");
                        setUrl(`/notes/${note.id}`);
                     }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Choose Note --</option>
                  {Array.isArray(notes) && notes.map(n => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Title</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Complete Docker Networking Guide" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">URL Link</label>
              <Input 
                type="url"
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://..." 
                required 
              />
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
              <label className="text-sm font-medium leading-none">Short Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                placeholder="What is this resource and why is it useful?"
                required
              />
            </div>

            <div className="space-y-2 pt-2 border-t mt-4">
              <label className="text-sm font-medium leading-none">Cover Image (Optional)</label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer file:cursor-pointer" 
              />
              <p className="text-xs text-muted-foreground">Upload an image to make this resource stand out on the dashboard.</p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading} size="lg">
                <PlusCircle className="h-4 w-4 mr-2" />
                {loading ? "Submitting..." : "Submit Resource"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
