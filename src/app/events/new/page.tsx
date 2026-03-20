"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SubmitEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [tags, setTags] = useState<string>("");
  const [currentTag, setCurrentTag] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    let imageUrlsStr = "";
    try {
      if (files && files.length > 0) {
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const uploadData = new FormData();
          uploadData.append("file", files[i]);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          if (!uploadRes.ok) throw new Error("Image upload failed");
          const { url } = await uploadRes.json();
          uploadedUrls.push(url);
        }
        imageUrlsStr = uploadedUrls.join(",");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload images");
      setLoading(false);
      return;
    }

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"), // WEBINAR, HACKATHON, MEETUP
      startTime: new Date(formData.get("startTime") as string).toISOString(),
      endTime: new Date(formData.get("endTime") as string).toISOString(),
      externalLink: formData.get("externalLink") || undefined,
      imageUrls: imageUrlsStr || undefined,
      tags: tags,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      router.push("/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit event");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="border border-muted/60 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Host / Submit an Event</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Fill the details to submit your event for approval.</p>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-semibold">Event Title</label>
              <Input id="title" name="title" required placeholder="Short Descriptive Title" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-semibold">Description</label>
              <Textarea id="description" name="description" required placeholder="What is this event about, schedule, and speakers?" rows={5} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="type" className="text-sm font-semibold">Type</label>
                <select id="type" name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                  <option value="WEBINAR">Webinar (Online)</option>
                  <option value="MEETUP">Meetup (Offline)</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="WORKSHOP">Workshop</option>
                </select>
              </div >
              <div className="space-y-1.5">
                <label htmlFor="externalLink" className="text-sm font-semibold">Registration URL (Optional)</label>
                <Input id="externalLink" name="externalLink" type="url" placeholder="https://" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="startTime" className="text-sm font-semibold">Start Date & Time</label>
                <Input id="startTime" name="startTime" type="datetime-local" required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="endTime" className="text-sm font-semibold">End Date & Time</label>
                <Input id="endTime" name="endTime" type="datetime-local" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Tags</label>
              <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
                {tags && tags.split(",").filter(Boolean).map((t, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] py-1 px-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    #{t.trim()}
                    <button type="button" onClick={(e) => {
                      e.preventDefault();
                      const arr = tags.split(",").filter(Boolean);
                      arr.splice(i, 1);
                      setTags(arr.join(","));
                    }} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                <input
                  value={currentTag}
                  onChange={e => setCurrentTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (currentTag.trim()) {
                        const arr = tags ? tags.split(",").filter(Boolean) : [];
                        if (!arr.includes(currentTag.trim())) arr.push(currentTag.trim());
                        setTags(arr.join(","));
                        setCurrentTag("");
                      }
                    }
                  }}
                  placeholder="Add tag + Enter..."
                  className="flex-1 bg-transparent border-none text-sm outline-none px-1 h-6"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label htmlFor="images" className="text-sm font-semibold">Posters / Cover Image (Up to 3)</label>
              <Input 
                id="images" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={(e) => setFiles(e.target.files)} 
                className="cursor-pointer" 
              />
              <p className="text-xs text-muted-foreground">Multiple images creates a beautiful gallery overview!</p>
            </div>

            <Button type="submit" className="w-full mt-6 bg-primary" disabled={loading}>
              {loading ? "Submitting for approval..." : "Submit Event Node"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
