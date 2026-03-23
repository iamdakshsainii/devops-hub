const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix totalTopics calculation using precise regex
const totalTopicsRegex = /const totalTopics = roadmap\.steps\.reduce\(\(acc, step\) => \{[\s\S]*?const moduleTopics[\s\S]*?return acc \+ step\._count\.topics \+ moduleTopics;[\s\S]*?\}, 0\);/;
const totalTopicsReplacement = `const totalTopics = roadmap.steps.reduce((acc, step) => {
    const hasModules = (step as any).attachedModules?.length > 0;
    if (hasModules) {
      const moduleTopics = (step as any).attachedModules.reduce(
        (sum: number, am: any) => sum + (am.module.topics?.length || 0), 0
      );
      return acc + moduleTopics;
    }
    return acc + step._count.topics;
  }, 0);`;

if (totalTopicsRegex.test(content)) {
    content = content.replace(totalTopicsRegex, totalTopicsReplacement);
}

// 2. Fix globalCompleted using regex
const globalCompletedRegex = /const globalCompleted = roadmap\.steps\.reduce\(\(acc, step\) => \{[\s\S]*?const directDone[\s\S]*?return acc \+ directDone \+ moduleDone;[\s\S]*?\}, 0\);/;
const globalCompletedReplacement = `const globalCompleted = roadmap.steps.reduce((acc, step) => {
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

if (globalCompletedRegex.test(content)) {
    content = content.replace(globalCompletedRegex, globalCompletedReplacement);
}

fs.writeFileSync(file, content);
console.log("Cleanup card state final maths triggers applied successfully via Regex!");
