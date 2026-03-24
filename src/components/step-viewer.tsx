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

// ── Types ──────────────────────────────────────────────────────────────────

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

// Active view
type ActiveView =
  | { kind: "topic"; topicId: string }
  | { kind: "subtopic"; topicId: string; subtopicId: string };

// ── Resource icon helper ───────────────────────────────────────────────────

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


// ── Copy button wiring ────────────────────────────────────────────────────

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

// ── Shared prose class ────────────────────────────────────────────────────

const PROSE = [
  "devhub-prose",
  "prose prose-base md:prose-lg dark:prose-invert max-w-none",
  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24",
  "prose-p:leading-relaxed prose-p:mb-5",
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

// ── Build flat nav sequence ───────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────

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

  // De-duplicate dynamic resources at the source to prevent tag math triggers duplication
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
  // Stabilised with useMemo so the set reference doesn't change on every render
  const allStepTopicIds = useMemo(
    () => new Set<string>(step.topics.map((t) => t.id)),
    // step.topics is stable (comes from props) — this only recalculates if the step changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step.id]
  );

  const getDefaultView = (): ActiveView => {
    const first = step.topics[0];
    if (!first) return { kind: "topic", topicId: "" };
    if (!first.content && first.subtopics && first.subtopics.length > 0) {
      return { kind: "subtopic", topicId: first.id, subtopicId: first.subtopics[0].id };
    }
    return { kind: "topic", topicId: first.id };
  };

  const [activeView, setActiveView] = useState<ActiveView>(getDefaultView);

  // Persist last active view per step
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

  // Persist view mode
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

  // FIX: completedItems stores only IDs belonging to THIS step
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

  // ── Progress: server is the single source of truth ─────────────────────
  // localStorage is only used as a write-through cache for optimistic updates
  // (so the checkbox feels instant). On every load, DB always wins — this
  // means any device/browser shows the correct progress after login.
  useEffect(() => {
    const lsKey = `completed_module_${step.id}`;

    // Show localStorage instantly to avoid flash on same device (best-effort)
    // A different device will have empty localStorage and show 0% briefly —
    // that's fine, the fetch below corrects it within ~1 network round-trip.
    const saved = localStorage.getItem(lsKey);
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        setCompletedItems(parsed.filter(id => allStepTopicIds.has(id)));
      } catch (e) { }
    }

    // Always fetch from DB — authoritative source across all devices
    fetch('/api/progress')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) return; // unexpected shape — keep localStorage state

        const ids = data
          .map((d: any) => d.itemId)
          .filter((id: string) => allStepTopicIds.has(id));

        // Trust the DB response (even empty array = zero progress is valid).
        // Only a network/auth error (caught below) keeps localStorage state intact.
        setCompletedItems(ids);
        localStorage.setItem(lsKey, JSON.stringify(ids));
      })
      .catch(() => {
        // Network or auth error — keep whatever localStorage had, don't wipe state
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // ── Progress counts ─────────────────────────────────────────────────────
  // Count completed topics (parent level only) for the progress bar
  const completedTopicsCount = step.topics.filter(t => completedItems.includes(t.id)).length;
  const totalTopicsCount = step.topics.length;
  // FIX: guard against divide-by-zero
  const completionPercentage = totalTopicsCount > 0
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
    : 0;

  // ── Toggle complete ─────────────────────────────────────────────────────
  // Topic-only toggle: checking a topic marks it + ALL its subtopics complete.
  // Subtopics have no individual checkboxes — they always follow the parent.
  const toggleComplete = useCallback(async (topicId: string, topic: Topic) => {
    const isCompleted = completedItems.includes(topicId);
    const subtopicIds = topic.subtopics?.map(s => s.id) ?? [];

    // completedItems tracks topic IDs only (subtopics stored in DB but not in local state)
    const newItems = isCompleted
      ? completedItems.filter(id => id !== topicId)
      : [...completedItems, topicId];

    setCompletedItems(newItems);
    localStorage.setItem(`completed_module_${step.id}`, JSON.stringify(newItems));

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: topicId, itemType: "TOPIC", completed: !isCompleted, subtopicIds }),
      });
    } catch (e) { }

    // Confetti only when marking complete and ALL topics now done
    if (!isCompleted) {
      const nowDone = step.topics.filter(t => t.id === topicId || newItems.includes(t.id)).length;
      if (nowDone === totalTopicsCount && totalTopicsCount > 0) {
        import('canvas-confetti').then(confetti => confetti.default());
      }
    }
  }, [completedItems, step.id, step.topics, totalTopicsCount]);

  const getReadTime = (content: string | null) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

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
  const activeSubtopic =
    activeView.kind === "subtopic"
      ? activeTopic?.subtopics?.find((s) => s.id === activeView.subtopicId) ?? null
      : null;

  const searchResults = useMemo(() => {
    if (!localSearch) return [];

    return step.topics.flatMap((topic, tIdx) => {
      const matches: { kind: "topic" | "subtopic"; topicId: string; subtopicId?: string; title: string; topicLabel: string }[] = [];
      const sTerm = localSearch.toLowerCase();

      const tTitle = topic.title.toLowerCase();

      if (tTitle.includes(sTerm)) {
        matches.push({ kind: "topic", topicId: topic.id, title: topic.title, topicLabel: `Topic ${tIdx + 1}` });
      }

      topic.subtopics?.forEach((sub) => {
        const sTitle = sub.title.toLowerCase();

        if (sTitle.includes(sTerm)) {
          matches.push({ kind: "subtopic", topicId: topic.id, subtopicId: sub.id, title: sub.title, topicLabel: topic.title });
        }
      });
      return matches;
    });
  }, [localSearch, step.topics]);

  useEffect(() => {
    const t = setTimeout(() => wireCopyButtons("devhub-content-area"), 150);
    return () => clearTimeout(t);
  }, [activeView]);

  const navigate = useCallback((view: ActiveView) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.add(view.topicId);
      return next;
    });

    if (viewMode === "CONTINUOUS" && view.kind === "subtopic") {
      setTimeout(() => {
        const anchor = document.getElementById(`subtopic-${view.subtopicId}`);
        if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } else {
      setActiveView(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSidebarOpen(false);
  }, [viewMode]);

  const toggleTopicExpand = useCallback((topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const goToNav = useCallback((idx: number) => {
    if (idx >= 0 && idx < navSequence.length) navigate(navSequence[idx]);
  }, [navSequence, navigate]);

  const getNavLabel = (view: ActiveView): string => {
    const topic = step.topics.find((t) => t.id === view.topicId);
    if (!topic) return "";
    if (view.kind === "topic") return topic.title;
    const sub = topic.subtopics?.find((s) => s.id === view.subtopicId);
    return sub?.title ?? "";
  };

  const currentStepIndex = roadmapSteps.findIndex((s) => s.id === step.id);
  const prevStep = currentStepIndex > 0 ? roadmapSteps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < roadmapSteps.length - 1 ? roadmapSteps[currentStepIndex + 1] : null;

  const themeColor = roadmap?.color || "#6366f1";
  const [shareUrl, setShareUrl] = useState("");
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(true);
  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Breadcrumb + Progress Bar ───────────────────────────────────────
          FIX: progress bar is a SIBLING of the breadcrumb row (not a child),
          using position:absolute relative to the sticky wrapper so it
          sits flush at the very bottom edge of the nav strip, fully visible.
      */}
      <div className={`sticky ${isStandalone ? 'top-0' : 'top-16'} z-40 bg-background/95 backdrop-blur border-b shadow-sm`}>


        {completionPercentage === 100 && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 text-xs font-bold py-1.5 px-4 text-center">
            🎉 Awesome! You've mastered all topics in this step. Keep the momentum going!
          </div>
        )}

        {/* Breadcrumb row */}
        <div className="flex items-center h-14 gap-2 px-4 overflow-x-auto whitespace-nowrap scrollbar-hide text-sm transition-all duration-300 w-full">
          <button className="md:hidden p-1.5 rounded-md hover:bg-muted shrink-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Collapse Toggle */}
          <button className="hidden md:flex p-1.5 rounded-md hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <Menu className="h-4 w-4" />
          </button>

          {isSidebarCollapsed && <span className="text-muted-foreground/30 ml-1 hidden md:inline">|</span>}

          {!isStandalone ? (
            <>
              <Link href="/roadmap" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0 font-medium">
                <Map className="h-4 w-4" /> All Roadmaps
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <Link href={`/roadmap/${roadmap.id}`} className="text-muted-foreground hover:text-foreground truncate max-w-[130px] md:max-w-xs transition-colors font-medium">
                {roadmap.title}
              </Link>
            </>
          ) : (
            <Link href="/modules" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0 font-medium">
              <Library className="h-4 w-4" /> All Modules
            </Link>
          )}

          <span className="text-muted-foreground/40">/</span>
          <span className="font-bold shrink-0" style={{ color: themeColor }}>
            {step.icon} {step.title}
          </span>

          {isAdmin && (
             <Link href={`/admin/modules?search=${encodeURIComponent(step.title)}`} className="shrink-0">
                 <Button variant="outline" size="sm" className="h-7 text-[10px] items-center font-bold px-2 gap-1 hover:bg-muted border-border/40">
                     <Edit className="h-3 w-3" /> Edit Mode
                 </Button>
             </Link>
          )}

          {activeTopic && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground/70 font-medium truncate cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate({ kind: "topic", topicId: activeTopic.id })}>
                {activeTopic.title}
              </span>
            </>
          )}
          {activeSubtopic && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground font-medium truncate">{activeSubtopic.title}</span>
            </>
          )}
        </div>

        {/* FIX: Progress bar — sibling of breadcrumb row, sits at bottom of sticky wrapper */}
        <div className="relative h-[5px] w-full bg-muted/40">
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 relative w-full px-4 md:px-6">

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-32 left-0 z-40 md:z-auto
          bg-background md:bg-transparent border-r md:border-r-0
          transform transition-transform md:transform-none shadow-2xl md:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          
          ${isSidebarCollapsed ? "md:w-0 md:opacity-0 md:pointer-events-none md:p-0 md:m-0" : "w-72 md:w-72 lg:w-80 px-4 py-8"}
          shrink-0 transition-all duration-300 ease-in-out
        `}>
          <div className={isSidebarCollapsed ? "hidden" : "block"}>
            {/* Sidebar actions: Back and Collapse */}
            <div className="flex items-center justify-end mb-4 mt-1 border-b pb-2.5">
              <button 
                title="Collapse Sidebar"
                className="hidden md:flex p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                onClick={() => setIsSidebarCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

          <div className="mb-8 pb-6 border-b">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0" style={{ backgroundColor: themeColor }}>{step.icon}</div>
              <div>
                <h2 className="font-extrabold text-lg leading-tight">{step.title}</h2>
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Module {step.order + 1}</p>
                {step.tags && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {step.tags.split(",").filter(Boolean).map((t: string) => (
                      <span key={t} className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 px-2">Table of Contents</p>
          <nav className="space-y-1">
            {step.topics.map((topic, i) => {
              const isTopicActive = activeView.topicId === topic.id;
              const isExpanded = expandedTopics.has(topic.id);
              const isActive = isTopicActive && (activeView.kind === "topic" || activeView.kind === "subtopic");

              const subtopicMatches = (topic.content || "").match(/^###\s+(.*)$/gm) || [];
              const subtopics = subtopicMatches.map(m => m.replace(/^###\s+/, '').trim());
              const hasAnchors = subtopics.length > 0;

              return (
                <div key={topic.id} className={`rounded-xl transition-all ${isActive ? "bg-primary/5 border border-primary/10 mb-2 p-1" : "border border-transparent"}`}>
                  <div className="flex items-center gap-1 group">
                    <button onClick={() => navigate({ kind: "topic", topicId: topic.id })}
                      className={`flex-1 flex items-start gap-3 px-3 py-2 text-sm text-left transition-all rounded-lg ${isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${isActive ? "text-primary/70" : "text-muted-foreground/40"}`}>
                        {completedItems.includes(topic.id)
                          ? <Check className="h-3 w-3 text-emerald-500 font-bold" />
                          : String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-1">
                        <span className="leading-snug break-words">{topic.title}</span>
                        <span className="text-[9px] text-muted-foreground/60 font-medium shrink-0 mt-0.5">{hasAnchors ? "" : getTopicReadTime(topic) + "m"}</span>
                      </div>
                    </button>

                    {hasAnchors && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTopics(prev => {
                            const n = new Set(prev);
                            if (n.has(topic.id)) n.delete(topic.id); else n.add(topic.id);
                            return n;
                          });
                        }}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground/40 hover:text-foreground mr-2 group/chevron transition-colors"
                      >
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90 text-foreground" : "rotate-0"}`} />
                      </button>
                    )}
                  </div>

                  {isExpanded && hasAnchors && (
                    <div className="ml-5 pl-3 mt-1 mb-1 border-l-2 border-primary/20 flex flex-col gap-0.5">
                      {(() => {
                        return subtopics.map((subtitle, idx) => {
                          const slug = subtitle.toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-')
                            .trim();

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                const el = document.getElementById(slug);
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="text-xs text-left py-1.5 px-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all flex items-center gap-1.5"
                            >
                              <div className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                              <span className="truncate">{subtitle}</span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 min-w-0 px-4 ${isSidebarCollapsed ? "md:px-16" : "md:px-10"} py-8 lg:py-12 ${isSidebarCollapsed ? "" : "md:border-l"} transition-all duration-300`}>
          {(activeTopic || activeSubtopic) ? (
            <article id="devhub-content-area" className="w-full max-w-none">
              <div className="flex flex-col lg:flex-row gap-14 items-start w-full justify-start">
                <div className="flex-1 min-w-0 max-w-4xl">
                  <header className="mb-10 pb-8 border-b space-y-4">
                    <div className="flex flex-wrap items-center justify-start gap-3">
                        {/* Expand Sidebar for Desktop */}

                  {/* Expand Sidebar for Desktop */}
                  {isSidebarCollapsed && (
                    <button 
                      onClick={() => setIsSidebarCollapsed(false)}
                      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-sm"
                    >
                      <ChevronRight className="h-3.5 w-3.5" /> Table of Contents
                    </button>
                  )}

                  {/* Local search + Bookmark grouped */}
                  <div className="flex items-center gap-2 flex-1 max-w-lg">
                    <div className="relative flex-1">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search subtopics / content..."
                        value={localSearch || ""}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onFocus={() => setLocalSearchOpen(true)}
                        onBlur={() => setTimeout(() => setLocalSearchOpen(false), 200)}
                        className="pl-8 pr-3 py-1.5 rounded-lg bg-muted/50 border text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-background transition-all"
                      />

                      {localSearchOpen && localSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover/95 backdrop-blur-xl border rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                          <div className="p-1.5 space-y-0.5">
                            {searchResults.length > 0 ? (
                              searchResults.map((item, idx) => (
                                <button
                                  key={`${item.topicId}-${item.subtopicId || idx}`}
                                  onClick={() => {
                                    setLocalSearch("");
                                    if (viewMode === "CONTINUOUS") {
                                      const el = document.getElementById(item.subtopicId ? `subtopic-${item.subtopicId}` : `topic-${item.topicId}`);
                                      el?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                      if (item.kind === "subtopic") {
                                        navigate({ kind: "subtopic", topicId: item.topicId, subtopicId: item.subtopicId! });
                                      } else {
                                        navigate({ kind: "topic", topicId: item.topicId });
                                      }
                                    }
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-0.5 group"
                                >
                                  <span className="truncate font-medium flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary shrink-0" />
                                    {item.title}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <p className="p-3 text-[11px] text-muted-foreground text-center">No matching results found</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bookmark Button sits immediately after search bar */}
                    {activeTopic && (
                      <button
                        title="Bookmark this topic"
                        onClick={() => toggleBookmark(activeTopic.id)}
                        className={`p-1.5 rounded-lg border transition-all shrink-0 ${bookmarkedItems.includes(activeTopic.id)
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"
                          }`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* View mode toggle */}
                  <div className="flex items-center gap-2">
                    {!isBlog && (
                      <div className="flex bg-muted p-1 rounded-lg w-fit gap-1 text-[11px] font-bold border shadow-sm h-[32px] items-center">
                        <button
                          onClick={() => setViewMode("PAGINATED")}
                          className={`px-3 py-1.5 rounded-md transition-all h-full flex items-center ${viewMode === "PAGINATED" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Step-by-Step
                        </button>
                        <button
                          onClick={() => setViewMode("CONTINUOUS")}
                          className={`px-3 py-1.5 rounded-md transition-all h-full flex items-center ${viewMode === "CONTINUOUS" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Continuous
                        </button>
                      </div>
                    )}

                    {isAdmin && (
                      <Link href={`/admin/modules?search=${encodeURIComponent(step.title)}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-[32px] gap-1.5 border-amber-500/20 text-amber-500 font-bold text-xs hover:bg-amber-500/5 hover:text-amber-600 rounded-lg">
                           <Edit className="h-3.5 w-3.5" /> Edit Module
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* ── Heading Row ── */}
                <div className="flex items-center gap-3 mt-8">
                  {/* Checkbox to toggle completion */}
                  {activeTopic && (
                    <Checkbox
                      id="mark-read-checkbox"
                      checked={completedItems.includes(activeTopic.id)}
                      onCheckedChange={() => toggleComplete(activeTopic.id, activeTopic)}
                      title={completedItems.includes(activeTopic.id) ? "Mark completed" : "Mark as read"}
                      className="h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-muted-foreground/40 rounded-md transition-colors cursor-pointer shrink-0"
                    />
                  )}

                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-foreground/95">
                    {activeView.kind === "subtopic" && activeSubtopic && viewMode === "PAGINATED"
                      ? activeSubtopic.title
                      : activeTopic?.title}
                  </h1>
                </div>
              </header>

              {viewMode === "CONTINUOUS" ? (
                <div className="space-y-16">
                  {step.topics.map((topic, topicIdx) => (
                    <div key={topic.id} id={`topic-${topic.id}`} className="scroll-mt-24 pt-10 border-t first:pt-0 first:border-0">
                      <div className="mb-6">
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: themeColor }}>
                          <span className="text-muted-foreground/30 font-mono text-sm">{String(topicIdx + 1).padStart(2, "0")}</span>
                          {topic.title}
                        </h2>
                        {topic.content && <div className={`${PROSE} mt-4`} dangerouslySetInnerHTML={{ __html: parseMarkdown(topic.content) }} />}
                      </div>

                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="space-y-12 pl-6 border-l-2">
                          {topic.subtopics.map((sub) => (
                            <div key={sub.id} id={`subtopic-${sub.id}`} className="scroll-mt-24">
                              <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">{sub.title}</h3>
                              <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(sub.content) }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              ) : activeView.kind === "subtopic" && activeSubtopic ? (
                <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(activeSubtopic.content) }} />
              ) : activeTopic ? (
                <>
                  {activeTopic.content && <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(activeTopic.content) }} />}
                  {activeTopic.subtopics && activeTopic.subtopics.length > 0 && (
                    <div className={`${activeTopic.content ? "mt-12 pt-8 border-t" : ""} space-y-3`}>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {activeTopic.subtopics.map((sub, idx) => (
                          <button key={sub.id} onClick={() => navigate({ kind: "subtopic", topicId: activeTopic.id, subtopicId: sub.id })}
                            className="group flex items-center gap-4 p-4 border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                          >
                            <span className="text-lg font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors font-mono shrink-0">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{sub.title}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              {/* Prev / Next navigation */}
              <div className="mt-12 pt-8 border-t flex gap-4">
                {currentNavIndex > 0 ? (
                  <button onClick={() => goToNav(currentNavIndex - 1)} className="flex-1 flex flex-col items-start gap-1 p-4 border rounded-2xl hover:bg-muted hover:border-foreground/30 transition-all text-left group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Previous
                    </span>
                    <p className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2">{getNavLabel(navSequence[currentNavIndex - 1])}</p>
                  </button>
                ) : !isStandalone && prevStep ? (
                  <Link href={`/modules/${prevStep.id}?roadmapId=${roadmap.id}`} className="flex-1 flex flex-col items-start gap-1 p-4 border rounded-2xl hover:bg-muted transition-all text-left group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold"><ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Prev Step</span>
                    <p className="text-base font-bold group-hover:text-primary transition-colors">{prevStep.title}</p>
                  </Link>
                ) : isStandalone ? (
                  <Link href="/modules" className="flex-1 flex flex-col items-start gap-1 p-4 border rounded-2xl hover:bg-muted/30 transition-all text-left group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold"><ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Exit</span>
                    <p className="text-base font-bold group-hover:text-primary transition-colors">Back to Modules</p>
                  </Link>
                ) : (
                  <Link href={`/roadmap/${roadmap.id}`} className="flex-1 flex flex-col items-start gap-1 p-4 border rounded-2xl hover:bg-muted/30 transition-all text-left group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold"><ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Exit</span>
                    <p className="text-base font-bold group-hover:text-primary transition-colors">Back to Roadmap</p>
                  </Link>
                )}

                {currentNavIndex < navSequence.length - 1 ? (
                  <button onClick={() => goToNav(currentNavIndex + 1)} className="flex-1 flex flex-col items-end gap-1 p-4 border rounded-2xl hover:bg-muted hover:border-foreground/30 transition-all text-right group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Next <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <p className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2">{getNavLabel(navSequence[currentNavIndex + 1])}</p>
                  </button>
                ) : !isStandalone && nextStep ? (
                  <Link href={`/modules/${nextStep.id}?roadmapId=${roadmap.id}`} className="flex-1 flex flex-col items-end gap-1 p-4 border rounded-2xl bg-primary/5 hover:bg-primary/10 border-primary/20 transition-all text-right group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-bold">Next Step <ArrowRight /></span>
                    <p className="text-base font-bold text-primary">{nextStep.title}</p>
                  </Link>
                ) : isStandalone ? (
                  <Link href="/modules" className="flex-1 flex flex-col items-end gap-1 p-4 border rounded-2xl bg-primary/5 hover:bg-primary/10 border-primary/20 transition-all text-right group">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Complete</span>
                    <p className="text-base font-bold text-primary">Back to Modules</p>
                  </Link>
                ) : (
                  <Link href={`/roadmap/${roadmap.id}`} className="flex-1 flex flex-col items-end gap-1 p-4 border rounded-2xl bg-primary/5 hover:bg-primary/10 border-primary/20 transition-all text-right group">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Complete</span>
                    <p className="text-base font-bold text-primary">Back to Roadmap</p>
                  </Link>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-border/10 gap-4 mt-8 shadow-sm">
                <Button onClick={handleLike} disabled={hasLiked} variant="outline" className="gap-2 font-semibold">
                  <Heart className={`h-4 w-4 ${hasLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} /> {likes} Likes
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-1">Share</span>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(step.title)}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70"><Twitter className="h-4 w-4" /></Button>
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70"><Linkedin className="h-4 w-4" /></Button>
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70" onClick={handleCopy}>
                    {copied ? <span className="text-[10px] text-emerald-500 font-bold">✓</span> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {dynamicResources && dynamicResources.length > 0 && (
                 <div className="mt-16 pt-8 border-t">
                    <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                       <BookOpen className="h-4 w-4 text-primary" /> Recommended Resources
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {dedupedDynamicResources.map((r: any) => (
                           <ResourceCard key={r.id} resource={r} />
                        ))}
                    </div>
                 </div>
              )}
              
              </div> {/* closes inner .flex-1 content area row for Center text */}

              {/* Right Sidebar - inline with content Heading triggers */}
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

                  // De-duplicate resources by Title/URL to catch duplicate records too
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
                              {resource.description && (
                                <p className="text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-2 pt-1 border-t border-border/5">
                                  {resource.description}
                                </p>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Disclaimer / Updates Note explicitly ALWAYS on the Right Side */}
                <div className="p-5 bg-amber-500/5 rounded-2xl border border-dashed border-amber-500/10 text-xs text-muted-foreground leading-relaxed flex items-start gap-3.5 shadow-sm">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    {step.author?.avatarUrl ? (
                      <img 
                        src={step.author.avatarUrl} 
                        alt={step.author.fullName || "Admin"} 
                        className="w-10 h-10 rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-md object-cover" 
                      />
                    ) : (
                      <img 
                        src="https://api.dicebear.com/7.x/miniavs/svg?seed=Admin" 
                        className="w-10 h-10 rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-md object-cover" 
                        alt="Admin"
                      />
                    )}
                    <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shadow-sm font-mono">
                      Admin
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-black text-amber-500 text-sm">
                      Welcome Onboard!
                    </p>
                    <p className="leading-snug">
                      All the content on this platform is <span className="font-bold text-foreground">carefully handpicked and created by me</span> to give you the best possible quality and clarity for your learning.
                    </p>
                    <p className="leading-snug">
                      I’m continuously <span className="font-bold text-foreground">refining and improving</span> everything to make it even more simple, practical, and valuable.
                    </p>
                    <p className="leading-snug">
                      If you find anything unclear, feel free to reach out — or just give it a little time while I make it better!
                    </p>
                    <p className="font-bold text-foreground border-t border-border/10 pt-2 mt-2 leading-relaxed">
                      My goal is simple: provide you with <span className="text-primary">high-quality, reliable notes</span> that genuinely help you grow.
                    </p>
                  </div>
                </div>
              </div>

              </div> {/* closes outer flex row container row */}
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <Map className="h-16 w-16 text-muted-foreground/30 mb-6" />
              <h2 className="text-3xl font-bold mb-3">Select a Topic</h2>
              <Button onClick={() => setSidebarOpen(true)} className="md:hidden">Open Topics</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
