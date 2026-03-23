const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\modules\\modules-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update Card ClassName
const cardOld = `<Card className={\`h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col items-start \${
                                 isModuleComplete 
                                   ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50" 
                                   : "bg-card hover:border-foreground/30"
                              }\`}>`;

const cardNew = `<Card className={\`h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col items-start \${
                                 isModuleComplete 
                                   ? "bg-emerald-50/60 dark:bg-emerald-500/[0.03] border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400/50" 
                                   : "bg-card hover:border-foreground/30"
                              }\`}>`;

if (content.includes(cardOld)) {
    content = content.replace(cardOld, cardNew);
} else {
    // Try relaxed spacers replacement
    content = content.replace(/bg-emerald-500\/5\s+border-emerald-500\/30\s+hover:border-emerald-500\/50/, `bg-emerald-50/60 dark:bg-emerald-500/[0.03] border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400/50`);
}

// 2. Update Watermark Opacity/Dimensions
const watermarkOld = `<div className="absolute bottom-4 right-4 opacity-[0.07] pointer-events-none select-none">
                                    <svg width="80" height="80"`;
const watermarkNew = `<div className="absolute bottom-3 right-3 opacity-[0.12] pointer-events-none select-none">
                                    <svg width="48" height="48"`;

const svgPathsOld = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"`;
const svgPathsNew = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"`;

content = content.replace(watermarkOld, watermarkNew);
content = content.replace(svgPathsOld, svgPathsNew);

// 3. Update Footer Row Completed Span & Review Link
const footerBadgeOld = `<span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                                          ✓ {mod.trackingCompleted} / {mod.trackingTotal} Topics Done
                                       </span>`;

const footerBadgeNew = `<span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold whitespace-nowrap text-[11px]">
                                          ✓ {mod.trackingCompleted}/{mod.trackingTotal} Done
                                       </span>`;

content = content.replace(footerBadgeOld, footerBadgeNew);

const reviewOld = `<span className="ml-auto text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                          Review →
                                       </span>`;
const reviewNew = `<span className="ml-auto text-[11px] font-bold text-emerald-600 whitespace-nowrap">
                                          Review →
                                       </span>`;

content = content.replace(reviewOld, reviewNew);

fs.writeFileSync(file, content);
console.log("Cleanup detailed style complete!");
