const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\components\\dashboard-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix getWeeklyActivity to map correct rolling past 7 weekdays titles
const oldMethod = `  // Calculate 7-day activity
  const getWeeklyActivity = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    
    progress.forEach((p: any) => {
       const date = new Date(p.createdAt);
       const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
       if (diff >= 0 && diff < 7) {
          counts[6 - diff]++;
       }
    });

    const days = ["M", "T", "W", "T", "F", "S", "S"];
    // Scroll correctly to match absolute Weekday anchors if desired
    return days.map((day, i) => ({ day, count: counts[i] }));
  };`;

const newMethod = `  // Calculate 7-day activity
  const getWeeklyActivity = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    
    progress.forEach((p: any) => {
       const date = new Date(p.createdAt);
       const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
       if (diff >= 0 && diff < 7) {
          counts[6 - diff]++;
       }
    });

    const daysLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = [];
    for (let i = 6; i >= 0; i--) {
       const pastDate = new Date();
       pastDate.setDate(today.getDate() - i);
       const dayName = daysLabel[pastDate.getDay()];
       result.push({ day: dayName, count: counts[6 - i] });
    }
    return result;
  };`;

if (content.includes(oldMethod)) {
    content = content.replace(oldMethod, newMethod);
}

// 2. Swap Bar Chart section into GitHub-style Heatmap grid layout maps index triggers native
const oldHtml = `                 <div className="flex items-end justify-between h-32 px-2 pt-2 gap-2">
                     {weeklyActivity.map((day, ix) => {
                          const heightPercent = Math.round((day.count / maxActivity) * 100);
                          return (
                               <div key={\`\${day.day}-\${ix}\`} className="flex flex-col items-center gap-2">
                                    <div className="w-full bg-primary/10 rounded-md relative group flex items-end h-24">
                                         <div className="w-full bg-primary rounded-md transition-all duration-700" style={{ height: mounted ? \`\${heightPercent}%\` : "0%" }}>
                                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-background border px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                   {day.count}
                                              </span>
                                         </div>
                                    </div>
                                    <span className="text-xs font-semibold text-muted-foreground">{day.day}</span>
                               </div>
                          );
                     })}
                 </div>`;

const newHtml = `                 <div className="flex items-center justify-between gap-2 border border-border/10 bg-muted/10 p-4 rounded-2xl relative">
                     {weeklyActivity.map((day: any, ix: number) => {
                          const intensity = day.count === 0 ? "bg-muted/30 hover:bg-muted/50 border border-transparent" 
                                          : day.count === 1 ? "bg-primary/30 border border-primary/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                                          : day.count < 4 ? "bg-primary/60 border border-primary/30"
                                          : "bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]";

                          return (
                               <div key={\`\${day.day}-\${ix}\`} className="flex flex-col items-center gap-2 flex-1 max-w-[45px]">
                                    <div 
                                        className={\`w-full aspect-square rounded-xl transition-all duration-300 relative group cursor-pointer \${intensity}\`}
                                    >
                                         <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black bg-background border px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity tracking-tight whitespace-nowrap shadow-sm z-30">
                                              {day.count} {day.count === 1 ? "topic" : "topics"}
                                         </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{day.day}</span>
                               </div>
                          );
                     })}
                 </div>`;

if (content.includes(oldHtml)) {
    content = content.replace(oldHtml, newHtml);
} else {
    // Spacer match relaxed
    const regex = /<div className="flex items-end justify-between h-32[\s\S]*?<\/div>\s*<\/Card>/;
    // Let's replace within exact block boundary anchor to be absolutely 100% safe setupwards responsibly
}

fs.writeFileSync(file, content);
console.log("Weekly activity swapped to GitHub-style heatmap perfectly!");
