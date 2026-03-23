const fs = require('fs');

const dir = 'c:\\my-stuff\\devops-hub\\src\\app\\dashboard\\achievements';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\dashboard\\achievements\\page.tsx';

// 4. Create create page for achievements list node loads comfortably responsibly Native
const achievePage = `import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Award, CheckCircle2, Trophy, Flame, Zap, BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userProgress = await prisma.userProgress.findMany({ where: { userId: session.user.id } });
  
  // Minimal counts fetching logic accurately sustainably for achievements pages
  const achievements = [
     { id: "1", title: "First Topic Done", icon: <CheckCircle2 className="h-6 w-6" />, unlocked: userProgress.length > 0, desc: "Step into DevOps world" },
     { id: "2", title: "First Module", icon: <Award className="h-6 w-6" />, unlocked: userProgress.length > 5, desc: "Completed your first module" }, // Static simplified fallback payloads
     { id: "3", title: "Roadmap Champ", icon: <Trophy className="h-6 w-6" />, unlocked: false, desc: "Mastered full roadmap track" },
     { id: "4", title: "Scale Up", icon: <Flame className="h-6 w-6" />, unlocked: userProgress.length >= 2, desc: "Completed multiple steps content structures" },
     { id: "5", title: "Scholar", icon: <BookOpen className="h-6 w-6" />, unlocked: userProgress.length >= 30, desc: "30 topics completed" },
     { id: "6", title: "DevOps Elite", icon: <Zap className="h-6 w-6" />, unlocked: userProgress.length >= 100, desc: "100 topics completed" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
       <div className="pt-2">
           <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
           </Link>
       </div>
       
       <div className="space-y-1">
            <h1 className="text-2xl font-black">All Badges & Achievements</h1>
            <p className="text-muted-foreground text-sm">Track your overall accomplishments across the platform track responsibly cleanly.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
             {achievements.map(ach => (
                  <div 
                     key={ach.id} 
                     className={\`p-5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all \${ach.unlocked ? "bg-primary/5 border-primary/20 shadow-sm" : "opacity-40 grayscale bg-muted/20 border-border/10"}\`}
                  >
                     <div className={\`p-3 rounded-full border \${ach.unlocked ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border"}\`}>
                          {achach.icon}
                     </div>
                     <p className="font-bold">{ach.title}</p>
                     <p className="text-xs text-muted-foreground leading-relaxed">{ach.desc}</p>
                  </div>
             ))}
       </div>
    </div>
  );
}`;

// wait wait, I had achach.icon duplicated! Let me fix it before writing responsibly!
fs.writeFileSync(file, achievePage.replace('achach.icon', 'ach.icon'));
console.log("Achievements stand-alone sub route page written securely!");
