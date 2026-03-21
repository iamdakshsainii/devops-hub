const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/bookmarks/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const sepIdx = lines.findIndex(l => l.includes('// Separate by type'));
if (sepIdx !== -1) {
    const fetchStart = lines.findIndex((l, idx) => idx > sepIdx && l.includes('const [steps, resources, events] = await Promise.all(['));
    if (fetchStart !== -1) {
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

             lines.splice(sepIdx, (fetchEnd + 1) - sepIdx);
             lines.splice(sepIdx, 0, ...setupVars, '', ...newFetch);

             let combined = lines.join('\n');
             combined = combined.replace('{ label: "Modules", value: "modules", count: moduleBookmarks.length }', '{ label: "Modules", value: "modules", count: moduleBookmarks.length + (typeof topicBookmarks !== "undefined" ? topicBookmarks.length : 0) + (typeof subtopicBookmarks !== "undefined" ? subtopicBookmarks.length : 0) }');
             
             fs.writeFileSync(file, combined, 'utf8');
             console.log('Query and Count setup successfully!');
        }
    }
}
