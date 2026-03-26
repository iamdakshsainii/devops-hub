"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { marked } from "marked";
import hljs from "highlight.js";
import {
  FileText, Youtube, BookOpen,
  Download, Link as LinkIcon, ArrowLeft, ArrowRight,
  Menu, X, Map, ChevronDown, ChevronRight, ChevronLeft, Library, Heart, Twitter, Linkedin, Copy, Search, Bookmark, Check, Edit
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ResourceCard } from "@/components/resource-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Subtopic {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Topic {
  id: string;
  title: string;
  content: string | null;
  order: number;
  subtopics?: Subtopic[];
}

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  description: string | null;
  order: number;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  tags?: string;
  topics: Topic[];
  resources: Resource[];
  author?: { fullName?: string | null; avatarUrl?: string | null } | null;
}

interface PartialRoadmap {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

type ActiveView =
  | { kind: "topic"; topicId: string }
  | { kind: "subtopic"; topicId: string; subtopicId: string };

const resourceIcon = (type: string) => {
  switch (type) {
    case "VIDEO":
    case "YOUTUBE": return <Youtube className="h-4 w-4 text-red-500" />;
    case "PDF": return <Download className="h-4 w-4 text-orange-500" />;
    case "ARTICLE": return <BookOpen className="h-4 w-4 text-blue-500" />;
    default: return <LinkIcon className="h-4 w-4 text-primary" />;
  }
};

import { buildRenderer, isAsciiDiagram, parseMarkdown } from "@/lib/markdown";

function wireCopyButtons(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll<HTMLButtonElement>(".devhub-copy-btn").forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "true";

    btn.addEventListener("click", async () => {
      const text = decodeURIComponent(btn.dataset.code ?? "");

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text).catch(() => { });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand("copy"); } catch (_) { }
        document.body.removeChild(textArea);
      }

