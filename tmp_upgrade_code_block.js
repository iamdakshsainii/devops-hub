const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `            let trackingTotal = 0;
            let trackingCompleted = 0;
            for (const t of step.topics) {
              trackingTotal += 1;
              if (completedItemIds.has(t.id)) trackingCompleted += 1;
            }`;

const replacement = `            let trackingTotal = step.topics.length;
            let trackingCompleted = step.topics.filter((t: any) => completedItemIds.has(t.id)).length;

            (step as any).attachedModules?.forEach((am: any) => {
              trackingTotal += am.module.topics?.length || 0;
              trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
            });`;

if (content.indexOf(target) !== -1) {
    fs.writeFileSync(file, content.replace(target, replacement));
    console.log("Card list progress updated!");
} else {
    const targetNoCrlf = target.replace(/\r\n/g, '\n');
    const contentNoCrlf = content.replace(/\r\n/g, '\n');
    if (contentNoCrlf.indexOf(targetNoCrlf) !== -1) {
         fs.writeFileSync(file, contentNoCrlf.replace(targetNoCrlf, replacement).replace(/\n/g, '\r\n'));
         console.log("Card list progress updated with CRLF normalize!");
    } else {
         console.log("Card list progress target not found!");
    }
}
