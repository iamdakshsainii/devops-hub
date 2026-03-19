"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, ExternalLink, Search, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AdminEventsList({ events }: { events: any[] }) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("UPCOMING");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [localEvents, setLocalEvents] = useState(events);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" }); // Wait, do we have /api/events/[id]? I will edit it
      if (res.ok) setLocalEvents(localEvents.filter(e => e.id !== id));
    } catch { alert("Failed to delete event"); }
  };

  const filteredEvents = localEvents.filter((event) => {
    const isUpcoming = new Date(event.startTime) >= new Date();
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                         (event.description && event.description.toLowerCase().includes(search.toLowerCase()));
    const matchesTime = timeFilter === "ALL" || (timeFilter === "UPCOMING" ? isUpcoming : !isUpcoming);
    const matchesType = typeFilter === "ALL" || event.type === typeFilter;
    
    return matchesSearch && matchesTime && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="ALL">All Types</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="PAST">Past Events</option>
            <option value="ALL">All Events</option>
          </select>
          <Link href="/admin/events/new" className="flex-1 sm:flex-none">
            <Button size="sm" className="h-9 w-full">+ Create Event</Button>
          </Link>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredEvents.map((event) => {
            const isPast = new Date(event.startTime) < new Date();
            return (
              <Card key={event.id} className={`${isPast ? "opacity-75 grayscale-[0.2]" : ""} flex flex-col hover:border-primary/50 transition-colors`}>
                <CardHeader className="p-5 pb-3 bg-muted/20 border-b">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {event.type}
                     </span>
                     {isPast && <span className="text-[10px] font-bold text-muted-foreground">PAST</span>}
                  </div>
                  <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1 font-mono text-xs">
                    <Calendar className="h-3.5 w-3.5" /> 
                    {new Date(event.startTime).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex justify-between items-center text-sm mt-auto border-t pt-4">
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <Users className="h-4 w-4" /> {event.interestedCount || 0} Interested
                    </span>
                    <div className="flex gap-1.5 align-middle items-center">
                      {event.externalLink && (
                        <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-8 px-2"><ExternalLink className="h-3.5 w-3.5" /></Button>
                        </a>
                      )}
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="secondary" size="sm" className="h-8 px-3">Modify</Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)} className="h-8 px-2 text-destructive hover:bg-destructive/10 border-destructive/20"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Try resetting or modifying your search filters.</p>
        </div>
      )}
    </div>
  );
}
