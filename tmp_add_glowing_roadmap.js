const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/roadmap/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('getServerSession')) {
  content = `import { getServerSession } from "next-auth";\nimport { authOptions } from "@/lib/auth";\n` + content;
}

if (!content.includes('const session = await getServerSession(authOptions)')) {
  content = content.replace(
    /const roadmap = await prisma.roadmap.findUnique\({/,
    `const session = await getServerSession(authOptions);\n  const [roadmap, progress] = await Promise.all([\n    prisma.roadmap.findUnique({`
  );
  
  content = content.replace(
    /        }\n      }\n    }\n  }\);\n/,
    `        }\n      }\n    }\n  }),\n    session?.user?.id ? prisma.userProgress.findMany({ where: { userId: session.user.id } }) : []\n  ]);\n  const completedItemIds = new Set(progress.map((p: any) => p.itemId));\n`
  );
  
  // also adjust the steps include to get subtopics
  content = content.replace(
    /topics: { take: 3, select: { title: true, id: true } },/,
    `topics: { select: { title: true, id: true, content: true, subtopics: { select: { id: true, content: true } } } },`
  );
}

// Calculate glowing status for each step in rendering
if (!content.includes('const isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;')) {
  content = content.replace(
    /\{roadmap.steps.map\(\(step, i\) => \(/,
    `{roadmap.steps.map((step, i) => {\n            let trackingTotal = 0;\n            let trackingCompleted = 0;\n            for (const t of step.topics) {\n              if (t.subtopics && t.subtopics.length > 0) {\n                trackingTotal += t.subtopics.length;\n                trackingCompleted += t.subtopics.filter(s => completedItemIds.has(s.id)).length;\n              } else if (t.content) {\n                trackingTotal += 1;\n                if (completedItemIds.has(t.id)) trackingCompleted += 1;\n              }\n            }\n            const isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;\n            return (`
  );
  
  content = content.replace(
    /className="hidden sm:flex w-16 h-16 rounded-2xl bg-card border shadow-sm items-center justify-center relative z-20 group-hover:scale-110 transition-transform duration-300"/g,
    `className={\`hidden sm:flex w-16 h-16 rounded-2xl bg-card border shadow-sm items-center justify-center relative z-20 group-hover:scale-110 transition-transform duration-300 \${isCompleted ? "shadow-[0_0_20px_rgba(16,185,129,0.7)] border-emerald-500 scale-105" : ""}\`}`
  );
  
  content = content.replace(
    /style=\{\{ borderColor: `\$\{roadmap.color\}50` \}\}/g,
    `style={{ borderColor: isCompleted ? '#10b981' : \`\${roadmap.color}50\` }}`
  );

  content = content.replace(
    /<span className="text-xl font-black" style=\{\{ color: roadmap.color \}\}>/g,
    `<span className="text-xl font-black" style={{ color: isCompleted ? '#10b981' : roadmap.color }}>`
  );
  
  content = content.replace(
    /style=\{\{ borderColor: `\$\{roadmap.color\}50`, color: roadmap.color \}\}/g,
    `style={{ borderColor: isCompleted ? '#10b981' : \`\${roadmap.color}50\`, color: isCompleted ? '#10b981' : roadmap.color }}`
  );

  content = content.replace(
    /<div\s*className="absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"\s*style=\{\{ backgroundColor: roadmap.color \}\}\s*\/>/g,
    `<div\n                    className={\`absolute top-0 left-0 w-1.5 h-full transition-opacity \${isCompleted ? "opacity-100 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "opacity-0 group-hover:opacity-100"}\`}\n                    style={{ backgroundColor: isCompleted ? undefined : roadmap.color }}\n                  />`
  );
  
  // Close the map block correctly
  content = content.replace(
    /<\/Link>\n          \)\)}/g,
    `</Link>\n          )})}`
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Script updated roadmap page successfully');
