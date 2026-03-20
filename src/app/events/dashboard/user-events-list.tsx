"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Trash2, Edit3, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function UserEventsList({ events }: { events: any[] }) {
  const [localEvents, setLocalEvents] = useState(
    events.filter((e) => e.status !== "DELETED")
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event submission?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) setLocalEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  if (localEvents.length === 0) {
    return (
      <p className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/5">
        You haven't submitted any events yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {localEvents.map((event) => {
        // Parse latest admin feedback note to show inline
        let latestNote: string | null = null;
        if (event.feedback) {
          try {
            const history = JSON.parse(event.feedback);
            if (Array.isArray(history) && history.length > 0) {
              latestNote = history[history.length - 1]?.note ?? null;
            }
          } catch {
            latestNote = event.feedback;
          }
        }

        const hasRevision = event.status === "REJECTED" || (event.status === "PENDING" && latestNote);

        return (
          <Card
            key={event.id}
            className={`group overflow-hidden flex flex-col hover:border-primary/40 transition-colors ${hasRevision ? "border-amber-500/40" : ""
              }`}
          >
            {event.imageUrls && (
              <div className="h-36 overflow-hidden border-b">
                <img
                  src={event.imageUrls.split(",")[0]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Banner"
                />
              </div>
            )}

            <CardHeader className="p-5 pb-3">
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${event.status === "PUBLISHED"
                      ? "text-emerald-500 bg-emerald-500/10"
                      : event.status === "REJECTED"
                        ? "text-destructive bg-destructive/10"
                        : "text-amber-500 bg-amber-500/10"
                    }`}
                >
                  {event.status}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                  <Heart className="h-3 w-3 text-pink-500" />
                  {event._count?.bookmarks || 0} Saves
                </div>
              </div>
              <CardTitle className="text-lg leading-snug line-clamp-1">
                {event.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-5 pb-5 pt-1 space-y-3 flex flex-col flex-1">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {event.description}
              </p>

              <div
                className="flex items-center text-xs text-muted-foreground gap-1.5"
                suppressHydrationWarning
              >
                <Calendar className="h-3.5 w-3.5" />
                {new Date(event.startTime).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Show latest admin note inline in red — no "click to view" indirection */}
              {latestNote && (
                <div className="flex gap-2 text-xs text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2.5 rounded-lg">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-semibold">Admin note: </span>
                    {latestNote}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-auto pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                  className="h-8 px-2 text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Link href={`/events/dashboard/edit/${event.id}`}>
                  <Button variant="secondary" size="sm" className="h-8 gap-1">
                    <Edit3 className="h-3.5 w-3.5" />
                    {hasRevision ? "Fix & Resubmit" : "Edit"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
