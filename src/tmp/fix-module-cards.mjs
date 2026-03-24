import fs from 'fs';

const filePath = 'c:/my-stuff/devops-hub/src/app/modules/modules-client.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Target the outer card wrapper with dynamic classes
const targetRegex = /<Card className=\{\`h-full hover:shadow-xl[\s\S]*?hover:border-emerald-400\/50"[\s\S]*?hover:border-foreground\/30"[\s\S]*?\}\}\`\>/;

const replacement = `<Card className={\`h-full transition-all duration-500 relative overflow-hidden flex flex-col items-start border border-border/10 hover:border-primary/30 backdrop-blur-xl bg-card/60 shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 group select-none \${
                                 isModuleComplete 
                                   ? "bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40" 
                                   : ""
                              }\`}>
                              {/* Glowing Backlight Sphere */}
                              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-500 blur-3xl pointer-events-none" style={{ backgroundColor: "rgb(59, 130, 246)" }} />
                              {/* Colored top accent bar */}
                              <div className="absolute top-0 left-0 right-0 h-1 transition-opacity" style={{ opacity: 0.8 }} />`;

if (code.match(targetRegex)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, code);
  console.log("✅ Outer card container replaced successfully!");
} else {
  console.log("❌ Outer card regex mismatched!");
}
