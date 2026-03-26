"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight,
  Search, Zap, Clock, Trophy, Flame, LayoutGrid, List, Info, Lightbulb,
  Sparkles, Target, Star, ShieldCheck, ZapIcon, Pencil, Settings,
  Github, Youtube, ExternalLink, Paperclip, FileText, Globe, Box
} from "lucide-react";
import { BrandIcon } from "@/components/brand-icons";

const getIcon = (iconName: string, title?: string): React.ReactNode => {
   return <BrandIcon name={title || iconName} />;
};

export interface AttachedModule {
  id: string;
  order: number;
  isOptional?: boolean;
  optionalDescription?: string | null;
  module: {
    id: string;
    title: string;
    description: string;
    icon: string | null;
    tags: string;
    _count: { topics: number; resources: number };
    completedCount: number;
    readTime: number;
  };
}

export interface StepData {
  id: string;
  title: string;
  description: string;
  icon: string;
  attachedModules: AttachedModule[];
  resources?: any[]; // For Projects / Capstones
}

export interface RoadmapData {
  id: string;
  title: string;
  color: string;
  icon: string;
}

export interface SummaryStats {
  totalModules: number;
  totalTopics: number;
  completedTopics: number;
  percentComplete: number;
  completedResourceIds?: string[];
}

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function ProgressRing({ percent, color, size = 120, stroke = 7 }: {
  percent: number; color: string; size?: number; stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ 
          transition: "stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: `drop-shadow(0 0 8px ${color}66)`
        }}
      />
    </svg>
  );
}

