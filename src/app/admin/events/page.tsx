import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: "asc" }
  });

  const upcomingEvents = events.filter(e => new Date(e.startTime) >= new Date());
  const pastEvents = events.filter(e => new Date(e.startTime) < new Date());

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
            <p className="text-muted-foreground mt-1">Manage and view community events.</p>
          </div>
          <a href="/admin/events/new">
            <Button>+ Create Event</Button>
          </a>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingEvents.map(event => (
                <Card key={event.id}>
                  <CardHeader className="p-5 pb-3 bg-muted/20 border-b">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {event.type}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" /> 
                      {new Date(event.startTime).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1 font-medium text-foreground/80">
                        <Users className="h-4 w-4" /> {event.interestedCount} Interested
                      </span>
                      {event.externalLink && (
                        <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-8">Link <ExternalLink className="ml-1.5 h-3 w-3" /></Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="border border-dashed rounded-xl p-12 text-center bg-muted/10">
               <p className="text-muted-foreground">No upcoming events.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 pt-8 border-t">
        <h2 className="text-xl font-bold tracking-tight">Past Events</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {pastEvents.map(event => (
             <Card key={event.id} className="opacity-70 grayscale-[0.5]">
               <CardHeader className="p-4 pb-2">
                 <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 rounded h-5 flex items-center">
                     {event.type}
                   </span>
                   <span className="text-xs text-muted-foreground">
                      {new Date(event.startTime).toLocaleDateString()}
                   </span>
                 </div>
                 <CardTitle className="text-base line-clamp-1">{event.title}</CardTitle>
               </CardHeader>
               <CardContent className="p-4 pt-0">
                 <p className="text-xs text-muted-foreground mt-2">{event.interestedCount} Interested</p>
               </CardContent>
             </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
