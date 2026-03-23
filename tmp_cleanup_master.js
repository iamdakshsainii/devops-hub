const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. imports
content = content.replace(
  'import { ArrowRight, BookOpen, ChevronLeft, Map } from "lucide-react";',
  'import { ArrowRight, BookOpen, ChevronLeft, Library, Map } from "lucide-react";'
);

// 2. Math - totalTopics
const totalTopicsOld = `  const totalTopics = roadmap.steps.reduce((acc, step) => {
    const moduleTopics = (step as any).attachedModules?.reduce(
      (sum: number, am: any) => sum + (am.module.topics?.length || 0), 0
    ) || 0;
    return acc + step._count.topics + moduleTopics;
  }, 0);`;

const totalTopicsNew = `  const totalTopics = roadmap.steps.reduce((acc, step) => {
    const hasModules = (step as any).attachedModules?.length > 0;
    if (hasModules) {
      const moduleTopics = (step as any).attachedModules.reduce(
        (sum: number, am: any) => sum + (am.module.topics?.length || 0), 0
      );
      return acc + moduleTopics;
    }
    return acc + step._count.topics;
  }, 0);`;

content = content.replace(totalTopicsOld, totalTopicsNew);

// 3. Math - globalCompleted
const globalCompletedOld = `  const globalCompleted = roadmap.steps.reduce((acc, step) => {
    const directDone = step.topics.filter((t: any) => completedItemIds.has(t.id)).length;
    const moduleDone = (step as any).attachedModules?.reduce((sum: number, am: any) => {
      return sum + (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
    }, 0) || 0;
    return acc + directDone + moduleDone;
  }, 0);`;

const globalCompletedNew = `  const globalCompleted = roadmap.steps.reduce((acc, step) => {
    const hasModules = (step as any).attachedModules?.length > 0;
    if (hasModules) {
      const moduleDone = (step as any).attachedModules.reduce((sum: number, am: any) => {
        return sum + (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
      }, 0);
      return acc + moduleDone;
    }
    const directDone = step.topics.filter((t: any) => completedItemIds.has(t.id)).length;
    return acc + directDone;
  }, 0);`;

content = content.replace(globalCompletedOld, globalCompletedNew);

// 4. Remove Absolute Line
content = content.replace(
  `          {/* Vertical connecting line */}
          <div
            className="absolute top-8 bottom-8 left-8 w-1 rounded-full hidden sm:block bg-gradient-to-b"
            style={{ backgroundImage: \`linear-gradient(to bottom, \${roadmap.color}, \${roadmap.color}20)\` }}
          />`,
  `          {/* Lines segmented inside rows below */} `
);

// 5. Loop starts replace math
const loopInnerOld = `          {roadmap.steps.map((step, i) => {
            let trackingTotal = step.topics.length;
            let trackingCompleted = step.topics.filter((t: any) => completedItemIds.has(t.id)).length;

            (step as any).attachedModules?.forEach((am: any) => {
              trackingTotal += am.module.topics?.length || 0;
              trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
            });`;

const loopInnerNew = `          {roadmap.steps.map((step, i) => {
            const hasModules = (step as any).attachedModules?.length > 0;
            let trackingTotal = 0;
            let trackingCompleted = 0;

            if (hasModules) {
              (step as any).attachedModules.forEach((am: any) => {
                trackingTotal += am.module.topics?.length || 0;
                trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
              });
            } else {
              trackingTotal = 0;
              trackingCompleted = 0;
            }`;

content = content.replace(loopInnerOld, loopInnerNew);

// 6. Connecting segment segment & row relative
content = content.replace(
  '<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8">',
  `<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 relative">
                  {i < roadmap.steps.length - 1 && (
                     <div 
                        className={\`absolute top-16 bottom-[-24px] left-8 w-1 hidden sm:block -z-10 transition-all duration-500\`}
                        style={{ backgroundColor: isCompleted ? '#10b981' : \`\${roadmap.color}35\` }}
                     />
                  )}`
);

// 7. Station Nodes opacities or bg-card overrides setups offsets responsibly
content = content.replace(
  'className={`hidden sm:flex w-16 h-16 rounded-2xl bg-card border shadow-sm items-center justify-center relative z-20 group-hover:scale-110 transition-transform duration-300 ${isCompleted ? "shadow-[0_0_20px_rgba(16,185,129,0.7)] border-emerald-500 scale-105" : ""}`}',
  'className={`hidden sm:flex w-16 h-16 rounded-2xl border shadow-sm items-center justify-center relative z-20 group-hover:scale-110 transition-transform duration-300 ${isCompleted ? "shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-card border-emerald-500 scale-105" : "bg-card"}`}'
);

content = content.replace(
  'className="sm:hidden w-10 h-10 rounded-xl bg-card border flex items-center justify-center font-bold text-sm shrink-0"',
  'className={`sm:hidden w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${isCompleted ? "bg-emerald-500/10 border-emerald-500" : "bg-card"}`}'
);

// 8. REMOVE Topics Pills node streams accurately for requested offsets securely
const topicsPillOld = `                  {(step as any).topics && (step as any).topics.length > 0 && (
                     <div className="flex flex-wrap gap-1.5 mt-4">
                        {(step as any).topics.map((t: any) => (
                           <div 
                              key={t.id} 
                              className="text-[11px] bg-muted/50 text-foreground/80 px-2 py-0.5 rounded border border-border/30 font-medium"
                           >
                              {t.title}
                           </div>
                        ))}
                        {step._count.topics > 3 && (
                           <div className="text-[11px] text-muted-foreground/60 px-1 py-0.5">
                              +{step._count.topics - 3} more...
                           </div>
                        )}
                     </div>
                  )}`;

content = content.replace(topicsPillOld, "                  ");

// 9. Stat Badges Replace
const badgesOld = `<div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <BookOpen className="h-4 w-4" style={{ color: roadmap.color }} />
                      <span>{step._count.topics} Topics</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <span className="text-base leading-none" style={{ color: roadmap.color }}>📎</span>
                      <span>{step._count.resources} Resources</span>
                    </div>`;

const badgesNew = `<div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <Library className="h-4 w-4" style={{ color: roadmap.color }} />
                      <span>{(step as any).attachedModules?.length || 0} Modules</span>
                    </div>`;

content = content.replace(badgesOld, badgesNew);

fs.writeFileSync(file, content);
console.log("Master timeline cleanups script executed safely!");
