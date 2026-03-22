const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/bookmarks/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = `  // Separate by type
  const moduleBookmarkRows = rawBookmarks.filter((b) => b.itemType === "MODULE" && b.stepId);`;

const replacement = `  // Separate by type
  const moduleBookmarkRows = rawBookmarks.filter((b) => b.itemType === "MODULE" && b.stepId);
  const topicBookmarkRows = rawBookmarks.filter((b) => b.itemType === "TOPIC" && b.topicId);
  const subtopicBookmarkRows = rawBookmarks.filter((b) => b.itemType === "SUBTOPIC" && b.subtopicId);

  // Fetch related data
  const stepIds = moduleBookmarkRows.map((b) => b.stepId!);
  const resourceIds = resourceBookmarkRows.map((b) => b.resourceId!);
  const eventIds = eventBookmarkRows.map((b) => b.eventId!);
  const topicIds = topicBookmarkRows.map((b) => b.topicId!);
  const subtopicIds = subtopicBookmarkRows.map((b) => b.subtopicId!);`;

// I'll take lines array and do absolute reliable Line splice to inject whole section at once
const lines = content.split('\n');
const sepIdx = lines.findIndex(l => l.includes('// Separate by type'));
if (sepIdx !== -1) {
    const fetchStart = lines.findIndex((l, idx) => idx > sepIdx && l.includes('const [steps, resources, events] = await Promise.all(['));
    if (fetchStart !== -1) {
        // We will do a full rewrite of fetch block
        const fetchEnd = lines.findIndex((l, idx) => idx > fetchStart && l.includes(']);'));
        if (fetchEnd !== -1) {
             const newFetch = [
               '  const [steps, resources, events, topics, subtopics] = await Promise.all([',
               '    stepIds.length > 0 ? prisma.roadmapStep.findMany({ where: { id: { in: stepIds } }, include: { roadmap: { select: { title: true, color: true } } } }) : Promise.resolve([]),',
               '    resourceIds.length > 0 ? prisma.resource.findMany({ where: { id: { in: resourceIds } }, include: { author: { select: { fullName: true } } } }) : Promise.resolve([]),',
               '    eventIds.length > 0 ? prisma.event.findMany({ where: { id: { in: eventIds } } }) : Promise.resolve([]),',
               '    topicIds.length > 0 ? prisma.roadmapTopic.findMany({ where: { id: { in: topicIds } }, include: { step: true } }) : Promise.resolve([]),',
               '    subtopicIds.length > 0 ? prisma.roadmapSubTopic.findMany({ where: { id: { in: subtopicIds } }, include: { topic: { include: { step: true } } } }) : Promise.resolve([]),',
               '  ]);',
               '',
               '  const stepMap = Object.fromEntries(steps.map((s) => [s.id, s]));',
               '  const resourceMap = Object.fromEntries(resources.map((r) => [r.id, r]));',
               '  const eventMap = Object.fromEntries(events.map((e) => [e.id, e]));',
               '  const topicMap = Object.fromEntries(topics.map((t) => [t.id, t]));',
               '  const subtopicMap = Object.fromEntries(subtopics.map((s) => [s.id, s]));',
               '',
               '  const moduleBookmarks = moduleBookmarkRows.map((b) => ({ ...b, step: stepMap[b.stepId!] })).filter((b) => b.step);',
               '  const topicBookmarks = topicBookmarkRows.map((b) => ({ ...b, topic: topicMap[b.topicId!] })).filter((b) => b.topic);',
               '  const subtopicBookmarks = subtopicBookmarkRows.map((b) => ({ ...b, subtopic: subtopicMap[b.subtopicId!] })).filter((b) => b.subtopic);'
             ];

             const setupVars = [
               '  // Separate by type',
               '  const moduleBookmarkRows = rawBookmarks.filter((b) => b.itemType === "MODULE" && b.stepId);',
               '  const topicBookmarkRows = rawBookmarks.filter((b) => b.itemType === "TOPIC" && b.topicId);',
               '  const subtopicBookmarkRows = rawBookmarks.filter((b) => b.itemType === "SUBTOPIC" && b.subtopicId);',
               '  const resourceBookmarkRows = rawBookmarks.filter((b) => b.itemType === "RESOURCE" && b.resourceId);',
               '  const eventBookmarkRows = rawBookmarks.filter((b) => b.itemType === "EVENT" && b.eventId);',
               '',
               '  // Fetch related data',
               '  const stepIds = moduleBookmarkRows.map((b) => b.stepId!);',
               '  const resourceIds = resourceBookmarkRows.map((b) => b.resourceId!);',
               '  const eventIds = eventBookmarkRows.map((b) => b.eventId!);',
               '  const topicIds = topicBookmarkRows.map((b) => b.topicId!);',
               '  const subtopicIds = subtopicBookmarkRows.map((b) => b.subtopicId!);'
             ];

             // Splice out the old setup variables (usually ending right before Promise.all)
             lines.splice(sepIdx, (fetchEnd + 1) - sepIdx);
             lines.splice(sepIdx, 0, ...setupVars, '', ...newFetch);

             // Update total counters
             // Let's use clean substring replace for layout render tab mapping
             let combined = lines.join('\n');
             combined = combined.replace('{ label: "Modules", value: "modules", count: moduleBookmarks.length }', '{ label: "Modules", value: "modules", count: moduleBookmarks.length + topicBookmarks.length + subtopicBookmarks.length }');
             
             // Render loop
             const emptyStateSearch = `{moduleBookmarks.length > 0 ? (`;
             const emptyStateReplace = `{(moduleBookmarks.length > 0 || topicBookmarks.length > 0 || subtopicBookmarks.length > 0) ? (`;
             combined = combined.replace(emptyStateSearch, emptyStateReplace);

             const mapLoop = `              {moduleBookmarks.map(({ step }) =>`;
             const mapInjection = `              {moduleBookmarks.map(({ step }) =>
                step ? (
                  <Card key={step.id} className="hover:border-primary/50 transition-colors relative overflow-hidden flex flex-col">
                    <div className="h-1" style={{ backgroundColor: step.roadmap?.color || "#3B82F6" }} />
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {step.icon} Module
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-1 mt-auto space-y-4 flex-grow flex flex-col justify-between">
                      <p className="text-xs text-muted-foreground line-clamp-2">Standalone knowledge node.</p>
                      <Link href={\`/modules?id=\${step.id}\`} className="mt-auto">
                        <Button variant="secondary" className="w-full h-8">View Module</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : null
              )}
              {topicBookmarks.map(({ topic }) => (
                  <Card key={topic.id} className="hover:border-primary/50 transition-colors flex flex-col">
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                           Topic
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">In {topic.step?.title || "Module"}</p>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-2 mt-auto">
                      <Link href={\`/modules/\${topic.stepId}\`}>
                        <Button variant="secondary" className="w-full h-8">View Topic</Button>
                      </Link>
                    </CardContent>
                  </Card>
              ))}
              {subtopicBookmarks.map(({ subtopic }) => (
                  <Card key={subtopic.id} className="hover:border-primary/50 transition-colors flex flex-col">
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                           Subtopic
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{subtopic.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">In {subtopic.topic?.title || "Topic"}</p>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-2 mt-auto">
                      <Link href={\`/modules/\${subtopic.topic?.stepId}\`}>
                        <Button variant="secondary" className="w-full h-8">View Subtopic</Button>
                      </Link>
                    </CardContent>
                  </Card>
              ))}`;

             // Replace old loop
             const fullTarget = `              {moduleBookmarks.map(({ step }) =>
                step ? (
                  <Card
                    key={step.id}
                    className="hover:border-primary/50 transition-colors relative overflow-hidden flex flex-col"
                  >
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
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                        {step.description || "Standalone knowledge node."}
                      </p>
                      <Link href={\`/modules?id=\${step.id}\`} className="mt-auto">
                        <Button variant="secondary" className="w-full h-8">View Module</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : null
              )}`;
             
             if (combined.includes(fullTarget)) {
                combined = combined.replace(fullTarget, mapInjection);
                fs.writeFileSync(file, combined, 'utf8');
                console.log('Bookmarked list updated with sub-categories effectively!');
             } else {
                console.log('Main render loop not found for replacement!');
             }
        }
    }
} else {
    console.log('Could not find slice starting anchors!');
}
