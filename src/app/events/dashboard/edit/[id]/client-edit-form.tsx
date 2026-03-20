"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ClientEditForm({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const type = (form.elements.namedItem("type") as HTMLSelectElement).value;
    const startTime = (form.elements.namedItem("startTime") as HTMLInputElement).value;
    const imageUrls = (form.elements.namedItem("imageUrls") as HTMLInputElement).value;

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, startTime, imageUrls: imageUrls || null })
      });
      if (res.ok) {
        alert("Event updated and resubmitted successfully!");
        router.push("/events/dashboard");
      }
    } catch { alert("Failed to update"); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <div className="space-y-1.5 border-b pb-4">
        <label className="text-xs font-bold text-muted-foreground">Title</label>
        <Input name="title" defaultValue={event.title} required />
      </div>

      <div className="space-y-1.5 border-b pb-4">
        <label className="text-xs font-bold text-muted-foreground">Description</label>
        <Textarea name="description" defaultValue={event.description} required className="h-24 resize-none" />
      </div>

      <div className="space-y-1.5 border-b pb-4 grid grid-cols-2 gap-4">
        <div>
           <label className="text-xs font-bold text-muted-foreground">Type</label>
           <select name="type" defaultValue={event.type} required className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
             <option value="WEBINAR">Webinar</option>
             <option value="MEETUP">Meetup</option>
             <option value="WORKSHOP">Workshop</option>
           </select>
        </div>
        <div>
           <label className="text-xs font-bold text-muted-foreground">Start Time</label>
           <Input name="startTime" type="datetime-local" defaultValue={new Date(event.startTime).toISOString().slice(0, 16)} required />
        </div>
      </div>

      <div className="space-y-1.5 border-b pb-4">
        <label className="text-xs font-bold text-muted-foreground">Cover Image URL</label>
        <Input name="imageUrls" defaultValue={event.imageUrls} placeholder="Optional image link" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
         <Button type="submit" disabled={loading} className="w-full sm:w-auto h-9">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Save & Resubmit
         </Button>
      </div>
    </form>
  )
}
