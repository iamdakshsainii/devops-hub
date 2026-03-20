"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, ExternalLink, MapPin, Users } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    type: string;
    startTime: Date;
    externalLink: string | null;
    interestedCount: number;
    tags?: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  const [interested, setInterested] = useState(false);
  const [count, setCount] = useState(event.interestedCount);
  const [loading, setLoading] = useState(false);

  const handleInterested = async () => {
    if (interested) return; // Prevent multiple clicks
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/interested`, { method: "POST" });
      if (res.ok) {
        setInterested(true);
        setCount(c => c + 1);
      }
    } catch(e) {} finally {
      setLoading(false);
    }
  };

  const isPast = new Date(event.startTime) < new Date();

  // Simple countdown logic for the card (static string for now, could be an interval on client)
  const calculateTimeLeft = () => {
    const difference = new Date(event.startTime).getTime() - new Date().getTime();
    if (difference <= 0) return "Started/Past";
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <Card className={`flex flex-col ${isPast ? "opacity-75 bg-muted/20" : "hover:border-primary/50"} transition-colors relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${
        event.type === "Webinar" ? "bg-blue-500" :
        event.type === "Conference" ? "bg-purple-500" :
        event.type === "Meetup" ? "bg-green-500" :
        event.type === "Certification Deadline" ? "bg-red-500" : "bg-primary"
      }`} />
      <CardHeader className="pl-6 pb-2">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {event.type}
          </span>
          {!isPast && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {calculateTimeLeft()}
            </span>
          )}
        </div>
        <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-6 pt-2 grow">
        <div className="flex items-center gap-2 text-sm font-medium mb-4 text-foreground/80">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {new Date(event.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
        
        {event.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.tags.split(",").filter(Boolean).map((t: string) => (
              <span key={t} className="text-[10px] items-center px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                #{t.trim()}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pl-6 pt-0 mt-4 flex justify-between items-center border-t border-dashed bg-muted/10 py-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Users className="h-4 w-4" />
          {count} Interested
        </div>
        <div className="flex items-center gap-2">
           {!isPast && (
              <Button size="sm" variant={interested ? "secondary" : "default"} onClick={handleInterested} disabled={interested || loading} className="h-8">
                {interested ? "Marked Interested" : "I'm Interested"}
              </Button>
           )}
           {event.externalLink && (
             <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
               <Button size="sm" variant="outline" className="h-8">Link <ExternalLink className="ml-1.5 h-3 w-3" /></Button>
             </a>
           )}
        </div>
      </CardFooter>
    </Card>
  );
}
