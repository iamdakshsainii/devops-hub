import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ExternalLink, MapPin, Radio, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

      <div className="flex gap-2 pb-2 md:pb-0 overflow-x-auto md:overflow-x-visible md:flex-wrap md:justify-center scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {filterTabs.map((f) => (
          <Link key={f.value} href={`/events?filter=${f.value}`} className="shrink-0">
            <Button
              variant={filter === f.value || (!filter && f.value === "all") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5 whitespace-nowrap"
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
      className={`group flex flex-col backdrop-blur-xl border border-border/10 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-500 hover:-translate-y-0.5 ${
        isPast ? "bg-muted/5 opacity-80" : "bg-card/50"
      }`}
    >
      {images.length > 0 && (
        <div
          className={`grid gap-0.5 w-full bg-muted border-b overflow-hidden relative ${images.length === 1
            ? "grid-cols-1 aspect-video lg:aspect-[21/9]"
            : images.length === 2
              ? "grid-cols-2 h-32"
              : "grid-cols-3 h-24"
            }`}
        >
          {images.slice(0, 3).map((url: string, idx: number) => (
            <div key={idx} className="overflow-hidden h-full w-full relative">
               <div className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110" style={{ backgroundImage: `url(${url})` }} />
               <img
                src={url}
                alt="Event"
                className="relative w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}

      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tight py-0 h-4 bg-muted/50">
              {event.type}
            </Badge>
            {isOngoing && (
              <span className="text-[9px] uppercase font-black text-red-500 bg-red-500/10 px-1.5 py-0 h-4 rounded flex items-center gap-1 border border-red-500/20 shadow-xs">
                <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" /> Live
              </span>
            )}
            {!isPast && !isOngoing && diffDays > 0 && diffDays <= 4 && (
              <span className="text-[9px] uppercase font-black text-amber-500 bg-amber-500/10 px-1.5 py-0 h-4 rounded flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 animate-pulse" /> in {diffHours <= 23 ? `${diffHours}h` : `${diffDays}d`}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end text-right leading-none">
            <span className="text-xs font-black text-primary uppercase">
              {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold mt-1">
              {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <CardTitle className="text-lg font-black tracking-tight line-clamp-1 mt-3 group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 flex flex-col flex-grow pt-2">
        <CardDescription className="text-xs font-medium line-clamp-2 mb-3 leading-relaxed">
          {event.description}
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border/40 mt-auto">
          <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 px-2 py-1 rounded-md w-fit">
            <MapPin className="h-2.5 w-2.5 mr-1" />
            {event.type === "MEETUP" ? "In-person" : "Online"}
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            {!isPast && (
              <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                   <Calendar className="h-4 w-4" />
                </Button>
              </a>
            )}
            <EventActions eventId={event.id} isPast={isPast} />
            {event.externalLink && (
              <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                <Button variant={isOngoing ? "default" : "outline"} size="sm" className="h-8 px-4 text-[10px] font-black uppercase rounded-lg shadow-sm">
                  {isPast ? "Watch" : isOngoing ? "Join" : "Enter"}
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </Button>
              </a>
            )}
            {isAdmin && (
              <Link href={`/events/dashboard/edit/${event.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-500 hover:bg-amber-500/10">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}