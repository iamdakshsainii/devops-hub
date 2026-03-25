import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Bell, User as UserIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || "modules";

  // Fetch all bookmarks
  const rawBookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Separate by type
  const moduleBookmarkRows = rawBookmarks.filter((b) => b.itemType === "MODULE" && b.stepId);
  const topicBookmarkRows = rawBookmarks.filter((b) => b.itemType === "TOPIC" && b.topicId);
  const subtopicBookmarkRows = rawBookmarks.filter((b) => b.itemType === "SUBTOPIC" && b.subtopicId);
  const resourceBookmarkRows = rawBookmarks.filter((b) => b.itemType === "RESOURCE" && b.resourceId);
  const eventBookmarkRows = rawBookmarks.filter((b) => b.itemType === "EVENT" && b.eventId);

  // Fetch related data
  const stepIds = moduleBookmarkRows.map((b) => b.stepId!);
  const resourceIds = resourceBookmarkRows.map((b) => b.resourceId!);
  const eventIds = eventBookmarkRows.map((b) => b.eventId!);
  const topicIds = topicBookmarkRows.map((b) => b.topicId!);
  const subtopicIds = subtopicBookmarkRows.map((b) => b.subtopicId!);

  const [steps, resources, events, topics, subtopics] = await Promise.all([
    stepIds.length > 0 ? prisma.roadmapStep.findMany({ where: { id: { in: stepIds } }, include: { roadmap: { select: { title: true, color: true } } } }) : Promise.resolve([]),
    resourceIds.length > 0 ? prisma.resource.findMany({ where: { id: { in: resourceIds } }, include: { author: { select: { fullName: true } } } }) : Promise.resolve([]),
    eventIds.length > 0 ? prisma.event.findMany({ where: { id: { in: eventIds } } }) : Promise.resolve([]),
    topicIds.length > 0 ? prisma.roadmapTopic.findMany({ where: { id: { in: topicIds } }, include: { step: true } }) : Promise.resolve([]),
    subtopicIds.length > 0 ? prisma.roadmapSubTopic.findMany({ where: { id: { in: subtopicIds } }, include: { topic: { include: { step: true } } } }) : Promise.resolve([]),
  ]);

  const stepMap = Object.fromEntries(steps.map((s) => [s.id, s]));
  const resourceMap = Object.fromEntries(resources.map((r) => [r.id, r]));
  const eventMap = Object.fromEntries(events.map((e) => [e.id, e]));
  const topicMap = Object.fromEntries(topics.map((t) => [t.id, t]));
  const subtopicMap = Object.fromEntries(subtopics.map((s) => [s.id, s]));

  const moduleBookmarks = moduleBookmarkRows.map((b) => ({ ...b, step: stepMap[b.stepId!] })).filter((b) => b.step);
  const topicBookmarks = topicBookmarkRows.map((b) => ({ ...b, topic: topicMap[b.topicId!] })).filter((b) => b.topic);
  const subtopicBookmarks = subtopicBookmarkRows.map((b) => ({ ...b, subtopic: subtopicMap[b.subtopicId!] })).filter((b) => b.subtopic);
  const resourceBookmarks = resourceBookmarkRows.map((b) => ({ ...b, resource: resourceMap[b.resourceId!] })).filter((b) => b.resource);

  const allEventBookmarks = eventBookmarkRows
    .map((b) => ({ ...b, event: eventMap[b.eventId!] }))
    .filter((b) => b.event);

  const remindMeBookmarks = allEventBookmarks.filter((b) => b.remindMe === true);
  const pureEventBookmarks = allEventBookmarks;

  const tabs = [
    { label: "Modules", value: "modules", count: moduleBookmarks.length + topicBookmarks.length + subtopicBookmarks.length },
    { label: "Resources", value: "resources", count: resourceBookmarks.length },
    { label: "Events", value: "events", count: pureEventBookmarks.length },
    { label: "Remind Me", value: "reminders", count: remindMeBookmarks.length },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Bookmarks</h1>
        <p className="text-muted-foreground text-[15px] font-medium">
          Your saved modules, resources, events, and reminders.
        </p>
      </div>

      <div className="flex border-b overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/bookmarks?tab=${t.value}`}
            className={`pb-4 px-5 font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 text-sm ${activeTab === t.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {t.value === "reminders" && <Bell className="h-4 w-4" />}
            {t.label}
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-black">
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "modules" && (
          <div className="space-y-6">
            {(moduleBookmarks.length > 0 || topicBookmarks.length > 0 || subtopicBookmarks.length > 0) ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {moduleBookmarks.map(({ step }) =>
                   step ? (
                    <Card key={step.id} className="group flex flex-col backdrop-blur-3xl border border-border/10 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 bg-card/40 relative">
                       <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-700 blur-2xl pointer-events-none" style={{ backgroundColor: step.roadmap?.color || "#3B82F6" }} />
                      <div className="h-1.5" style={{ backgroundColor: step.roadmap?.color || "#3B82F6" }} />
                      <CardHeader className="p-6 pb-2">
                        <div className="flex justify-between items-start mb-3">
                           <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                              {step.icon} Module
                           </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight leading-snug">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-1 mt-auto space-y-4 flex-grow flex flex-col justify-between">
                        <p className="text-[13px] text-muted-foreground font-medium opacity-80 leading-relaxed line-clamp-2 mb-4">{step.description || "Standalone knowledge node."}</p>
                        <Link href={`/modules?id=${step.id}`} className="mt-auto">
                          <Button variant="secondary" className="w-full h-10 rounded-xl font-bold">View Module</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : null
                )}
                {topicBookmarks.map(({ topic }) => (
                  <Card key={topic.id} className="group flex flex-col backdrop-blur-3xl border border-border/10 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-2 bg-card/40 relative">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex justify-between items-start mb-3">
                         <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Topic
                         </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight leading-snug">{topic.title}</CardTitle>
                      {topic.step && <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-1">In {topic.step.title}</p>}
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-1 mt-auto space-y-2">
                       <Link href={`/modules/${topic.stepId}`}>
                         <Button variant="secondary" className="w-full h-10 rounded-xl font-bold mt-2">View Topic</Button>
                       </Link>
                    </CardContent>
                  </Card>
                ))}
                {subtopicBookmarks.map(({ subtopic }) => (
                  <Card key={subtopic.id} className="group flex flex-col backdrop-blur-3xl border border-border/10 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-2 bg-card/40 relative">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex justify-between items-start mb-3">
                         <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            Subtopic
                         </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight leading-snug">{subtopic.title}</CardTitle>
                      {subtopic.topic?.step && <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-1">In {subtopic.topic.step.title}</p>}
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-1 mt-auto space-y-2">
                       <Link href={`/modules/${subtopic.topic?.stepId || ""}`}>
                         <Button variant="secondary" className="w-full h-10 rounded-xl font-bold mt-2">View Subtopic</Button>
                       </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto transition-transform group-hover:scale-110" />}
                title="No modules saved"
                description="When you find a helpful learning module, click the bookmark icon to save it here."
                href="/modules"
                linkLabel="Browse Modules"
              />
            )}
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-6">
            {resourceBookmarks.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {resourceBookmarks.map(({ resource }) =>
                  resource ? (
                    <Card key={resource.id} className="group flex flex-col backdrop-blur-3xl border border-border/10 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 bg-card/40 relative ring-1 ring-white/5 dark:ring-white/5">
                       <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-1000 blur-3xl pointer-events-none bg-primary" />
                      
                      <CardHeader className="p-6 pb-4">
                        <div className="flex justify-between items-start mb-3">
                           <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                              {resource.type}
                           </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">
                          {resource.title}
                        </CardTitle>
                        <p className="line-clamp-2 text-[13px] mt-2 font-medium opacity-80 leading-relaxed">
                          {resource.description}
                        </p>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-2 mt-auto">
                        <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                           <UserIcon className="h-3.5 w-3.5" /> {resource.author?.fullName || "Admin"}
                        </div>
                        <Link href={`/resources/${resource.id}`}>
                          <Button variant="secondary" className="w-full h-10 rounded-xl font-bold shadow-sm transition-all hover:bg-primary hover:text-white">
                              View Deep Dive
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : null
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto" />}
                title="No resources saved"
                description="When you find a useful PDF, link, or video, click the bookmark icon to save it here."
                href="/resources"
                linkLabel="Browse Resources"
              />
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-6">
            {pureEventBookmarks.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {pureEventBookmarks.map(({ event, remindMe }) =>
                  event ? (
                    <EventBookmarkCard key={event.id} event={event} remindMe={remindMe} />
                  ) : null
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto" />}
                title="No events saved"
                description='Click "Save" on any event to keep it here for quick access.'
                href="/events"
                linkLabel="Browse Events"
              />
            )}
          </div>
        )}

        {activeTab === "reminders" && (
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-sm font-bold">
                <Bell className="h-5 w-5" />
                You'll receive a notification when you log in on the day of each event below.
             </div>
            {remindMeBookmarks.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {remindMeBookmarks.map(({ event }) =>
                  event ? (
                    <EventBookmarkCard key={event.id} event={event} remindMe={true} />
                  ) : null
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto" />}
                title="No reminders set"
                description="Click 'Remind Me' on any upcoming event and you'll be notified on event day."
                href="/events"
                linkLabel="Browse Events"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EventBookmarkCard({ event, remindMe }: { event: any; remindMe: boolean }) {
  const isPast = new Date(event.startTime) < new Date();
  return (
    <Card className="group hover:border-primary/40 transition-all duration-500 flex flex-col overflow-hidden rounded-[2rem] bg-card/40 border-border/10 shadow-lg">
      {event.imageUrls && (
        <div className="h-44 overflow-hidden relative border-b bg-muted/20">
          <img
            src={event.imageUrls.split(",")[0]}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      )}
      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start">
           <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
              {event.type}
           </Badge>
          {remindMe && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <Bell className="h-3 w-3" /> Reminder active
            </span>
          )}
        </div>
        <CardTitle className="text-xl mt-3 line-clamp-2 leading-tight font-black">{event.title}</CardTitle>
        <p className="text-[13px] text-muted-foreground mt-2 font-bold font-mono">
          {new Date(event.startTime).toLocaleDateString(undefined, {
            weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
          {isPast && <span className="ml-2 opacity-50">(Past)</span>}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-2 mt-auto">
        <p className="text-[13px] text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed">{event.description}</p>
        <Link href={`/events`}>
          <Button variant="secondary" className="w-full h-10 rounded-xl font-bold">View Event Space</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon, title, description, href, linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-[2.5rem] bg-muted/5 border-border/20 group">
      <div className="bg-muted/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
         {icon}
      </div>
      <h3 className="text-2xl font-black mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium leading-relaxed">{description}</p>
      <Link href={href}>
        <Button variant="outline" className="h-12 px-8 rounded-full font-bold shadow-sm">{linkLabel}</Button>
      </Link>
    </div>
  );
}
