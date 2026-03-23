import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Bell } from "lucide-react";

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

  const resourceBookmarks = typeof resourceBookmarkRows !== "undefined" ? resourceBookmarkRows.map((b) => ({ ...b, resource: resourceMap[b.resourceId!] })).filter((b) => b.resource) : [];

  // Split events into saved and remindMe
  const allEventBookmarks = eventBookmarkRows
    .map((b) => ({ ...b, event: eventMap[b.eventId!] }))
    .filter((b) => b.event);

  // "Saved" = all bookmarked events (remindMe can also be saved)
  // "Remind Me" = only those with remindMe: true
  const remindMeBookmarks = allEventBookmarks.filter((b) => b.remindMe === true);
  const pureEventBookmarks = allEventBookmarks; // all saved events shown in Saved tab

  const tabs = [
    { label: "Modules", value: "modules", count: moduleBookmarks.length + (typeof topicBookmarks !== "undefined" ? topicBookmarks.length : 0) + (typeof subtopicBookmarks !== "undefined" ? subtopicBookmarks.length : 0) },
    { label: "Resources", value: "resources", count: resourceBookmarks.length },
    { label: "Events", value: "events", count: pureEventBookmarks.length },
    { label: "Remind Me", value: "reminders", count: remindMeBookmarks.length },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Your saved modules, resources, events, and reminders.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/bookmarks?tab=${t.value}`}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${activeTab === t.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {t.value === "reminders" && <Bell className="h-3.5 w-3.5" />}
            {t.label}
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Modules */}
      {activeTab === "modules" && (
        <div className="space-y-6">
          {(moduleBookmarks.length > 0 || (typeof topicBookmarks !== "undefined" && topicBookmarks.length > 0) || (typeof subtopicBookmarks !== "undefined" && subtopicBookmarks.length > 0)) ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {moduleBookmarks.map(({ step }) =>
                step ? (
                  <Card key={step.id} className="hover:border-primary/50 transition-colors relative overflow-hidden flex flex-col">
                    <div className="h-1" style={{ backgroundColor: step.roadmap?.color || "#3B82F6" }} />
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {step.icon} Module
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-1 mt-auto space-y-4 flex-grow flex flex-col justify-between">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{step.description || "Standalone knowledge node."}</p>
                      <Link href={`/modules?id=${step.id}`} className="mt-auto">
                        <Button variant="secondary" className="w-full h-8">View Module</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : null
              )}
              {typeof topicBookmarks !== "undefined" && topicBookmarks.map(({ topic }) => (
                <Card key={topic.id} className="hover:border-primary/50 transition-colors flex flex-col">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Topic</span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
                    {topic.step && <p className="text-xs text-muted-foreground mt-1">In {topic.step.title}</p>}
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-1 mt-auto space-y-2">
                     <Link href={`/modules/${topic.stepId}`}>
                       <Button variant="secondary" className="w-full h-8 mt-2">View Topic</Button>
                     </Link>
                  </CardContent>
                </Card>
              ))}
              {typeof subtopicBookmarks !== "undefined" && subtopicBookmarks.map(({ subtopic }) => (
                <Card key={subtopic.id} className="hover:border-primary/50 transition-colors flex flex-col">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Subtopic</span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{subtopic.title}</CardTitle>
                    {subtopic.topic?.step && <p className="text-xs text-muted-foreground mt-1">In {subtopic.topic.step.title}</p>}
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-1 mt-auto space-y-2">
                     <Link href={`/modules/${subtopic.topic?.stepId || ""}`}>
                       <Button variant="secondary" className="w-full h-8 mt-2">View Subtopic</Button>
                     </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50 mx-auto" />}
              title="No modules saved"
              description="When you find a helpful learning module, click the bookmark icon to save it here."
              href="/modules"
              linkLabel="Browse Modules"
            />
          )}
        </div>
      )}

      {/* Resources */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          {resourceBookmarks.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {resourceBookmarks.map(({ resource }) =>
                resource ? (
                  <Card key={resource.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {resource.type}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2 line-clamp-2 leading-tight">
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm mt-1">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 mt-auto">
                      <Link href={`/resources/${resource.id}`}>
                        <Button variant="secondary" className="w-full h-8 mt-2">View Resource</Button>
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

      {/* Saved Events */}
      {activeTab === "events" && (
        <div className="space-y-6">
          {pureEventBookmarks.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
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

      {/* Remind Me */}
      {activeTab === "reminders" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You'll receive a notification when you log in on the day of each event below.
          </p>
          {remindMeBookmarks.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
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
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EventBookmarkCard({ event, remindMe }: { event: any; remindMe: boolean }) {
  const isPast = new Date(event.startTime) < new Date();
  return (
    <Card className="hover:border-primary/50 transition-colors flex flex-col overflow-hidden">
      {event.imageUrls && (
        <div className="h-40 overflow-hidden relative border-b bg-muted/20">
          <img
            src={event.imageUrls.split(",")[0]}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            {event.type}
          </span>
          {remindMe && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Bell className="h-3 w-3" /> Reminder set
            </span>
          )}
        </div>
        <CardTitle className="text-lg mt-2 line-clamp-2 leading-tight">{event.title}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(event.startTime).toLocaleDateString(undefined, {
            weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
          {isPast && <span className="ml-2 text-muted-foreground/60">(Past)</span>}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2 mt-auto">
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{event.description}</p>
        <Link href="/events">
          <Button variant="secondary" className="w-full h-8">View Event</Button>
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
    <div className="text-center py-16 border border-dashed rounded-lg bg-muted/10">
      {icon}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">{description}</p>
      <Link href={href}>
        <Button variant="outline">{linkLabel}</Button>
      </Link>
    </div>
  );
}
