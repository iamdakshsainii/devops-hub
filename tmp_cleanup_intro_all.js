const fs = require('fs');

// 1. Update app/roadmap/[id]/[stepId]/page.tsx — remove introContent
const stepFile = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\[stepId]\\page.tsx';
let stepContent = fs.readFileSync(stepFile, 'utf8');

const target = `        icon: step.icon,
        introContent: step.introContent,`;

const replacement = `        icon: step.icon,`;

if (stepContent.includes(target)) {
    stepContent = stepContent.replace(target, replacement);
    fs.writeFileSync(stepFile, stepContent);
    console.log("Intro content removed from step page props!");
} else {
    // Try without CRLF
    const tNoCrlf = target.replace(/\r\n/g, '\n');
    const cNoCrlf = stepContent.replace(/\r\n/g, '\n');
    if (cNoCrlf.includes(tNoCrlf)) {
        stepContent = cNoCrlf.replace(tNoCrlf, replacement.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
        fs.writeFileSync(stepFile, stepContent);
        console.log("Intro content removed from step page props with CRLF!");
    } else {
        console.log("Target not found!");
    }
}

// 2. Delete app/api/roadmaps/[id]/steps/[stepId]/route.ts
const routeFile = 'c:\\my-stuff\\devops-hub\\src\\app\\api\\roadmaps\\[id]\\steps\\[stepId]\\route.ts';
if (fs.existsSync(routeFile)) {
    fs.unlinkSync(routeFile);
    console.log("api route file deleted!");
} else {
    console.log("Api route file already deleted or not found.");
}
