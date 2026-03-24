"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, ExternalLink, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminEventsList({ events, currentUserId }: { events: any[], currentUserId?: string }) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("UPCOMING");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [localEvents, setLocalEvents] = useState(events);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) setLocalEvents(localEvents.filter(e => e.id !== id));
    } catch { alert("Failed to delete event"); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, note?: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note })
      });
      if (res.ok) {
        setLocalEvents(localEvents.map(e => e.id === id ? { ...e, status: newStatus } : e));
      }
    } catch { alert("Failed to update status"); }
    setLoadingId(null);
  };

  const filteredEvents = localEvents.filter((event) => {
    const isUpcoming = new Date(event.startTime) >= new Date();
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                         (event.description && event.description.toLowerCase().includes(search.toLowerCase()));
    const matchesTime = timeFilter === "ALL" || (timeFilter === "UPCOMING" ? isUpcoming : !isUpcoming);
    const matchesType = typeFilter === "ALL" || event.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" ? event.status !== "DELETED" : event.status === statusFilter;
    
    return matchesSearch && matchesTime && matchesType && matchesStatus;
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
        <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Pending Approval</option>
          </select>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="ALL">All Types</option>
            <option value="WEBINAR">Webinar</option>
            <option value="MEETUP">Meetup</option>
            <option value="WORKSHOP">Workshop</option>
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
              <Card key={event.id} className={`${isPast ? "opacity-75 grayscale-[0.2]" : ""} flex flex-col hover:border-primary/50 transition-colors overflow-hidden`}>
                {event.imageUrls && (
                  <div className="w-full aspect-video overflow-hidden relative border-b bg-muted/20">
                     <img 
                       src={event.imageUrls.split(',')[0]} 
                       alt={event.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                  </div>
                )}
                <CardHeader className="p-5 pb-3 bg-muted/20 border-b">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex gap-1.5 items-center">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {event.type}
                       </span>
                       {event.status === "PENDING" && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                             PENDING
                          </span>
                       )}
                     </div>
                     {isPast && <span className="text-[10px] font-bold text-muted-foreground">PAST</span>}
                  </div>
                  <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1 font-mono text-xs" suppressHydrationWarning>
                    <Calendar className="h-3.5 w-3.5" /> 
                    {new Date(event.startTime).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                  {event.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.tags.split(",").filter(Boolean).map((t: string) => (
                        <span key={t} className="text-[10px] items-center px-1.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm mt-auto border-t pt-4">
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <Users className="h-4 w-4" /> {event.interestedCount || 0} Interested
                    </span>
                    <div className="flex gap-1.5 align-middle items-center">
                      {event.status === "PENDING" && (
                         <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateStatus(event.id, "PUBLISHED")} 
                            disabled={loadingId === event.id}
                            className="h-8 px-3 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-bold"
                         >
                            Approve
                         </Button>
                      )}

                      {event.externalLink && (
                        <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-8 px-2"><ExternalLink className="h-3.5 w-3.5" /></Button>
                        </a>
                      )}
                      
                      {event.authorId === currentUserId ? (
                         <Link href={`/events/dashboard/edit/${event.id}`}>
                            <Button variant="secondary" size="sm" className="h-8 px-3">Edit Details</Button>
                         </Link>
                      ) : (
                       <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 px-3">{event.status === "PENDING" ? "Review" : "Review / Actions"}</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Review Event: {event.title}</DialogTitle>
                            <DialogDescription>
                              Approve or suggest changes to the submitter.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Add Note / Suggestion for User</label>
                              <Textarea 
                                id={`review-note-${event.id}`}
                                placeholder="E.g., Please add a primary cover picture or fix description grammar..." 
                                className="h-24 resize-none"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                variant="destructive" 
                                className="h-9" 
                                onClick={async () => {
                                   const note = (document.getElementById(`review-note-${event.id}`) as HTMLTextAreaElement)?.value;
                                   await handleUpdateStatus(event.id, "REJECTED", note);
                                }}
                              >
                                Suggest Changes
                              </Button>
                              {event.status === "PENDING" && (
                                <Button 
                                  variant="default" 
                                  className="h-9 bg-emerald-600 hover:bg-emerald-700" 
                                  onClick={() => handleUpdateStatus(event.id, "PUBLISHED")}
                                >
                                  Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      )}

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
