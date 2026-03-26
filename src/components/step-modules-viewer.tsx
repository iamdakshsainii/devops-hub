"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight,
  Search, Zap, Clock, Trophy, Flame, LayoutGrid, List, Info, Lightbulb
} from "lucide-react";

const getIcon = (iconName: string): string => iconName || "📦";

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
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

export function StepModulesViewer({
  step, roadmap, prevStepId, nextStepId, stats,
}: {
  step: StepData; roadmap: RoadmapData;
  prevStepId?: string; nextStepId?: string; stats: SummaryStats;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "az" | "topics">("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const animatedPercent = useCountUp(mounted ? stats.percentComplete : 0);
  const animatedCompleted = useCountUp(mounted ? stats.completedTopics : 0);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    step.attachedModules.forEach((am) => {
      if (am.module.tags) am.module.tags.split(",").forEach((t) => { const x = t.trim(); if (x) s.add(x); });
    });
    return Array.from(s);
  }, [step.attachedModules]);

  const filteredModules = useMemo(() => {
    let r = [...step.attachedModules];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter((am) => am.module.title.toLowerCase().includes(q) || am.module.description.toLowerCase().includes(q));
    }
    if (activeTag) {
      r = r.filter((am) => am.module.tags.split(",").map((t) => t.trim().toLowerCase()).includes(activeTag.toLowerCase()));
    }
    if (sortBy === "az") r.sort((a, b) => a.module.title.localeCompare(b.module.title));
    else if (sortBy === "topics") r.sort((a, b) => b.module._count.topics - a.module._count.topics);
    else r.sort((a, b) => {
      // Required modules first!
      if (a.isOptional !== b.isOptional) return a.isOptional ? 1 : -1;
      return a.order - b.order;
    });
    return r;
  }, [step.attachedModules, searchQuery, activeTag, sortBy]);

  const isMastered = stats.percentComplete === 100 && stats.totalTopics > 0 && stats.totalModules > 0;
  const isOnFire = stats.percentComplete > 0 && stats.percentComplete < 100 && stats.totalModules > 0;

  return (
    <div className="min-h-screen bg-background">

      {/* ── BREADCRUMB ── */}
      <div className="border-b bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-6xl flex items-center h-11 gap-2 text-sm">
          <Link href="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmaps</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <Link href={`/roadmap/${roadmap.id}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <span>{roadmap.icon}</span>
            <span className="hidden sm:inline truncate max-w-[160px]">{roadmap.title}</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="font-semibold text-foreground truncate">{step.title}</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <div
        className="relative overflow-hidden border-b"
        style={{ background: `linear-gradient(135deg, ${roadmap.color}0d 0%, transparent 55%), hsl(var(--card) / 0.35)` }}
      >
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${roadmap.color} 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />
        <div
          className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full blur-[130px] opacity-[0.08] pointer-events-none"
          style={{ background: roadmap.color }}
        />

        <div className="relative container mx-auto px-4 max-w-6xl py-10 md:py-14">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">

            {/* Left */}
            <div className="flex-1 space-y-5">
              <Link href={`/roadmap/${roadmap.id}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Roadmap
              </Link>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border"
                style={{ borderColor: `${roadmap.color}30`, color: roadmap.color, backgroundColor: `${roadmap.color}0e` }}
              >
                <span>{roadmap.icon}</span> {roadmap.title}
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border bg-card shadow-sm"
                  style={{ borderColor: `${roadmap.color}22`, boxShadow: `0 4px 20px ${roadmap.color}12` }}
                >
                  {getIcon(step.icon)}
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                    {step.title}
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base mt-1.5 max-w-xl leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isMastered ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <Trophy className="h-3.5 w-3.5" /> Step Mastered
                  </span>
                ) : isOnFire ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20">
                    <Flame className="h-3.5 w-3.5" /> In Progress
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border">
                    <Zap className="h-3.5 w-3.5" /> Not Started
                  </span>
                )}
                <span className="text-muted-foreground text-xs">
                  {stats.totalModules} module{stats.totalModules !== 1 ? "s" : ""} · {stats.totalTopics} topics
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Progress</span>
                  <span>{stats.completedTopics} of {stats.totalTopics} topics</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: mounted ? `${stats.percentComplete}%` : "0%",
                      background: isMastered 
                        ? 'linear-gradient(90deg, #10b981aa, #10b981)' 
                        : `linear-gradient(90deg, ${roadmap.color}aa, ${roadmap.color})`,
                      boxShadow: stats.percentComplete > 0 ? `0 0 8px ${roadmap.color}45` : undefined,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: ring card */}
            <div
              className="shrink-0 bg-card border rounded-3xl p-5 shadow-sm flex flex-row lg:flex-col items-center gap-5 lg:gap-3 w-full lg:w-auto"
              style={{ borderColor: `${roadmap.color}18` }}
            >
              <div className="relative flex items-center justify-center">
                <ProgressRing percent={stats.percentComplete} color={isMastered ? '#10b981' : roadmap.color} size={110} stroke={6} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black leading-none ${isMastered ? 'text-emerald-500' : 'text-foreground'}`}>
                    {animatedPercent}<span className="text-sm text-muted-foreground">%</span>
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isMastered ? 'text-emerald-500/80' : 'text-muted-foreground'}`}>Done</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center w-full lg:w-40">
                <div className="bg-muted/70 rounded-xl p-3">
                  <p className="text-lg font-black text-foreground">{animatedCompleted}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Completed</p>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: `${roadmap.color}10` }}>
                  <p className="text-lg font-black" style={{ color: roadmap.color }}>
                    {stats.totalTopics - stats.completedTopics}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto px-4 max-w-6xl py-8 space-y-7">

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allTags.length > 0 && (
              <>
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all border"
                  style={!activeTag
                    ? { backgroundColor: roadmap.color, color: "#fff", borderColor: "transparent" }
                    : { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))" }
                  }
                >All</button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all border"
                    style={activeTag === tag
                      ? { backgroundColor: roadmap.color, color: "#fff", borderColor: "transparent" }
                      : { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))" }
                    }
                  >{tag}</button>
                ))}
              </>
            )}

            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground focus:outline-none"
            >
              <option value="default">Default Order</option>
              <option value="az">A → Z</option>
              <option value="topics">Most Topics</option>
            </select>
          </div>
        </div>

        {/* ── CURRICULUM GUIDE ── */}
        <div 
          className="p-4 rounded-2xl border flex items-start gap-3 bg-primary/5 border-primary/10 shadow-sm"
        >
          <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0 mt-0.5">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-foreground">Curriculum Guide</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Required modules are listed first. Modules marked as <span className="text-primary font-bold">Optional</span> are elective paths — you can skip them and still achieve <span className="text-emerald-500 font-bold italic">100% Mastery</span> for this step.
            </p>
          </div>
        </div>

        {/* Cards */}
        {filteredModules.length > 0 ? (
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
            {filteredModules.map((am, idx) => {
              const isCompleted = am.module.completedCount === am.module._count.topics && am.module._count.topics > 0;
              const inProgress = am.module.completedCount > 0 && !isCompleted;
              const percent = am.module._count.topics > 0
                ? Math.round((am.module.completedCount / am.module._count.topics) * 100) : 0;

              if (viewMode === "list") {
                return (
                  <Link
                    key={am.id}
                    href={`/modules/${am.module.id}?roadmapId=${roadmap.id}&stepId=${step.id}`}
                    className="group flex items-center gap-4 p-4 rounded-2xl border bg-card hover:shadow-md transition-all duration-200"
                    style={{ borderColor: isCompleted ? "rgba(16,185,129,0.22)" : "hsl(var(--border))" }}
                  >
                    <div
                      className="text-xl w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ backgroundColor: `${roadmap.color}10`, borderColor: `${roadmap.color}1a` }}
                    >
                      {getIcon(am.module.icon || "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground truncate">{am.module.title}</p>
                        {am.isOptional && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border font-black uppercase tracking-tighter">Optional</span>
                        )}
                        {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{am.module.description}</p>
                      {am.isOptional && am.optionalDescription && (
                        <div className="flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 w-fit">
                          <Lightbulb className="h-3 w-3 text-primary" />
                          <p className="text-[11px] text-primary font-bold italic truncate max-w-[200px]">{am.optionalDescription}</p>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{am.module._count.topics}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{am.module.readTime}m</span>
                      <div className="w-16">
                        <div className="h-1.5 rounded-full bg-muted">
                          <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: roadmap.color }} />
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              }

              return (
                <div
                  key={am.id}
                  className="group relative flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  style={{ borderColor: isCompleted ? "rgba(16,185,129,0.25)" : "hsl(var(--border))" }}
                >
                  {/* Top fill bar */}
                  <div className="h-1 bg-muted">
                    <div className="h-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: roadmap.color }} />
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div
                        className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center border"
                        style={{ backgroundColor: `${roadmap.color}10`, borderColor: `${roadmap.color}1a` }}
                      >
                        {getIcon(am.module.icon || "")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {am.isOptional && (
                          <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border border-border/20 bg-muted/40 text-muted-foreground">Optional</span>
                        )}
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </span>
                        )}
                        {inProgress && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full">
                            <Flame className="h-3 w-3" /> {percent}%
                          </span>
                        )}
                        <span
                          className="text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${roadmap.color}12`, color: roadmap.color }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-black text-foreground text-base leading-tight">{am.module.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{am.module.description}</p>
                      {am.isOptional && am.optionalDescription && (
                         <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 relative group/hint transition-all hover:bg-primary/[0.15]">
                           <div className="absolute -top-2.5 left-3 bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                             Path Note
                           </div>
                           <p className="text-[11.5px] text-primary font-bold italic leading-relaxed flex items-start gap-2 pt-1">
                             <span className="text-base leading-none">💡</span>
                             {am.optionalDescription}
                           </p>
                         </div>
                      )}
                    </div>

                    {am.module.tags && (
                      <div className="flex flex-wrap gap-1">
                        {am.module.tags.split(",").slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md font-semibold border"
                            style={{ backgroundColor: `${roadmap.color}0c`, borderColor: `${roadmap.color}1a`, color: roadmap.color }}
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-2 space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{am.module._count.topics} topics</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{am.module.readTime} min</span>
                        </div>
                        <span className="font-bold text-[11px]" style={{ color: roadmap.color }}>
                          {am.module.completedCount}/{am.module._count.topics}
                        </span>
                      </div>

                      <Link href={`/modules/${am.module.id}?roadmapId=${roadmap.id}&stepId=${step.id}`} className="block">
                        <button
                          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border"
                          style={isCompleted
                            ? { backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.22)", color: "#16a34a" }
                            : { backgroundColor: roadmap.color, borderColor: "transparent", color: "#fff", boxShadow: `0 2px 10px ${roadmap.color}30` }
                          }
                        >
                          {isCompleted ? "✓ Review" : am.module.completedCount > 0 ? "Continue →" : "Start →"}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-2xl p-14 text-center bg-muted/20">
            <p className="text-muted-foreground text-sm">No modules match your search.</p>
          </div>
        )}

        {/* Prev / Next */}
        <div className="pt-6 border-t flex items-center justify-between gap-4">
          {prevStepId ? (
            <Link href={`/roadmap/${roadmap.id}/${prevStepId}`}>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold transition-all">
                <ArrowLeft className="h-4 w-4" /> Previous Step
              </button>
            </Link>
          ) : <div />}

          {nextStepId ? (
            <Link href={`/roadmap/${roadmap.id}/${nextStepId}`}>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-white"
                style={{ backgroundColor: roadmap.color, boxShadow: `0 2px 12px ${roadmap.color}35` }}
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}