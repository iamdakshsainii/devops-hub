"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // IMPORTANT: Capture form data BEFORE any async operations.
    // React synthetic events lose e.currentTarget after an await.
    const formData = new FormData(e.currentTarget);

    // Upload files first if any
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
      setError(err.message || "Failed to create event");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input id="title" name="title" required placeholder="Event title" />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea id="description" name="description" required placeholder="Event description" rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">Type</label>
                <select id="type" name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                  <option value="WEBINAR">Webinar</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="MEETUP">Meetup</option>
                  <option value="WORKSHOP">Workshop</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="externalLink" className="text-sm font-medium">External Link (Optional)</label>
                <Input id="externalLink" name="externalLink" type="url" placeholder="https://" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
                <Input id="startTime" name="startTime" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
                <Input id="endTime" name="endTime" type="datetime-local" required />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label htmlFor="images" className="text-sm font-medium">Event Images (Up to 3)</label>
              <Input 
                id="images" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={(e) => setFiles(e.target.files)} 
                className="cursor-pointer" 
              />
              <p className="text-xs text-muted-foreground">Select multiple images to create a gallery.</p>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
