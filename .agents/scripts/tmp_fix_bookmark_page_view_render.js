const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/bookmarks/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('{moduleBookmarks.length > 0 ? ('));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes(') : (')); // start of empty state

if (startIdx !== -1 && endIdx !== -1) {
    const mapInjection = [
      '          {(moduleBookmarks.length > 0 || (typeof topicBookmarks !== "undefined" && topicBookmarks.length > 0) || (typeof subtopicBookmarks !== "undefined" && subtopicBookmarks.length > 0)) ? (',
      '            <div className="grid sm:grid-cols-2 gap-4">',
      '              {moduleBookmarks.map(({ step }) =>',
      '                step ? (',
      '                  <Card key={step.id} className="hover:border-primary/50 transition-colors relative overflow-hidden flex flex-col">',
      '                    <div className="h-1" style={{ backgroundColor: step.roadmap?.color || "#3B82F6" }} />',
      '                    <CardHeader className="p-5 pb-2">',
      '                      <div className="flex justify-between items-start mb-2">',
      '                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">',
      '                          {step.icon} Module',
      '                        </span>',
      '                      </div>',
      '                      <CardTitle className="text-lg leading-tight">{step.title}</CardTitle>',
      '                    </CardHeader>',
      '                    <CardContent className="px-5 pb-5 pt-1 mt-auto space-y-4 flex-grow flex flex-col justify-between">',
      '                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{step.description || "Standalone knowledge node."}</p>',
      '                      <Link href={`/modules?id=${step.id}`} className="mt-auto">',
      '                        <Button variant="secondary" className="w-full h-8">View Module</Button>',
      '                      </Link>',
      '                    </CardContent>',
      '                  </Card>',
      '                ) : null',
      '              )}',
      '              {typeof topicBookmarks !== "undefined" && topicBookmarks.map(({ topic }) => (',
      '                <Card key={topic.id} className="hover:border-primary/50 transition-colors flex flex-col">',
      '                  <CardHeader className="p-5 pb-2">',
      '                    <div className="flex justify-between items-start mb-2">',
      '                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Topic</span>',
      '                    </div>',
      '                    <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>',
      '                    {topic.step && <p className="text-xs text-muted-foreground mt-1">In {topic.step.title}</p>}',
      '                  </CardHeader>',
      '                  <CardContent className="px-5 pb-5 pt-1 mt-auto space-y-2">',
      '                     <Link href={`/modules/${topic.stepId}`}>',
      '                       <Button variant="secondary" className="w-full h-8 mt-2">View Topic</Button>',
      '                     </Link>',
      '                  </CardContent>',
      '                </Card>',
      '              ))}',
      '              {typeof subtopicBookmarks !== "undefined" && subtopicBookmarks.map(({ subtopic }) => (',
      '                <Card key={subtopic.id} className="hover:border-primary/50 transition-colors flex flex-col">',
      '                  <CardHeader className="p-5 pb-2">',
      '                    <div className="flex justify-between items-start mb-2">',
      '                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Subtopic</span>',
      '                    </div>',
      '                    <CardTitle className="text-lg leading-tight">{subtopic.title}</CardTitle>',
      '                    {subtopic.topic?.step && <p className="text-xs text-muted-foreground mt-1">In {subtopic.topic.step.title}</p>}',
      '                  </CardHeader>',
      '                  <CardContent className="px-5 pb-5 pt-1 mt-auto space-y-2">',
      '                     <Link href={`/modules/${subtopic.topic?.stepId || ""}`}>',
      '                       <Button variant="secondary" className="w-full h-8 mt-2">View Subtopic</Button>',
      '                     </Link>',
      '                  </CardContent>',
      '                </Card>',
      '              ))}'
    ];

    lines.splice(startIdx, (endIdx) - startIdx, ...mapInjection);
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('Clean render loops Spliced efficiently!');
} else {
    console.log('startIdx or endIdx for loop render search not found!');
}
