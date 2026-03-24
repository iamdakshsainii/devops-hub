import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ExternalLink, MapPin, Radio, Edit } from "lucide-react";
import Link from "next/link";
import { EventActions } from "@/components/event-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getEventStatus(event: any): "ongoing" | "upcoming" | "past" {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;
  if (start > now) return "upcoming";
  if (end && end > now) return "ongoing";
  if (!end && now.getTime() - start.getTime() < 4 * 60 * 60 * 1000) return "ongoing";
  return "past";
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startTime: "asc" },
  });

  const ongoing = events.filter((e) => getEventStatus(e) === "ongoing");
  const upcoming = events.filter((e) => getEventStatus(e) === "upcoming");
  const past = events.filter((e) => getEventStatus(e) === "past");

  const filterTabs = [
    { label: "All", value: "all", count: events.length },
    { label: "Live Now", value: "ongoing", count: ongoing.length },
    { label: "Upcoming", value: "upcoming", count: upcoming.length },
    { label: "Past", value: "past", count: past.length },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">Community Events</h1>
        <p className="text-lg text-muted-foreground">
          Join live sessions, workshops, and hackathons hosted by expert engineers.
        </p>
        <Link href="/events/new">
          <Button className="mt-2 font-semibold gap-2">
            <Calendar className="h-4 w-4" /> Host / Submit an Event
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {filterTabs.map((f) => (
          <Link key={f.value} href={`/events?filter=${f.value}`}>
            <Button
              variant={filter === f.value || (!filter && f.value === "all") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              {f.value === "ongoing" && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
              {f.label}
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{f.count}</span>
            </Button>
          </Link>
        ))}
      </div>

      {(filter === "all" || filter === "ongoing") && ongoing.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-3">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" /> Happening Now
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {ongoing.map((e) => <EventCard key={e.id} event={e} badge="ongoing" isAdmin={isAdmin} />)}
          </div>
        </section>
      )}

      {(filter === "all" || filter === "upcoming") && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-3">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming Events
          </h2>
          {upcoming.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {upcoming.map((e) => <EventCard key={e.id} event={e} badge="upcoming" isAdmin={isAdmin} />)}
            </div>
          ) : (
            <div className="p-8 text-center border rounded-xl bg-muted/20 border-dashed">
              <p className="text-muted-foreground">No upcoming events scheduled right now.</p>
            </div>
          )}
        </section>
      )}

      {(filter === "all" || filter === "past") && past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-3 text-muted-foreground">
            <Clock className="h-5 w-5" /> Past Events
          </h2>
          <div className="grid md:grid-cols-2 gap-6 opacity-80">
            {past.map((e) => <EventCard key={e.id} event={e} badge="past" isAdmin={isAdmin} />)}
          </div>
        </section>
      )}

      {filter !== "all" &&
        ((filter === "ongoing" && ongoing.length === 0) ||
          (filter === "upcoming" && upcoming.length === 0) ||
          (filter === "past" && past.length === 0)) && (
          <div className="p-12 text-center border rounded-xl bg-muted/20 border-dashed">
            <p className="text-muted-foreground">No {filter} events found.</p>
          </div>
        )}
    </div>
  );
}

function EventCard({ event, badge, isAdmin }: { event: any; badge: "ongoing" | "upcoming" | "past"; isAdmin: boolean }) {
  const isPast = badge === "past";
  const isOngoing = badge === "ongoing";
  const date = new Date(event.startTime);
  const now = new Date();
  const images = event.imageUrls ? event.imageUrls.split(",").filter(Boolean) : [];

  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));

  // Calendar URL Generator
  const startTimeISO = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endTimeObj = event.endTime ? new Date(event.endTime) : new Date(date.getTime() + 60 * 60 * 1000);
  const endTimeISO = endTimeObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTimeISO}/${endTimeISO}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.type === "MEETUP" ? "In-person" : "Online")}`;

  return (
    <Card
      className={`group flex flex-col backdrop-blur-xl border border-border/10 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 ${
        isPast ? "bg-muted/5 dark:bg-muted/5 opacity-80" : "bg-card/60"
      }`}
    >
      {images.length > 0 && (
        <div
          className={`grid gap-0.5 w-full bg-muted border-b ${images.length === 1
            ? "grid-cols-1 h-48"
            : images.length === 2
              ? "grid-cols-2 h-40"
              : "grid-cols-3 h-32"
            }`}
        >
          {images.slice(0, 3).map((url: string, idx: number) => (
            <div key={idx} className="overflow-hidden h-full w-full">
              <img
                src={url}
                alt="Event"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {event.type}
            </span>
            {isOngoing && (
              <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> Live
              </span>
            )}
            {!isPast && !isOngoing && diffDays > 0 && diffDays <= 4 && (
              <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Clock className="h-3 w-3 animate-pulse" /> in {diffHours <= 23 ? `${diffHours}h` : `${diffDays}d`}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-primary">
              {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isAdmin && (
               <Link href={`/events/dashboard/edit/${event.id}`}>
                 <Button variant="ghost" size="icon" className="h-7 w-7 mt-1 text-muted-foreground hover:text-primary" title="Edit Event">
                    <Edit className="h-3.5 w-3.5" />
                 </Button>
               </Link>
            )}
          </div>
        </div>
        <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow">
        <CardDescription className="line-clamp-3 mb-4 flex-grow">
          {event.description}
        </CardDescription>
        
        {event.tags && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.split(",").filter(Boolean).map((t: string) => (
              <span key={t} className="text-[10px] items-center px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                #{t.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto pt-4 border-t">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {event.type === "MEETUP" ? "In-person" : "Online"}
          </div>
          <div className="flex items-center flex-wrap gap-2 sm:justify-end">
            {!isPast && (
              <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="h-8 w-8 text-foreground/80 hover:text-foreground" title="Add to Google Calendar">
                  <Calendar className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
            {/* Save + Remind Me — client component */}
            <EventActions eventId={event.id} isPast={isPast} />

            {event.externalLink ? (
              <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                <Button variant={isPast ? "outline" : "default"} size="sm" className="h-8">
                  {isPast ? "View Recording" : isOngoing ? "Join Now" : "Register / View"}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            ) : (
              <Button variant="outline" size="sm" className="h-8" disabled>
                Link coming soon
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}