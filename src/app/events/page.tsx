import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startTime: "asc" },
  });

  const upcomingEvents = events.filter(e => new Date(e.startTime) >= new Date());
  const pastEvents = events.filter(e => new Date(e.startTime) < new Date());

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">Community Events</h1>
        <p className="text-lg text-muted-foreground">
          Join live sessions, workshops, and hackathons hosted by expert engineers.
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold flex items-center border-b pb-4">
          <Calendar className="mr-2 h-6 w-6 text-primary" /> Upcoming Events
        </h2>
        
        {upcomingEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
           <div className="p-8 text-center border rounded-xl bg-muted/20 border-dashed">
             <p className="text-muted-foreground">No upcoming events scheduled right now.</p>
           </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div className="space-y-8 pt-8">
          <h2 className="text-2xl font-bold flex items-center border-b pb-4 text-muted-foreground">
            <Clock className="mr-2 h-6 w-6" /> Past Events
          </h2>
          <div className="grid md:grid-cols-2 gap-6 opacity-75 grayscale hover:grayscale-0 focus-within:grayscale-0 transition-all duration-500">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, isPast = false }: { event: any; isPast?: boolean }) {
  const date = new Date(event.startTime);
  const images = event.imageUrls ? event.imageUrls.split(",").filter(Boolean) : [];
  
  return (
    <Card className={`group flex flex-col hover:border-primary/50 transition-colors overflow-hidden ${isPast ? 'bg-muted/10' : 'bg-card'}`}>
      {images.length > 0 && (
        <div className={`grid gap-0.5 w-full bg-muted border-b ${images.length === 1 ? 'grid-cols-1 h-48' : images.length === 2 ? 'grid-cols-2 h-40' : 'grid-cols-3 h-32'}`}>
          {images.slice(0, 3).map((url: string, idx: number) => (
             <img key={idx} src={url} alt="Event Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          ))}
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {event.type}
          </span>
          <div className="flex flex-col items-end text-right">
             <span className="text-sm font-semibold text-primary">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
             <span className="text-xs text-muted-foreground">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <CardDescription className="line-clamp-3 mb-6 flex-grow">{event.description}</CardDescription>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            Online
          </div>
          {event.externalLink ? (
             <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                <Button variant={isPast ? "outline" : "default"} size="sm" className="h-8 group-hover:bg-primary group-hover:text-primary-foreground">
                  {isPast ? "View Recording" : "Register / View"} <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
             </a>
          ) : (
             <Button variant="outline" size="sm" className="h-8" disabled>
               Link coming soon
             </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
