import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Trophy, Award, SearchCheck } from "lucide-react";
import Link from "next/link";
import { achievements, ACHIEVEMENT_CATEGORIES } from "@/lib/achievements";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch full user data to check bookmarks and progress accurately
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bookmarks: true,
      progress: true,
    }
  });

  if (!user) redirect("/dashboard");

  // Fetch complete topics with their step context for tags/category specific triggers
  const completedTopicIds = user.progress
    .filter(p => p.itemType === "TOPIC" && p.completed)
    .map(p => p.itemId);

  const completedTopics = await prisma.roadmapTopic.findMany({
    where: { id: { in: completedTopicIds } },
    include: { step: true }
  });

  // Calculate counts for categories based on step tags
  const topicsByCategory = {
    linux: completedTopics.filter(t => t.step?.tags?.toLowerCase().includes("linux")).length,
    git: completedTopics.filter(t => t.step?.tags?.toLowerCase().includes("git")).length,
    docker: completedTopics.filter(t => t.step?.tags?.toLowerCase().includes("docker") || t.step?.tags?.toLowerCase().includes("container")).length,
    cicd: completedTopics.filter(t => t.step?.tags?.toLowerCase().includes("cicd") || t.step?.tags?.toLowerCase().includes("pipeline")).length,
    cloud: completedTopics.filter(t => t.step?.tags?.toLowerCase().includes("cloud") || t.step?.tags?.toLowerCase().includes("aws") || t.step?.tags?.toLowerCase().includes("azure")).length,
    security: completedTopics.filter(t => t.step?.tags?.toLowerCase().includes("security") || t.step?.tags?.toLowerCase().includes("vault")).length,
  };

  // Fetch supporting module relations to compute fully completed modules
  const modulesWithTopics = await prisma.roadmapStepModule.findMany({
    include: { module: { include: { topics: { select: { id: true } } } } }
  });

  const completedItemIds = new Set(completedTopicIds);
  let completedModulesCount = 0;
  
  modulesWithTopics.forEach(am => {
     const topicsCount = am.module.topics.length;
     if (topicsCount > 0 && am.module.topics.every(t => completedItemIds.has(t.id))) {
        completedModulesCount++;
     }
  });

  // context envelope mapped for condition checks
  const context = {
    user,
    userProgress: user.progress || [],
    bookmarksCount: user.bookmarks?.length || 0,
    topicsByCategory,
    completedTopicsCount: completedTopics.length,
    completedModulesCount, 
    completedRoadmapsCount: 0, // Placeholder
  };

  // Evaluate unlock states
  const achievementsWithStatus = achievements.map(ach => ({
    ...ach,
    unlocked: ach.checkUnlocked(context)
  }));

  const totalUnlocked = achievementsWithStatus.filter(a => a.unlocked).length;

  // Helper to resolve tier colors elegantly
  const getTierStyles = (tier: string, unlocked: boolean) => {
    if (!unlocked) return "opacity-40 grayscale bg-muted/20 border-border/10";
    switch(tier) {
      case 'bronze': return "bg-amber-900/5 border-amber-600/30 text-amber-600 shadow-sm";
      case 'silver': return "bg-slate-500/5 border-slate-400/30 text-slate-400 shadow-sm";
      case 'gold': return "bg-yellow-500/5 border-yellow-500/30 text-yellow-500 shadow-sm";
      case 'platinum': return "bg-cyan-500/5 border-cyan-400/30 text-cyan-400 shadow-sm";
      default: return "bg-primary/5 border-primary/20 text-primary shadow-sm";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="pt-2">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>
       
      {/* Overview Banner */}
      <div className="rounded-3xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-primary/10">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-black">Your Achievements</h1>
          <p className="text-muted-foreground text-sm">Track your overall accomplishments and claim badges as you level up.</p>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="p-4 bg-primary/10 rounded-2xl text-center">
                <p className="text-2xl font-black text-primary">{totalUnlocked} / {achievements.length}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unlocked</p>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-2xl text-center">
                <p className="text-2xl font-black text-orange-500">{user.streak}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Day Streak</p>
            </div>
        </div>
      </div>

      {/* Grid displays grouped by categories layout sustainable responsibly */}
      {ACHIEVEMENT_CATEGORIES.map(category => {
          const catAchievements = achievementsWithStatus.filter(a => a.category === category.id);
          if (catAchievements.length === 0) return null;

          return (
              <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${category.color}`}>
                          {category.label}
                      </div>
                      <div className="h-px bg-border/40 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {catAchievements.map(ach => {
                          const Icon = ach.icon;
                          const tierStyle = getTierStyles(ach.tier, ach.unlocked);
                          
                          return (
                              <div 
                                key={ach.id} 
                                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${tierStyle}`}
                              >
                                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${ach.unlocked ? 'bg-background/80 shadow-xs' : 'bg-muted border-border'}`}>
                                      <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="space-y-0.5 text-left">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                          <p className="font-bold text-sm leading-tight">{ach.name}</p>
                                          {ach.tier !== 'none' && ach.unlocked && (
                                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase border leading-none ${
                                                  ach.tier === 'gold' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                                                  ach.tier === 'silver' ? 'bg-slate-400/10 text-slate-500 border-slate-400/30' :
                                                  ach.tier === 'bronze' ? 'bg-amber-600/10 text-amber-700 border-amber-600/30' : 
                                                  'bg-cyan-500/10 text-cyan-600 border-cyan-500/30'
                                              }`}>
                                                  {ach.tier}
                                              </span>
                                          )}
                                      </div>
                                      <p className="text-xs text-muted-foreground leading-snug">{ach.description}</p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          );
      })}
    </div>
  );
}