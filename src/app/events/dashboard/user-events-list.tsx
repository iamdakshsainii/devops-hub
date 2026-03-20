"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Trash2, Edit3, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function UserEventsList({ events }: { events: any[] }) {
  const [localEvents, setLocalEvents] = useState(events);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const displayEvents = localEvents.filter(e => e.status !== "DELETED");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event submission?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocalEvents(localEvents.filter(e => e.id !== id));
      }
    } catch { alert("Failed to delete"); }
  };

  const handleUpdate = async (id: string, updatedFields: any) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        setLocalEvents(localEvents.map(e => e.id === id ? { ...e, ...updatedFields, status: "PENDING" } : e));
        alert("Event updated and resubmitted for approval!");
      }
    } catch { alert("Failed to update"); }
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      {displayEvents.length === 0 ? (
         <p className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/5">You haven't submitted any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayEvents.map(event => (
            <Card key={event.id} className="group overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
              {event.imageUrls && (
                <div className="h-36 overflow-hidden relative border-b">
                   <img src={event.imageUrls.split(",")[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Banner" />
                </div>
              )}
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    event.status === 'PUBLISHED' ? 'text-emerald-500 bg-emerald-500/10' : 
                    event.status === 'REJECTED' ? 'text-destructive bg-destructive/10' : 
                    'text-amber-500 bg-amber-500/10'
                  }`}>
                    {event.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                     <Heart className="h-3 w-3 text-pink-500" /> {event._count?.bookmarks || 0} Saves
                  </div>
                </div>
                <CardTitle className="text-lg leading-snug line-clamp-1">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1 space-y-4 flex flex-col flex-1">
                <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>

                <div className="flex items-center text-xs text-muted-foreground gap-1.5" suppressHydrationWarning>
                   <Calendar className="h-4 w-4" />
                   {new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                {event.feedback && (
                   <div className="text-xs text-amber-600 bg-amber-500/5 border border-amber-500/20 px-3 py-2 rounded flex items-center justify-between">
                     <span>⚠️ <span className="font-semibold">Revision Ordered:</span> Click Edit to view full history index.</span>
                   </div>
                )}

                {event.status === "DELETED" && (
                   <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded flex items-center gap-1.5">
                     ⚠️ <span className="font-semibold">Admin Actions:</span> This event submission was deleted.
                   </div>
                )}

                <div className="flex justify-end gap-2 mt-auto">
                   <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)} className="h-8 px-2 text-destructive hover:bg-destructive/10 border-destructive/20"><Trash2 className="h-3.5 w-3.5" /></Button>

                   {/* Edit / Resubmit Dialogue Modal */}
                   <Link href={`/events/dashboard/edit/${event.id}`}>
                      <Button variant="secondary" size="sm" className="h-8 gap-1">
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </Button>
                   </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