export function StepModulesViewer({
  step, roadmap, prevStepId, nextStepId, stats, isAdmin
}: {
  step: StepData; roadmap: RoadmapData;
  prevStepId?: string; nextStepId?: string; stats: SummaryStats;
  isAdmin?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "az" | "topics">("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState(false);
  const [localCompletedIds, setLocalCompletedIds] = useState<string[]>(stats.completedResourceIds || []);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setLocalCompletedIds(stats.completedResourceIds || []); }, [stats.completedResourceIds]);

  const animatedPercent = useCountUp(mounted ? stats.percentComplete : 0);
  const animatedCompleted = useCountUp(mounted ? stats.completedTopics : 0);

  const filteredModules = useMemo(() => {
    let r = [...step.attachedModules];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter((am) => am.module.title.toLowerCase().includes(q) || am.module.description.toLowerCase().includes(q));
    }
    if (sortBy === "az") r.sort((a, b) => a.module.title.localeCompare(b.module.title));
    else if (sortBy === "topics") r.sort((a, b) => b.module._count.topics - a.module._count.topics);
    else r.sort((a, b) => {
      if (a.isOptional !== b.isOptional) return a.isOptional ? 1 : -1;
      return a.order - b.order;
    });
    return r;
  }, [step.attachedModules, searchQuery, sortBy]);

  const isMastered = stats.percentComplete === 100 && stats.totalTopics > 0 && stats.totalModules > 0;
  const isOnFire = stats.percentComplete > 0 && stats.percentComplete < 100 && stats.totalModules > 0;

  const handleToggleResource = async (resourceId: string, completed: boolean) => {
    // OPTIMISTIC UPDATE: Immediate UI feedback
    setLocalCompletedIds(prev => 
       completed ? [...prev, resourceId] : prev.filter(id => id !== resourceId)
    );

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: resourceId,
          itemType: "ROADMAP_RESOURCE",
          completed,
        }),
      });
      // No router.refresh() here to keep it snappy. 
      // The parent stats might be slightly out of sync on the PROGRESS RING, 
      // so we should calculate local percent too for the complete experience.
    } catch {
      // Revert on failure
      setLocalCompletedIds(prev => 
        completed ? prev.filter(id => id !== resourceId) : [...prev, resourceId]
      );
      console.error("Resource toggle failed");
    }
  };

  const localProjectIsDone = (step.resources?.length ?? 0) > 0 && localCompletedIds.length > 0;
  const localPercent = localProjectIsDone ? 100 : stats.percentComplete;
  const localIsMastered = localPercent === 100 && (stats.totalTopics > 0 || (step.resources && step.resources.length > 0));
  const localIsOnFire = localPercent > 0 && localPercent < 100;

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div 
          className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full blur-[150px] opacity-[0.07] animate-pulse" 
          style={{ background: roadmap.color }}
        />
        <div 
          className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full blur-[150px] opacity-[0.05]" 
          style={{ background: roadmap.color }}
        />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <div className="h-full w-full bg-[grid-size:40px_40px] bg-[grid-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]" />
        </div>
      </div>

      {/* ── STICKY BREADCRUMB ── */}
      <div className="sticky top-0 z-[100] border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 max-w-6xl flex items-center h-14 gap-3 text-sm">
          <Link href="/roadmap" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all">
            Roadmaps
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
          <Link href={`/roadmap/${roadmap.id}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <span className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{roadmap.icon}</span>
            <span className="hidden sm:inline font-bold">{roadmap.title}</span>
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
          <span className="font-black text-foreground truncate flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: roadmap.color }} />
            {step.title}
          </span>
        </div>
      </div>

      {/* ── PREMIUM HERO ── */}
      <div className="relative border-b overflow-hidden pt-6 pb-8 lg:pt-8 lg:pb-10">
        {/* Subtle Watermark */}
        <div className="absolute -right-10 -top-10 text-[25rem] opacity-[0.04] dark:opacity-[0.06] font-black pointer-events-none select-none rotate-12">
          {getIcon(step.icon)}
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-12 lg:gap-16">

            {/* Content Left */}
            <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="space-y-3">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm"
                  style={{ borderColor: `${roadmap.color}30`, color: roadmap.color, background: `linear-gradient(to right, ${roadmap.color}10, transparent)` }}
                >
                  <Star className="h-2.5 w-2.5 fill-current" /> {roadmap.title}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border-2 bg-background/50 backdrop-blur-xl shadow-xl relative group transition-all duration-500 hover:rotate-3"
                    style={{ borderColor: `${roadmap.color}33`, boxShadow: `0 10px 30px -5px ${roadmap.color}22` }}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-500">{getIcon(step.icon)}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                      {step.title}
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1 max-w-xl leading-relaxed font-bold opacity-80">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges & Quick Stats */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-md transition-all hover:bg-muted/50">
                  {localIsMastered ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                      <Trophy className="h-4 w-4" />
                    </span>
                  ) : localIsOnFire ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                      <Flame className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                      <Zap className="h-4 w-4" />
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 leading-none mb-1">Status</span>
                    <span className="text-xs font-black text-foreground">{localIsMastered ? "Step Mastered" : localIsOnFire ? "Learning Path" : "Get Started"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-md transition-all hover:bg-muted/50">
                   <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-500/20 text-foreground border border-white/10">
                      <BookOpen className="h-4 w-4" />
                    </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 leading-none mb-1">Content</span>
                    <span className="text-xs font-black text-foreground text-nowrap">
                       {step.attachedModules.length > 0 && !step.title.toLowerCase().includes("project") && !step.title.toLowerCase().includes("capstone") ? (
                          `${stats.totalModules} Units · ${stats.totalTopics} Topics`
                       ) : (
                          `${step.resources?.length || stats.totalTopics || 0} Project Resources`
                       )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar (Neon Style) */}
              <div className="space-y-3 max-w-md">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Mastery Progress</span>
                  <div className="flex items-center gap-4">
                     <span className="text-2xl font-black text-foreground tracking-tighter">{localPercent}%</span>
                     {isAdmin && (
                        <Link href={`/admin/roadmaps/${roadmap.id}`}>
                           <button className="h-8 px-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-all">
                              <Pencil className="h-3 w-3" /> Edit Step
                           </button>
                        </Link>
                     )}
                  </div>
                </div>
                <div className="h-4 rounded-full bg-muted/40 p-1 border border-border/10 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{
                      width: mounted ? `${stats.percentComplete}%` : "0%",
                      background: `linear-gradient(90deg, ${roadmap.color}88, ${roadmap.color})`,
                      boxShadow: stats.percentComplete > 0 ? `0 0 15px ${roadmap.color}44` : "none",
                    }}
                  >
                     <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-md rounded-full animate-shine" />
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex justify-center lg:block animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              <div
                className="relative overflow-hidden bg-white/40 dark:bg-zinc-900/60 backdrop-blur-[40px] border-2 rounded-[2.5rem] p-6 shadow-2xl flex flex-col items-center gap-4 w-full sm:min-w-[240px] group/card transition-all duration-700 border-white/20 dark:border-white/10"
              >
                <div 
                  className="absolute inset-x-0 top-0 h-1/2 rounded-full blur-[60px] opacity-[0.1] dark:opacity-[0.2]" 
                  style={{ background: roadmap.color }}
                />
                <div className="relative flex items-center justify-center p-3 rounded-full bg-background/50 dark:bg-zinc-950/50 backdrop-blur-xl border border-white/20 dark:border-white/10">
                  <ProgressRing percent={localPercent} color={localIsMastered ? '#10b981' : roadmap.color} size={110} stroke={8} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black tracking-tighter text-foreground leading-none">{localPercent}%</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">Mastery</span>
                  </div>
                </div>
 
                <div className="grid grid-cols-2 gap-3 w-full relative z-10">
                  <div className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 p-3 rounded-2xl flex flex-col items-center group/stat transition-colors text-center">
                    <span className="text-xl font-black text-foreground tabular-nums">{animatedCompleted}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mt-0.5">Done</span>
                  </div>
                  <div 
                    className="border-2 p-3 rounded-2xl flex flex-col items-center shadow-md text-center"
                    style={{ backgroundColor: `${roadmap.color}10`, borderColor: `${roadmap.color}25` }}
                  >
                    <span className="text-xl font-black tabular-nums" style={{ color: roadmap.color }}>
                      {stats.totalTopics - stats.completedTopics}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mt-0.5">Left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto px-4 max-w-6xl py-12 space-y-12">

        {/* Filters & Control Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center w-full">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search curriculum modules..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="pl-11 h-14 w-full rounded-2xl bg-card/40 backdrop-blur-xl border-2 border-border/50 focus:border-primary focus:ring-0 text-sm font-bold shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/40 backdrop-blur-xl border-2 border-border/50 rounded-2xl p-1 shadow-sm h-14">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`w-12 h-full flex items-center justify-center rounded-xl transition-all ${viewMode === "grid" ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`w-12 h-full flex items-center justify-center rounded-xl transition-all ${viewMode === "list" ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <div className="relative h-14 group">
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value as any)}
                 className="h-full px-6 rounded-2xl bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl border-2 border-border/50 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary shadow-sm hover:border-border transition-all pr-10"
               >
                 <option value="default" className="bg-background text-foreground">Structure</option>
                 <option value="az" className="bg-background text-foreground">A → Z</option>
                 <option value="topics" className="bg-background text-foreground">Topics</option>
               </select>
               <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE CURRICULUM STRATEGY BANNER ── */}
        <div 
          className="p-6 rounded-[2.5rem] border-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[40px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden relative group/banner border-white/20 dark:border-white/5"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-lg transition-transform group-hover:rotate-6 duration-500"
              style={{ backgroundColor: `${roadmap.color}15`, color: roadmap.color, borderColor: `${roadmap.color}33` }}
            >
              <Sparkles className="h-6 w-6 fill-current" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h5 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                Learning Strategy
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed font-bold tracking-tight max-w-4xl">
                Mandatory modules are core standards. <span style={{ color: roadmap.color, borderColor: `${roadmap.color}44` }} className="font-black border-b px-0.5">Optional Paths</span> are specializations — master them to distinguish your expertise.
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        {/* ── CONTENT GRID / PROJECT DASHBOARD ── */}
        {(() => {
           const isProject = step.title.toLowerCase().includes("project") || step.title.toLowerCase().includes("capstone");
           const hasNoModules = filteredModules.length === 0;
           const showProjectView = isProject || (hasNoModules && (step.resources?.length ?? 0) > 0);

           if (showProjectView) {
             const resources = step.resources || [];
             return (
               <div className="space-y-12 pb-20 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {resources.map((res: any, idx: number) => {
                        const isGithub = res.url.includes("github.com");
                        const isYoutube = res.url.includes("youtube.com") || res.url.includes("youtu.be");
                        const isDoc = res.type === "DOCUMENTATION" || res.url.includes("medium.com") || res.url.includes("dev.to");
                        
                        let Icon = ExternalLink;
                        let color = roadmap.color;
                        let label = "RESOURCE";
                        let branding = "text-primary bg-primary/10 border-primary/20";
                        
                        if (isGithub) { Icon = Github; label = "REPOSITORY"; branding = "dark:text-white text-zinc-900 bg-zinc-500/10 border-zinc-500/20"; color = "#333"; }
                        else if (isYoutube) { Icon = Youtube; label = "VIDEO"; branding = "text-red-500 bg-red-500/10 border-red-500/20"; color = "#ef4444"; }
                        else if (isDoc) { Icon = FileText; label = "ARTICLE"; branding = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"; color = "#10b981"; }

                        const isDone = localCompletedIds.includes(res.id);

                        return (
                          <div key={res.id} className="group relative flex flex-col p-8 rounded-[3rem] border-2 bg-card/60 backdrop-blur-3xl hover:shadow-2xl hover:border-primary/30 transition-all duration-700 hover:-translate-y-2 border-border/40 overflow-hidden group/pcard">
                             {/* Floating Atmospheric Glow */}
                             <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-[80px] opacity-0 group-hover/pcard:opacity-20 transition-opacity duration-1000" style={{ backgroundColor: color }} />
                             
                             <div className="flex items-center justify-between mb-8">
                                <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${branding}`}>
                                   {label}
                                </div>
                                <button
                                   onClick={(e) => {
                                      e.preventDefault();
                                      handleToggleResource(res.id, !isDone);
                                   }}
                                   className={`group/check flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all ${
                                      isDone 
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                                      : "bg-muted/30 border-border/40 text-muted-foreground/30 hover:border-emerald-500/30 hover:text-emerald-500"
                                   }`}
                                >
                                   {isDone ? <CheckCircle2 className="h-4 w-4 fill-emerald-500/20" /> : <div className="h-4 w-4 rounded-full border-2 border-current opacity-20" />}
                                   <span className="text-[10px] font-black uppercase tracking-widest">
                                      {isDone ? "Project Ready" : "Mark Ready"}
                                   </span>
                                </button>
                             </div>

                             <div className="flex flex-col gap-5 relative z-10 flex-1">
                                <Icon className={`h-10 w-10 opacity-80 group-hover/pcard:scale-110 group-hover/pcard:rotate-6 transition-transform duration-500 ${isDone ? "text-emerald-500" : ""}`} style={{ color: isDone ? undefined : color }} />
                                <div className="space-y-2">
                                   <div className="flex items-start gap-3">
                                      <h4 className={`text-xl font-black tracking-tight group-hover/pcard:text-primary transition-colors leading-tight ${isDone ? "text-emerald-500/80" : "text-foreground"}`}>
                                         {res.title}
                                      </h4>
                                   </div>
                                   <p className="text-[13px] text-muted-foreground font-bold leading-relaxed line-clamp-3 opacity-80">
                                      {res.description}
                                   </p>
                                </div>
                             </div>

                             <div className="mt-8 flex gap-3">
                                <a 
                                   href={res.url} 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   className="flex-1"
                                >
                                   <button className="w-full h-14 rounded-[2rem] bg-muted/40 hover:bg-muted border-2 border-border/50 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                      Explore <ExternalLink className="h-4 w-4" />
                                   </button>
                                </a>
                                {isDone && (
                                   <div className="w-14 h-14 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 animate-in zoom-in-50 duration-500">
                                      <Trophy className="h-6 w-6" />
                                   </div>
                                )}
                             </div>
                          </div>
                        );
                     })}
                  </div>
                  
                  {hasNoModules && (
                    <div className="p-10 rounded-[4rem] border-4 border-dashed border-border/20 bg-muted/10 text-center space-y-4">
                       <Lightbulb className="h-12 w-12 text-primary/40 mx-auto" />
                       <h3 className="text-2xl font-black tracking-tighter text-foreground/80">Independent Capstone Project</h3>
                       <p className="text-muted-foreground text-sm font-bold max-w-lg mx-auto leading-relaxed">
                          This step is designed for self-directed practical application. Study the external repositories and videos above to implement your solution.
                       </p>
                    </div>
                  )}
               </div>
             );
           }

           return filteredModules.length > 0 ? (
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-20 mt-8"
              : "flex flex-col gap-8 pb-20 mt-8"
            }>
              {filteredModules.map((am, idx) => {
                const total = am.module._count.topics;
                const done = am.module.completedCount;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                const isCompleted = total > 0 && done >= total;
  
                /* ── LIST VIEW (Premium Row) ── */
                if (viewMode === "list") {
                  return (
                    <Link
                      key={am.id}
                      href={`/modules/${am.module.id}?roadmapId=${roadmap.id}&stepId=${step.id}`}
                      className="group flex flex-col md:flex-row md:items-center gap-8 p-8 rounded-[3.5rem] border-2 bg-card/30 backdrop-blur-2xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 relative overflow-hidden active:scale-[0.98]"
                    >
                       <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-1000"
                          style={{ background: roadmap.color }}
                       />
                      <div className="text-5xl w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 border-2 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 bg-background/50 backdrop-blur-xl"
                      style={{ borderColor: `${roadmap.color}25` }}
                    >
                      {getIcon(am.module.icon || "", am.module.title)}
                    </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="font-black text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">{am.module.title}</span>
                          {am.isOptional && (
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-2xl bg-muted border-2 border-border/50 text-muted-foreground">Optional</span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">Mastered</span>
                          )}
                          {isAdmin && (
                            <Link href={`/admin/modules/${am.module.id}`}>
                               <button className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border-border/50 border-2 hover:bg-muted transition-all flex items-center gap-2">
                                  <Settings className="h-2.5 w-2.5" /> Admin
                               </button>
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-bold tracking-tight line-clamp-1 opacity-80">{am.module.description}</p>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="flex flex-col items-end gap-2">
                            <span className="text-xs font-black text-foreground tracking-widest uppercase opacity-60">{percent}% Completion</span>
                            <div className="w-40 h-2 rounded-full bg-muted/50 overflow-hidden border border-border/20">
                               <div className="h-full rounded-full transition-all duration-[1.5s] ease-out-back" style={{ width: `${percent}%`, background: roadmap.color }} />
                            </div>
                         </div>
                         <div className="h-16 w-16 rounded-full border-2 border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transform transition-all group-hover:scale-110">
                            <ArrowRight className="h-7 w-7 text-muted-foreground group-hover:text-white" />
                         </div>
                      </div>
                    </Link>
                  );
                }
  
                /* ── GRID VIEW (Mega Cards) ── */
                return (
                  <div
                    key={am.id}
                    className="group relative flex flex-col rounded-[2.5rem] border-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[40px] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 hover:border-primary/20 border-white/10 dark:border-white/5"
                    style={{ borderColor: isCompleted ? "rgba(16,185,129,0.2)" : undefined }}
                  >
                    <div className="h-1.5 bg-muted/20 relative overflow-hidden">
                       <div 
                         className="h-full transition-all duration-1000" 
                         style={{ width: `${percent}%`, backgroundColor: roadmap.color, boxShadow: percent > 0 ? `0 0 10px ${roadmap.color}` : 'none' }} 
                       />
                    </div>
   
                     <div className="relative p-7 flex-1 flex flex-col gap-6">
                       <div className="flex items-start justify-between">
                         <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 bg-background/50 backdrop-blur-xl shadow-lg transition-transform duration-500 group-hover:scale-110"
                          style={{ borderColor: `${roadmap.color}25` }}
                        >
                          {getIcon(am.module.icon || "", am.module.title)}
                        </div>
                         <div className="flex flex-col items-end gap-2 text-right">
                            <div className="flex items-center gap-2">
                              {am.isOptional && (
                                <span 
                                  className="text-[8.5px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md border bg-muted/20 border-border/30 text-muted-foreground/50"
                                >
                                  Optional
                                </span>
                              )}
                              <span
                                className="text-[10px] font-black w-7 h-7 rounded-lg flex items-center justify-center border transition-all"
                                style={{ backgroundColor: `${roadmap.color}10`, color: roadmap.color, borderColor: `${roadmap.color}20` }}
                              >
                                #{idx + 1}
                              </span>
                            </div>
                         </div>
                       </div>
   
                       <div className="space-y-1.5">
                         <h3 className="font-black text-foreground text-lg tracking-tight leading-tight group-hover:text-primary transition-colors">{am.module.title}</h3>
                         <p className="text-xs text-muted-foreground font-bold leading-relaxed line-clamp-2 opacity-90">{am.module.description.replace(/Module:/, "")}</p>
   
                         {/* Strategist Note (Premium Hint) - Compact Style */}
                         {am.isOptional && (
                           <div 
                             className="mt-2.5 p-2.5 rounded-xl border relative transition-all bg-white/30 dark:bg-zinc-950/20 backdrop-blur-md border-white/20 dark:border-white/5"
                           >
                              <div className="flex items-start gap-2">
                                 <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: roadmap.color }} />
                                 <p className="text-[10.5px] font-bold leading-tight text-foreground/70 lowercase">
                                   <span className="uppercase text-[8.5px] opacity-40 mr-1.5 text-muted-foreground">Why Optional?</span>
                                   {am.optionalDescription || "deep-dive specialization recommended for advanced operational mastery."}
                                 </p>
                              </div>
                           </div>
                         )}
                       </div>
   
                       <div className="mt-auto pt-4 space-y-6">
                       <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider text-muted-foreground/40">
                             <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {am.module._count.topics} Steps</span>
                             <span className="flex items-center gap-1.5 border-l border-border/20 pl-3"><Clock className="h-3 w-3" /> {am.module.readTime}m</span>
                           </div>
                           <div className="text-right">
                              <span className="text-sm font-black text-foreground tabular-nums tracking-tighter" style={{ color: roadmap.color }}>
                                {am.module.completedCount}<span className="text-[10px] opacity-25 mx-0.5">/</span>{am.module._count.topics}
                              </span>
                           </div>
                         </div>
   
                         <Link href={`/modules/${am.module.id}?roadmapId=${roadmap.id}&stepId=${step.id}`} className="block">
                           <button
                             className="w-full h-14 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden relative group/btn"
                             style={isCompleted
                               ? { backgroundColor: "rgba(16,185,129,0.08)", border: "2px solid rgba(16,185,129,0.2)", color: "#16a34a" }
                               : { backgroundColor: roadmap.color, border: "2px solid transparent", color: "#fff", boxShadow: `0 10px 20px -5px ${roadmap.color}66` }
                             }
                           >
                              <span className="relative z-10 flex items-center justify-center gap-3">
                                {isCompleted ? "✓ Review" : am.module.completedCount > 0 ? "Continue" : "Start"}
                              </span>
                           </button>
                         </Link>
   
                         {isAdmin && (
                           <div className="pt-2 border-t border-border/10">
                              <Link href={`/admin/modules/${am.module.id}`}>
                                <button className="w-full h-10 rounded-2xl bg-muted/30 border border-border/20 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-2">
                                  <Settings className="h-3 w-3" /> System Configuration
                                </button>
                              </Link>
                           </div>
                         )}
                       </div>
                     </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-4 border-dashed border-border/20 rounded-[5rem] p-32 text-center bg-muted/10 backdrop-blur-md animate-in zoom-in-95 duration-700">
              <ZapIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6 animate-pulse" />
              <p className="text-muted-foreground text-2xl font-black tracking-tightest">No Matching Resources Found</p>
              <p className="text-muted-foreground/50 text-base mt-2 font-bold uppercase tracking-widest">Adjust filters or search parameters</p>
            </div>
          );
        })()}

        {/* ── PREV / NEXT NAVIGATION ── */}
        <div className="pt-10 border-t-2 border-border/10 flex flex-col sm:flex-row items-center justify-between gap-6 pb-20">
          {prevStepId ? (
            <Link href={`/roadmap/${roadmap.id}/${prevStepId}`} className="group w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-4 px-8 py-4 rounded-3xl border-2 border-border bg-card/40 backdrop-blur-xl text-foreground hover:bg-muted transition-all">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-black uppercase tracking-widest">Previous</span>
              </button>
            </Link>
          ) : <div />}

          {nextStepId ? (
            <Link href={`/roadmap/${roadmap.id}/${nextStepId}`} className="group w-full sm:w-auto">
              <button
                className="w-full flex items-center justify-center gap-4 px-10 py-4 rounded-3xl text-white shadow-xl transition-all"
                style={{ backgroundColor: roadmap.color, boxShadow: `0 10px 30px -5px ${roadmap.color}66` }}
              >
                <span className="text-sm font-black uppercase tracking-widest">Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          ) : <div />}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(400%) rotate(45deg); }
        }
        .animate-shine {
          animation: shine 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .ease-out-back {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .tracking-tightest {
          letter-spacing: -0.05em;
        }
        h1, h2, h3, h5, button {
            font-family: var(--font-outfit), sans-serif;
        }
      `}</style>
    </div>
  );
}