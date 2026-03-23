const fs = require('fs');

// 1. Update step-modules-viewer.tsx — Add prominent "Back to Roadmap" inside Hero left section upper bounds node
const file1 = 'c:\\my-stuff\\devops-hub\\src\\components\\step-modules-viewer.tsx';
let content1 = fs.readFileSync(file1, 'utf8');

const target1 = `<div className="flex-1 space-y-5">
              <div`;

const replacement1 = `<div className="flex-1 space-y-5">
              <Link href={\`/roadmap/\${roadmap.id}\`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Roadmap
              </Link>
              <div`;

if (content1.includes(target1)) {
    content1 = content1.replace(target1, replacement1);
    fs.writeFileSync(file1, content1);
    console.log("Step Viewer prominent Back to Roadmap link added!");
} else {
    console.log("Target 1 not found!");
}

// 2. Update step-viewer.tsx — Add prominent "Back to Step" INSIDE sidebar Top or upper boundaries
const file2 = 'c:\\my-stuff\\devops-hub\\src\\components\\step-viewer.tsx';
let content2 = fs.readFileSync(file2, 'utf8');

// Inside sidebar top constraints layout
const target2 = ` px-4 py-8
        \${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        shrink-0 px-4 py-8
      \`) : (\`
        fixed md:sticky top-32 left-0 z-40 md:z-auto
`;

// Let's read exact lines from line 680 to insert it above Table of Contents inside `<aside>`
const anchor = `<div className="mb-8 pb-6 border-b">`;
const replacementNode = `{urlStepId && (
            <Link href={\`/roadmap/\${roadmap.id}/\${urlStepId}\`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-5 border-b pb-4 w-full">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Step: {step.title}
            </Link>
          )}
          <div className="mb-8 pb-6 border-b">`;

if (content2.includes(anchor)) {
    content2 = content2.replace(anchor, replacementNode);
    fs.writeFileSync(file2, content2);
    console.log("Step Viewer Back to Step link added!");
} else {
    console.log("Anchor not found in step viewer!");
}
