"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ClientEditForm({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const getValue = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value;

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: getValue("title"),
          description: getValue("description"),
          type: getValue("type"),
          startTime: getValue("startTime"),
          endTime: getValue("endTime") || null,
          externalLink: getValue("externalLink") || null,
          imageUrls: getValue("imageUrls") || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update");
      }

      router.push("/events/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Title</label>
        <Input name="title" defaultValue={event.title} required />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Description</label>
        <Textarea name="description" defaultValue={event.description} required className="h-24 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Type</label>
          <select
            name="type"
            defaultValue={event.type}
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="WEBINAR">Webinar</option>
            <option value="MEETUP">Meetup</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="HACKATHON">Hackathon</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">External Link</label>
          <Input name="externalLink" type="url" defaultValue={event.externalLink || ""} placeholder="https://" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Start Time</label>
          <Input
            name="startTime"
            type="datetime-local"
            defaultValue={new Date(event.startTime).toISOString().slice(0, 16)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">End Time</label>
          <Input
            name="endTime"
            type="datetime-local"
            defaultValue={event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cover Image URL</label>
        <Input name="imageUrls" defaultValue={event.imageUrls || ""} placeholder="Optional — paste image URL" />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save & Resubmit for Approval
        </Button>
      </div>
    </form>
  );
}