      btn.classList.add("copied");
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg><span class="text-[11px] text-emerald-500 font-bold ml-1">Copied!</span>`;

      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
      }, 2000);
    });
  });
}

const PROSE = [
  "devhub-prose",
  "prose prose-base md:prose-lg dark:prose-invert max-w-none",
  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-40",
  "prose-p:leading-relaxed prose-p:mb-5 prose-p:text-slate-600 dark:prose-p:text-zinc-400",
  "prose-ul:mb-5 prose-ol:mb-5 prose-li:mb-1.5",
  "prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:underline-offset-4",
  "prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl",
  "prose-img:rounded-2xl prose-img:border prose-img:shadow-xl",
  "prose-th:border prose-th:border-border/40 prose-th:px-3.5 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:tracking-wider prose-th:bg-muted/40",
  "prose-td:border prose-td:border-border/20 prose-td:px-3.5 prose-td:py-1.5 prose-td:text-sm prose-td:leading-normal",
  "[&_code]:before:content-none [&_code]:after:content-none",
  "[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:text-foreground [&_:not(pre)>code]:border",
  "[&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded",
  "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] [&_:not(pre)>code]:font-semibold",
  "prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-pre:shadow-none prose-pre:border-0 prose-pre:rounded-none",
].join(" ");

function buildNavSequence(topics: Topic[]): ActiveView[] {
  const seq: ActiveView[] = [];
  for (const topic of topics) {
    seq.push({ kind: "topic", topicId: topic.id });
  }
  return seq;
}

function viewKey(v: ActiveView): string {
  return v.kind === "topic" ? `t:${v.topicId}` : `s:${v.subtopicId}`;
}

export function StepViewer({
  roadmap,
  step,
  roadmapSteps = [],
  isStandalone = false,
  isBlog = false,
  dynamicResources = [],
}: {
  roadmap: any;
  step: Step;
  roadmapSteps?: any[];
  isStandalone?: boolean;
  isBlog?: boolean;
  dynamicResources?: any[];
}) {
  const router = useRouter();
  const [urlStepId, setUrlStepId] = useState<string | null>(null);

  const { data: session } = useSession();
  const isAdmin = session?.user && ["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role);

  const dedupedDynamicResources = useMemo(() => {
    const list: any[] = [];
    const seen = new Set();
    for (const r of (dynamicResources || [])) {
      if (r && r.id && !seen.has(r.id)) {
        seen.add(r.id);
        list.push(r);
      }
    }
    return list;
  }, [dynamicResources]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setUrlStepId(searchParams.get("stepId"));
    }
  }, []);

  const allStepTopicIds = useMemo(
    () => new Set<string>(step.topics.map((t) => t.id)),
    [step.id]
  );

  const getDefaultView = (): ActiveView => {
    const first = step.topics[0];
    if (!first) return { kind: "topic", topicId: "" };
    return { kind: "topic", topicId: first.id };
  };

  const [activeView, setActiveView] = useState<ActiveView>(getDefaultView);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`lastView_${step.id}`);
      if (saved) {
        try { setActiveView(JSON.parse(saved)); } catch (e) { }
      }
    }
  }, [step.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`lastView_${step.id}`, JSON.stringify(activeView));
    }
  }, [activeView, step.id]);

  const [viewMode, setViewMode] = useState<"PAGINATED" | "CONTINUOUS">("PAGINATED");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`viewMode_${step.id}`) as "PAGINATED" | "CONTINUOUS";
      if (saved) setViewMode(saved);
    }
  }, [step.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`viewMode_${step.id}`, viewMode);
    }
  }, [viewMode, step.id]);

  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(() => {
    const s = new Set<string>();
    step.topics.forEach(t => s.add(t.id));
    return s;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [localSearchOpen, setLocalSearchOpen] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const b = localStorage.getItem("my_bookmarks");
      if (b) setBookmarkedItems(JSON.parse(b));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setLocalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleBookmark = async (id: string, itemType: string = "TOPIC") => {
    const isBookmarked = bookmarkedItems.includes(id);
    const next = isBookmarked ? bookmarkedItems.filter(b => b !== id) : [...bookmarkedItems, id];
    setBookmarkedItems(next);
    localStorage.setItem("my_bookmarks", JSON.stringify(next));
    try {
      await fetch('/api/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, itemType })
      });
    } catch (e) { }
  };

  useEffect(() => {
    const lsKey = `completed_module_${step.id}`;
    const saved = localStorage.getItem(lsKey);
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        setCompletedItems(parsed.filter(id => allStepTopicIds.has(id)));
      } catch (e) { }
    }

    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const ids = data
          .map((d: any) => d.itemId)
          .filter((id: string) => allStepTopicIds.has(id));
        setCompletedItems(ids);
        localStorage.setItem(lsKey, JSON.stringify(ids));
      })
      .catch(() => { });
  }, [step.id]);

  const completedTopicsCount = step.topics.filter(t => completedItems.includes(t.id)).length;
  const totalTopicsCount = step.topics.length;
  const completionPercentage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  const toggleComplete = useCallback(async (topicId: string, topic: Topic) => {
    const isCompleted = completedItems.includes(topicId);
    const subtopicIds = topic.subtopics?.map(s => s.id) ?? [];
    const newItems = isCompleted ? completedItems.filter(id => id !== topicId) : [...completedItems, topicId];
    setCompletedItems(newItems);
    localStorage.setItem(`completed_module_${step.id}`, JSON.stringify(newItems));

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: topicId, itemType: "TOPIC", completed: !isCompleted, subtopicIds }),
      });
    } catch (e) { }

    if (!isCompleted) {
      const nowDone = step.topics.filter(t => t.id === topicId || newItems.includes(t.id)).length;
      if (nowDone === totalTopicsCount && totalTopicsCount > 0) {
        import('canvas-confetti').then(confetti => confetti.default());
      }
    }
  }, [completedItems, step.id, step.topics, totalTopicsCount]);

  const getTopicReadTime = (topic: any) => {
    let text = topic.content || "";
    topic.subtopics?.forEach((sub: any) => { text += " " + sub.content });
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const liked = localStorage.getItem(`liked_step_${step.id}`);
      setHasLiked(!!liked);
      setLikes(liked ? 1 : 0);
    }
  }, [step.id]);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(1);
      setHasLiked(true);
      localStorage.setItem(`liked_step_${step.id}`, "true");
    }
  };

  const navSequence = buildNavSequence(step.topics);
  const currentNavIndex = navSequence.findIndex((v) => viewKey(v) === viewKey(activeView));
  const activeTopic = step.topics.find((t) => t.id === activeView.topicId) ?? null;
  const activeSubtopic = activeView.kind === "subtopic" ? activeTopic?.subtopics?.find((s) => s.id === activeView.subtopicId) ?? null : null;

  const searchResults = useMemo(() => {
    if (!localSearch) return [];
    return step.topics.flatMap((topic, tIdx) => {
      const matches: any[] = [];
      const sTerm = localSearch.toLowerCase();
      
      if (topic.title.toLowerCase().includes(sTerm)) {
        matches.push({ kind: "topic", topicId: topic.id, title: topic.title, parentTitle: null });
      }
      
      if (topic.subtopics) {
        topic.subtopics.forEach(sub => {
          if (sub.title.toLowerCase().includes(sTerm) && sub.title.toLowerCase() !== topic.title.toLowerCase()) {
            matches.push({ 
              kind: "subtopic", 
              topicId: topic.id, 
              subId: sub.id, 
              title: sub.title, 
              parentTitle: topic.title 
            });
          }
        });
      }
      return matches;
    });
  }, [localSearch, step.topics]);

  useEffect(() => {
    const t = setTimeout(() => wireCopyButtons("devhub-content-area"), 200);
    return () => clearTimeout(t);
  }, [activeView, viewMode, step.topics]);

  const navigate = useCallback((view: ActiveView) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.add(view.topicId);
      return next;
    });
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSidebarOpen(false);
  }, []);

  const goToNav = useCallback((idx: number) => {
    if (idx >= 0 && idx < navSequence.length) navigate(navSequence[idx]);
  }, [navSequence, navigate]);

  const getNavLabel = (view: ActiveView): string => {
    const topic = step.topics.find((t) => t.id === view.topicId);
    return topic?.title ?? "";
  };

  const currentStepIndex = (roadmapSteps || []).findIndex((s) => s.id === step.id);
  const prevStep = currentStepIndex > 0 ? roadmapSteps[currentStepIndex - 1] : null;
  const nextStep = (roadmapSteps || []).length > currentStepIndex + 1 ? roadmapSteps[currentStepIndex + 1] : null;

  const themeColor = roadmap?.color || "#6366f1";
  const [shareUrl, setShareUrl] = useState("");
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(true);
  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className={`sticky ${isStandalone ? 'top-0' : 'top-16 lg:top-[76px]'} z-[110] bg-background/95 backdrop-blur border-b shadow-sm`}>
        {completionPercentage === 100 && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest py-1.5 px-4 text-center">
            ðŸ‰ mastery achieved! stay consistent.
          </div>
        )}
        <div className="flex items-center h-14 gap-4 px-6 overflow-visible text-sm transition-all duration-300 w-full relative">
          <button className="md:hidden p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shrink-0 transition-all active:scale-95" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-3 shrink-0">
            <button className="hidden md:flex p-2 rounded-xl hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground transition-all" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
              {!isStandalone ? (
                <>
                  <Link href="/roadmap" className="text-muted-foreground/60 hover:text-foreground transition-colors">Roadmaps</Link>
                  <span className="text-muted-foreground/20 font-light mx-1">/</span>
                  <Link href={`/roadmap/${roadmap.id}`} className="text-muted-foreground/60 hover:text-foreground truncate max-w-[120px] transition-colors">{roadmap.title}</Link>
                </>
              ) : (
                <Link href="/modules" className="text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1.5"><Library className="h-4 w-4" /> Modules</Link>
              )}
              <span className="text-muted-foreground/20 font-light mx-1">/</span>
              <span className="truncate max-w-[150px] md:max-w-xs transition-all" style={{ color: themeColor }}>{step.title}</span>
              {activeTopic && (
                <>
                  <span className="text-muted-foreground/30 font-light mx-1">/</span>
                  <span className="text-slate-700 dark:text-zinc-100 font-extrabold truncate max-w-[200px]">{activeTopic.title}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[300px] flex items-center justify-end gap-3 ml-auto overflow-visible h-14">
            <div className="flex items-center gap-3 w-full justify-end overflow-visible">
              <div className="relative group max-w-sm w-full hidden sm:block">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={localSearch || ""}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={() => setLocalSearchOpen(true)}
                  onBlur={() => setTimeout(() => setLocalSearchOpen(false), 200)}
                  className="h-9 w-full pl-10 pr-4 rounded-xl bg-muted/30 dark:bg-muted/60 border border-border/20 dark:border-border/40 focus:border-primary/40 text-[13px] focus:ring-4 focus:ring-primary/5 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-sm"
                />

                {localSearchOpen && localSearch && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-border/40 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
                    <div className="p-1 space-y-0.5">
                      {searchResults.slice(0, 6).map((item, idx) => (
                        <button key={idx} onClick={() => { 
                          setLocalSearch(""); 
                          
                          if (viewMode === "CONTINUOUS") {
                            const elId = item.kind === "subtopic" ? `subtopic-${item.subId}` : `topic-${item.topicId}`;
                            const el = document.getElementById(elId);
                            if (el) {
                              const y = el.getBoundingClientRect().top + window.scrollY - 100;
                              window.scrollTo({ top: y, behavior: 'smooth' });
                            }
                          } else {
                            if (activeView.topicId !== item.topicId) navigate({ kind: "topic", topicId: item.topicId });
                            
                            if (item.kind === "subtopic") {
                               setTimeout(() => {
                                 const el = document.getElementById(`subtopic-${item.subId}`);
                                 if (el) {
                                    const y = el.getBoundingClientRect().top + window.scrollY - 100;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                 }
                               }, 150);
                            }
                          }
                        }} className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] hover:bg-primary/5 dark:hover:bg-primary/10 transition-all flex flex-col items-start gap-1 font-semibold tracking-tight">
                          <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${item.kind === 'subtopic' ? 'bg-muted-foreground/40' : 'bg-primary/50'}`} /> {item.title}</span>
                          {item.parentTitle && <span className="text-[10px] text-muted-foreground ml-3.5 uppercase tracking-wider">{item.parentTitle}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeTopic && (
                <button onClick={() => toggleBookmark(activeTopic.id)} className={`p-2.5 rounded-xl border transition-all shrink-0 ${bookmarkedItems.includes(activeTopic.id) ? "bg-primary/10 border-primary/30 text-primary shadow-sm ring-1 ring-primary/20" : "bg-muted/20 border-border/10 text-muted-foreground/40 hover:text-foreground"}`}>
                  <Bookmark className={`h-4 w-4 ${bookmarkedItems.includes(activeTopic.id) ? "fill-current" : ""}`} />
                </button>
              )}

              {!isBlog && (
                <div className="flex !bg-slate-100/95 dark:!bg-zinc-900/90 p-1.5 rounded-2xl items-center gap-1.5 h-11 ring-1 ring-inset ring-slate-200/40 dark:ring-border/5 transition-all duration-300 shadow-sm border border-border/10">
                  <button onClick={() => setViewMode("PAGINATED")} className={`px-5 h-full rounded-xl text-[12px] font-black transition-all ${viewMode === "PAGINATED" ? "bg-blue-600 dark:bg-zinc-800 text-white dark:text-white shadow-lg ring-1 ring-blue-500/10 dark:ring-black/5" : "text-slate-500 dark:text-muted-foreground/40 hover:text-blue-600 dark:hover:text-foreground"}`}>Step-by-Step</button>
                  <button onClick={() => setViewMode("CONTINUOUS")} className={`px-5 h-full rounded-xl text-[12px] font-black transition-all ${viewMode === "CONTINUOUS" ? "bg-blue-600 dark:bg-zinc-800 text-white dark:text-white shadow-lg ring-1 ring-blue-500/10 dark:ring-black/5" : "text-slate-500 dark:text-muted-foreground/40 hover:text-blue-600 dark:hover:text-foreground"}`}>Continuous</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative h-[5px] w-full bg-muted/20">
          <div className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-700" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      <div className="flex flex-1 relative w-full px-4 md:px-6 font-sans">
        {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] md:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed md:sticky ${isStandalone ? 'top-14 md:top-20' : 'top-[120px] md:top-32'} left-0 z-[150] md:z-10 bg-background md:bg-transparent border-r md:border-r-0 transform transition-transform md:transform-none shadow-2xl md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${isSidebarCollapsed ? "md:w-0 md:opacity-0 md:pointer-events-none md:p-0" : "w-72 md:w-72 lg:w-80 px-4 py-8"} shrink-0 transition-all duration-300 h-[calc(100vh-120px)] md:h-auto overflow-y-auto`}>
          <div className={isSidebarCollapsed ? "hidden" : "block"}>
            <div className="mb-8 pb-6 border-b">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0" style={{ backgroundColor: themeColor }}>{step.icon}</div>
                <div><h2 className="font-extrabold text-lg leading-tight">{step.title}</h2><p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Module {step.order + 1}</p></div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
            
            <div className="flex items-center gap-2 mb-5 px-4">
               <div className="h-3.5 w-[3px] rounded-full bg-primary/80" />
               <p className="text-[13px] font-black uppercase tracking-[0.1em] text-slate-800 dark:text-zinc-200">Table of Contents</p>
            </div>
            <nav className="space-y-2">
              {step.topics.map((topic, i) => {
                const isActiveTopic = activeView.topicId === topic.id;
                return (
                  <div key={topic.id} className="space-y-1">
                    <button
                      onClick={() => {
                        if (viewMode === "CONTINUOUS") {
                          const el = document.getElementById(`topic-${topic.id}`);
                          if (el) {
                            const y = el.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        } else {
                          navigate({ kind: "topic", topicId: topic.id });
                        }
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 text-base md:text-[17px] text-left rounded-2xl transition-all duration-300 group ${isActiveTopic ? "bg-primary/10 text-primary font-black shadow-sm ring-1 ring-inset ring-primary/20 backdrop-blur-sm" : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-foreground font-bold hover:translate-x-1"}`}
                    >
                      <span className={`w-8 h-8 flex items-center justify-center text-[13px] font-black shrink-0 rounded-xl transition-all duration-300 shadow-sm ${isActiveTopic ? "bg-primary text-primary-foreground shadow-md scale-105" : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 group-hover:border-primary/30 group-hover:text-primary group-hover:bg-primary/10"}`}>
                        {completedItems.includes(topic.id) ? <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 stroke-[4px]" /> : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 leading-snug tracking-tight">{topic.title}</span>
                    </button>

                    {/* Subtopics sidebar list */}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className={`ml-8 pl-6 border-l-2 border-slate-200 dark:border-zinc-800 space-y-1 overflow-hidden transition-all duration-500 ${(isActiveTopic || viewMode === "CONTINUOUS") ? "max-h-[1000px] opacity-100 py-2.5" : "max-h-0 opacity-0 py-0"}`}>
                        {topic.subtopics.sort((a, b) => a.order - b.order).map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (viewMode === "CONTINUOUS") {
                                const el = document.getElementById(`subtopic-${sub.id}`);
                                if (el) {
                                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                                  window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                              } else {
                                if (!isActiveTopic) navigate({ kind: "topic", topicId: topic.id });
                                setTimeout(() => {
                                  const el = document.getElementById(`subtopic-${sub.id}`);
                                  if (el) {
                                    const y = el.getBoundingClientRect().top + window.scrollY - 100;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                  }
                                }, 100);
                              }
                            }}
                            className="w-full text-left py-2.5 px-4 text-[14px] md:text-[15px] text-slate-600 dark:text-zinc-400 hover:text-primary transition-all rounded-xl hover:bg-primary/5 flex items-center gap-3.5 font-semibold group/sub"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 group-hover/sub:bg-primary group-hover/sub:scale-150 transition-all shrink-0" />
                            <span className="truncate">{sub.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className={`flex-1 min-w-0 px-4 ${isSidebarCollapsed ? "md:px-16" : "md:px-10"} py-4 md:py-6 ${isSidebarCollapsed ? "" : "md:border-l"} transition-all duration-300`}>
          {activeTopic ? (
            <article id="devhub-content-area" className="w-full max-w-none">
              <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                <div className="flex-1 min-w-0 max-w-4xl">
                  {/* Removed redundant header row to avoid gap */}

                  {viewMode === "CONTINUOUS" ? (
                    <div className="space-y-16">
                      {step.topics.map((topic, topicIdx) => (
                        <div key={topic.id} id={`topic-${topic.id}`} className="scroll-mt-40 pt-8 border-t first:pt-0 first:border-0 border-border/40">
                          <div className="flex items-center gap-3 mb-8 pb-4 border-b">
                            <Checkbox checked={completedItems.includes(topic.id)} onCheckedChange={() => toggleComplete(topic.id, topic)} className="h-5 w-5 border-muted-foreground/40 rounded-md shrink-0 shadow-sm" />
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight flex items-center gap-3 !text-slate-950 dark:!text-zinc-100">
                              <span className="text-muted-foreground/20 font-mono text-base md:text-lg">{String(topicIdx + 1).padStart(2, "0")}</span>
                              {topic.title}
                            </h2>
                          </div>
                          {topic.content && <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(topic.content) }} />}

                          {/* Render Subtopics in Continuous Mode with De-duplicacy */}
                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <div className="space-y-16 mt-8">
                              {topic.subtopics.sort((a, b) => a.order - b.order).map((sub) => (
                                <section key={sub.id} id={`subtopic-${sub.id}`} className="scroll-mt-40 pl-0 transition-colors group">
                                  {sub.title.trim().toLowerCase() !== topic.title.trim().toLowerCase() && (
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-6 !text-slate-950 dark:!text-zinc-100 group-hover:text-primary transition-colors">{sub.title}</h3>
                                  )}
                                  <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(sub.content) }} />
                                </section>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b">
                        <Checkbox checked={completedItems.includes(activeTopic.id)} onCheckedChange={() => toggleComplete(activeTopic.id, activeTopic)} className="h-5 w-5 border-muted-foreground/40 rounded-md shrink-0 shadow-sm" />
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight !text-slate-950 dark:!text-zinc-100" suppressHydrationWarning>
                          {activeTopic.title}
                        </h1>
                      </div>

                      {activeTopic.content && <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(activeTopic.content) }} />}

                      {/* Render Subtopics in main area with De-duplicacy and NO left line */}
                      {activeTopic.subtopics && activeTopic.subtopics.length > 0 && (
                        <div className="space-y-16 mt-8">
                          {activeTopic.subtopics.sort((a, b) => a.order - b.order).map((sub) => (
                            <section key={sub.id} id={`subtopic-${sub.id}`} className="scroll-mt-40 pl-0 transition-colors group">
                              {sub.title.trim().toLowerCase() !== activeTopic.title.trim().toLowerCase() && (
                                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-6 !text-slate-950 dark:!text-zinc-100 group-hover:text-primary transition-colors">{sub.title}</h3>
                              )}
                              <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(sub.content) }} />
                            </section>
                          ))}
                        </div>
                      )}
                    </div>
                  )}


                  <div className="mt-16 pt-10 border-t flex gap-6 border-border/40">
                    {currentNavIndex > 0 && (
                      <button onClick={() => goToNav(currentNavIndex - 1)} className="flex-1 flex flex-col items-start gap-1 p-5 border border-border/40 rounded-3xl hover:bg-muted/40 hover:border-primary/20 transition-all text-left group shadow-sm">
                        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold"><ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Previous</span>
                        <p className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">{getNavLabel(navSequence[currentNavIndex - 1])}</p>
                      </button>
                    )}
                    {currentNavIndex < navSequence.length - 1 && (
                      <button onClick={() => goToNav(currentNavIndex + 1)} className="flex-1 flex flex-col items-end gap-1 p-5 border border-border/40 rounded-3xl hover:bg-muted/40 hover:border-primary/20 transition-all text-right group shadow-sm">
                        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Next <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></span>
                        <p className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">{getNavLabel(navSequence[currentNavIndex + 1])}</p>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Restored */}
                <div className="hidden lg:block w-72 lg:w-80 shrink-0 sticky top-28 h-fit animate-in fade-in-50 duration-300 space-y-5 lg:pt-[142px]">
                  {(() => {
                    const allResources = [
                      ...step.resources,
                      ...(dynamicResources || []).map((r: any) => ({
                        id: r.id,
                        title: r.title,
                        url: r.url,
                        type: r.type,
                        description: r.description
                      }))
                    ];

                    const dedupedResources: any[] = [];
                    const seenKeys = new Set();
                    for (const r of allResources) {
                      if (r) {
                        const key = r.url || r.title || r.id;
                        if (key && !seenKeys.has(key)) {
                          seenKeys.add(key);
                          dedupedResources.push(r);
                        }
                      }
                    }

                    if (dedupedResources.length === 0) return null;

                    return (
                      <div className="space-y-3">
                        <div className="mb-4">
                          <button
                            onClick={() => setIsResourcesExpanded(!isResourcesExpanded)}
                            className="flex w-full items-center justify-between text-sm font-black uppercase tracking-wider text-muted-foreground/80 px-2 hover:text-foreground transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Recommended
                            </div>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${isResourcesExpanded ? "rotate-0" : "-rotate-90"}`} />
                          </button>
                          <p className="text-[11px] text-muted-foreground/60 mt-1 px-2 font-medium tracking-wide">Handpicked videos, docs & articles.</p>
                        </div>

                        {isResourcesExpanded && (
                          <div className="space-y-2.5 animate-in fade-in-30 slide-in-from-top-1 duration-200">
                            {dedupedResources.map((resource: any) => (
                              <a
                                key={resource.id}
                                href={resource.url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="flex flex-col gap-2 p-3.5 border border-border/10 rounded-2xl hover:bg-primary/5 hover:border-primary/20 bg-card/10 backdrop-blur-md transition-all group shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:shadow-primary/5"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105 shrink-0">
                                    {resourceIcon(resource.type || "LINK")}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{resource.title}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize font-semibold">{(resource.type || "link").toLowerCase()}</p>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Disclaimer / Updates Note */}
                  <div className="p-5 mt-6 bg-slate-50 dark:bg-zinc-900/40 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 text-[13.5px] text-slate-600 dark:text-zinc-400 leading-relaxed flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex flex-col items-center gap-2.5 shrink-0 relative z-10">
                      {step.author?.avatarUrl ? (
                        <img
                          src={step.author.avatarUrl}
                          alt={step.author.fullName || "Admin"}
                          className="w-11 h-11 rounded-full border-2 border-background shadow-md object-cover bg-muted/20"
                        />
                      ) : (
                        <img
                          src="https://api.dicebear.com/7.x/miniavs/svg?seed=Admin"
                          className="w-11 h-11 rounded-full border-2 border-background shadow-md object-cover bg-muted/20"
                          alt="Admin"
                        />
                      )}
                      <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md tracking-wider">Admin</span>
                    </div>
                    <div className="flex-1 space-y-2.5 relative z-10">
                      <p className="font-black text-foreground text-[15px] flex items-center gap-2">
                        <span className="text-xl">👋</span> Welcome to the Module!
                      </p>
                      <p className="tracking-tight">
                        All content here is handpicked and intelligently structured to give you the best possible clarity. I am continuously refining these materials to make them simpler and more practical.
                      </p>
                      <p className="pt-3 border-t border-border/40 font-semibold text-slate-700 dark:text-zinc-300 tracking-tight">
                        My ultimate goal is to provide <span className="text-primary font-bold">high-quality, reliable building blocks</span> for your engineering career.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center text-muted-foreground opacity-50">
              <Map className="h-16 w-16 mb-4" />
              <h2 className="text-xl font-bold">Select a Topic to begin</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
