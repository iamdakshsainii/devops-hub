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
  Menu, X, Map, ChevronDown, ChevronRight, Library, Heart, Twitter, Linkedin, Copy, Search, Bookmark, Check
} from "lucide-react";
import { ResourceCard } from "@/components/resource-card";
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

// ── ASCII diagram detector ─────────────────────────────────────────────────

function isAsciiDiagram(text: string): boolean {
  const lines = text.split("\n").filter((l: string) => l.trim());
  if (lines.length < 1) return false;

  // Box-drawing: +----+ or |text|
  if (/\+[-=+]{2,}/.test(text) || /\|.+\|/.test(text)) return true;

  // Any unicode arrow or line-draw character (→ ← ↑ ↓ ↔ ⇒ ⇐ ⟶ ➜ ➡ ─ ═ └ ┌ ┐ ┘ ├ ┤ ┬ ┴ ┼)
  const arrowCount = (text.match(/[→←↑↓↔↕⇒⇐⇔⟶⟵⟷➜➡➞➝─═└┘┌┐├┤┬┴┼]/g) || []).length;
  if (arrowCount >= 1) return true;

  // ASCII arrows: -> <-  --> <-- => <=  ==>
  const asciiArrows = (text.match(/(-->|<--|->|<-|=>|<=|==>)/g) || []).length;
  if (asciiArrows >= 1) return true;

  // Step/numbered flow: lines starting with 1. 2. 3. style across multiple lines
  const numberedLines = lines.filter((l: string) => /^\s*\d+[\.\)]\s+\S/.test(l)).length;
  if (numberedLines >= 3) return true;

  // Indented block with separator line (----, ====)
  const hasSeparator = lines.some((l: string) => /^[-─═]{4,}$/.test(l.trim()));
  const hasIndented = lines.filter((l: string) => /^\s{2,}\S/.test(l)).length >= 2;
  if (hasSeparator && hasIndented) return true;

  // Key: value table-like pattern (used in config/env diagrams)
  const kvLines = lines.filter((l: string) => /^\s*\S+\s*[:=]\s*\S+/.test(l)).length;
  if (kvLines >= 3 && lines.length >= 3) return true;

  return false;
}

// ── Marked custom renderer ────────────────────────────────────────────────

function buildRenderer() {
  const renderer = new marked.Renderer();

  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const unescaped = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const trimmed = unescaped.replace(/^\n+/, "").replace(/\n+$/, "");

    // ── 1. Parse Filename & Highlights (e.g., js:app.js {2,4-6}) ──
    let fileName = "";
    let baseLang = lang || "";
    let highlightedLines: number[] = [];

    const highlightMatch = baseLang.match(/\{([\d,\-]+)\}/);
    if (highlightMatch) {
      const rangeStr = highlightMatch[1];
      rangeStr.split(",").forEach(part => {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          for (let i = start; i <= end; i++) highlightedLines.push(i);
        } else {
          highlightedLines.push(Number(part));
        }
      });
      baseLang = baseLang.replace(/\{([\d,\-]+)\}/, "").trim();
    }

    if (baseLang.includes(":")) {
      const parts = baseLang.split(":");
      baseLang = parts[0].trim();
      fileName = parts[1].trim();
    }

    // ── 2. Auto language detection ──
    let highlighted: string;
    let validLang = baseLang;

    if (baseLang && hljs.getLanguage(baseLang)) {
      highlighted = hljs.highlight(trimmed, { language: baseLang }).value;
    } else {
      try {
        const autoResult = hljs.highlightAuto(trimmed);
        highlighted = autoResult.value;
        validLang = autoResult.language || "plaintext";
      } catch (_) {
        highlighted = trimmed;
        validLang = "plaintext";
      }
    }

    const LANG_LABELS: Record<string, string> = {
      js: "JavaScript", ts: "TypeScript", jsx: "React JSX", tsx: "React TSX",
      py: "Python", sh: "Shell", bash: "Bash", sql: "SQL",
      yaml: "YAML", yml: "YAML", json: "JSON", dockerfile: "Dockerfile",
      go: "Go", rs: "Rust", css: "CSS", html: "HTML"
    };

    let label: string;
    let blockClass = "devhub-code-block";

    // ── Check condition based on 'un-tagged' blocks ──
    const isDiag = (!baseLang || baseLang === "text") && isAsciiDiagram(trimmed);

    if (isDiag) {
      label = "◈ DIAGRAM";
      blockClass = "devhub-code-block devhub-code-block--terminal";
      validLang = "plaintext";
    } else {
      label = LANG_LABELS[validLang] ?? validLang.toUpperCase();
    }

    // ── 3. Line Numbers & Diff Highlighting ──
    const lines = highlighted.split("\n");
    const numberedLines = lines.map((lineContent, i) => {
      const lineNum = i + 1;
      let diffClass = "";
      if (validLang === "diff" || baseLang === "diff") {
        const rawLine = trimmed.split("\n")[i] || "";
        if (rawLine.startsWith("+")) diffClass = " bg-emerald-500/10 text-emerald-400";
        else if (rawLine.startsWith("-")) diffClass = " bg-red-500/10 text-red-400";
      }
      if (highlightedLines.includes(lineNum)) {
        diffClass += " bg-amber-500/10 border-l-2 border-amber-500";
      }
      return `<div class="flex items-start px-4 hover:bg-muted/30${diffClass}"><span class="select-none text-muted-foreground/40 text-right pr-4 font-mono text-xs w-[35px] shrink-0 mt-[2px]">${lineNum}</span><span class="font-mono text-sm leading-relaxed flex-1">${lineContent || " "}</span></div>`;
    }).join("");

    const encoded = encodeURIComponent(trimmed);

    return `
<div class="${blockClass}" data-lang="${validLang}">
  <div class="devhub-code-header flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
    <div class="flex items-center gap-2">
      <span class="devhub-lang-label text-xs font-bold text-primary tracking-wider uppercase">${label}</span>
      ${fileName ? `<span class="text-[10px] font-mono text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded border border-border/50">${fileName}</span>` : ""}
    </div>
    <div class="flex items-center gap-3">
      <!-- ── Word Wrap Toggle button ── -->
      <button onclick="this.closest('.devhub-code-block').querySelector('pre').classList.toggle('!whitespace-pre-wrap'); this.classList.toggle('text-primary');" class="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded" title="Toggle Word Wrap" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h15a3 3 0 1 1 0 6h-4m-2-2-2 2 2 2"/></svg>
      </button>
      <button class="devhub-copy-btn text-muted-foreground/60 hover:text-foreground transition-all p-0.5" data-code="${encoded}" type="button" title="Copy code">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      </button>
    </div>
  </div>
  <div class="devhub-code-content py-3 overflow-x-auto bg-background/50">
    <pre class="bg-transparent p-0 m-0"><code class="p-0 bg-transparent block w-full hljs language-${validLang}">${numberedLines}</code></pre>
  </div>
</div>`;
  };

  return renderer;
}

marked.use({
  gfm: true,
  breaks: false,
  pedantic: false,
  renderer: buildRenderer(),
  hooks: {
    preprocess(src: string) { return src; },
  }
});

function parseMarkdown(content: string): string {
  const trimmed = (content || "").trim();
  const isHTML = trimmed.startsWith("<") && trimmed.includes(">");
  if (isHTML) return trimmed;
  return marked.parse(trimmed) as string;
}

// ── Copy button wiring ────────────────────────────────────────────────────

function wireCopyButtons(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll<HTMLButtonElement>(".devhub-copy-btn").forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "true";

    btn.addEventListener("click", async () => {
      const text = decodeURIComponent(btn.dataset.code ?? "");
      await navigator.clipboard.writeText(text).catch(() => { });

      btn.classList.add("copied");
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>Copied!</span>`;

      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`;
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
  "prose-th:border prose-th:border-border/40 prose-th:px-3.5 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:bg-muted/40",
  "prose-td:border prose-td:border-border/20 prose-td:px-3.5 prose-td:py-1.5 prose-td:text-sm prose-td:leading-normal",
  "prose-table:border-collapse prose-table:w-full prose-table:my-4 prose-table:border prose-table:border-border/20 prose-table:rounded-xl prose-table:overflow-hidden",
  "[&_table]:block [&_table]:overflow-x-auto",
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
    if (topic.content || !topic.subtopics || topic.subtopics.length === 0) {
      seq.push({ kind: "topic", topicId: topic.id });
    }
    if (topic.subtopics) {
      for (const sub of topic.subtopics) {
        seq.push({ kind: "subtopic", topicId: topic.id, subtopicId: sub.id });
      }
    }
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
}: {
  roadmap: PartialRoadmap;
  step: Step;
  roadmapSteps?: { id: string; title: string; icon: string; order: number }[];
  isStandalone?: boolean;
}) {
  const router = useRouter();
  const [urlStepId, setUrlStepId] = useState<string | null>(null);


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
    if (step.topics[0]) s.add(step.topics[0].id);
    return s;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b shadow-sm" style={{ position: "sticky" }}>

        {completionPercentage === 100 && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 text-xs font-bold py-1.5 px-4 text-center">
            🎉 Awesome! You've mastered all topics in this step. Keep the momentum going!
          </div>
        )}

        {/* Breadcrumb row */}
        <div className="container mx-auto px-4 max-w-7xl flex items-center h-14 gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide text-sm">
          <button className="md:hidden p-1.5 rounded-md hover:bg-muted shrink-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground gap-1.5 p-1.5 h-8 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Back</span>
          </Button>
          <span className="text-muted-foreground/30 ml-1 hidden sm:inline">|</span>


          {!isStandalone ? (
            <>
              <Link href="/roadmap" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0 font-medium">
                <Map className="h-4 w-4" /> All Roadmaps
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <Link href={`/roadmap/${roadmap.id}`} className="text-muted-foreground hover:text-foreground truncate max-w-[130px] md:max-w-xs transition-colors font-medium">
                {roadmap.title}
              </Link>
              {urlStepId && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <Link href={`/roadmap/${roadmap.id}/${urlStepId}`} className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Step
                  </Link>
                </>
              )}
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

      <div className="container mx-auto max-w-7xl flex flex-1 relative">

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-32 left-0 z-40 md:z-auto
          w-72 md:w-72 lg:w-80 h-[calc(100vh-8rem)] overflow-y-auto
          bg-background md:bg-transparent border-r md:border-r-0
          transform transition-transform md:transform-none shadow-2xl md:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shrink-0 px-4 py-8
        `}>
          {urlStepId && (
            <Link href={`/roadmap/${roadmap.id}/${urlStepId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-5 border-b pb-4 w-full">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Step: {step.title}
            </Link>
          )}
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
              const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
              const hasIntro = !!topic.content;
              const isActive = isTopicActive && (activeView.kind === "topic" || activeView.kind === "subtopic");

              return (
                <div key={topic.id} className={`rounded-xl transition-all ${isActive ? "bg-primary/5 border border-primary/10 mb-2 p-1" : "border border-transparent"}`}>
                  <div className="flex items-start gap-1">
                    <button onClick={() => { if (hasIntro) navigate({ kind: "topic", topicId: topic.id }); else if (hasSubtopics) { toggleTopicExpand(topic.id); if (!isTopicActive && topic.subtopics![0]) navigate({ kind: "subtopic", topicId: topic.id, subtopicId: topic.subtopics![0].id }); } else navigate({ kind: "topic", topicId: topic.id }); }}
                      className={`flex-1 flex items-start gap-3 px-3 py-2 text-sm text-left transition-all rounded-lg ${isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${isActive ? "text-primary/70" : "text-muted-foreground/40"}`}>
                        {completedItems.includes(topic.id)
                          ? <Check className="h-3 w-3 text-emerald-500 font-bold" />
                          : String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-1">
                        <span className="leading-snug break-words">{topic.title}</span>
                        <span className="text-[9px] text-muted-foreground/60 font-medium shrink-0 mt-0.5">{getTopicReadTime(topic)}m</span>
                      </div>
                    </button>
                    {hasSubtopics && (
                      <button onClick={() => toggleTopicExpand(topic.id)} className="p-1.5 mt-1 hover:bg-muted/60 rounded-md shrink-0 text-muted-foreground hover:text-foreground">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>

                  {hasSubtopics && isExpanded && (
                    <div className="ml-4 pl-3 mt-0 mb-1 border-l-2 border-muted/50 flex flex-col gap-0.5">
                      {topic.subtopics!.map((sub) => {
                        const isSubActive = activeView.kind === "subtopic" && activeView.subtopicId === sub.id;
                        return (
                          <button key={sub.id} onClick={() => navigate({ kind: "subtopic", topicId: topic.id, subtopicId: sub.id })}
                            className={`text-xs text-left py-1.5 px-2.5 rounded-md transition-all ${isSubActive ? "bg-primary/10 text-primary font-semibold border border-primary/20" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent"}`}
                          >
                            <div className="flex items-center justify-between w-full gap-1">
                              <span className="truncate">{sub.title}</span>
                              <span className="text-[9px] text-muted-foreground/50 font-medium shrink-0">{getReadTime(sub.content)}m</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {step.resources.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="bg-muted/30 p-4 rounded-xl border border-dashed bg-muted/10">
                <p className="text-sm font-bold mb-1">📚 {step.resources.length} Resources</p>
                <p className="text-xs text-muted-foreground">PDFs, videos, articles — at bottom.</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 md:px-10 py-8 lg:py-12 md:border-l">
          {(activeTopic || activeSubtopic) ? (
            <article id="devhub-content-area" className="max-w-4xl mx-auto">

              <header className="mb-10 pb-8 border-b space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">

                  {/* Local search */}
                  <div className="flex items-center gap-2 flex-1 max-w-md relative">
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
                          {activeTopic?.subtopics?.filter(s => s.title.toLowerCase().includes(localSearch.toLowerCase())).map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setLocalSearch("");
                                if (viewMode === "CONTINUOUS") {
                                  const el = document.getElementById(`subtopic-${sub.id}`);
                                  el?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  navigate({ kind: "subtopic", topicId: activeTopic.id, subtopicId: sub.id });
                                }
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 group"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary shrink-0" />
                              <span className="truncate font-medium">{sub.title}</span>
                            </button>
                          ))}
                          {(!activeTopic?.subtopics?.filter(s => s.title.toLowerCase().includes(localSearch.toLowerCase())).length) && (
                            <p className="p-3 text-[11px] text-muted-foreground text-center">No matching headings found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* View mode toggle */}
                  <div className="flex bg-muted p-1 rounded-lg w-fit gap-1 text-[11px] font-bold border">
                    <button
                      onClick={() => setViewMode("PAGINATED")}
                      className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "PAGINATED" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Step-by-Step
                    </button>
                    <button
                      onClick={() => setViewMode("CONTINUOUS")}
                      className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "CONTINUOUS" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Continuous
                    </button>
                  </div>
                </div>

                {/* ── MARK READ row ─────────────────────────────────────────────────
                    FIX: was using <Bookmark> icon — now correctly uses <Checkbox>.
                    The checkbox toggles the current topic as complete/incomplete.
                    Title text updates to reflect current state.
                */}
                <div className="flex items-center gap-3">
                  {activeTopic && (
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id="mark-read-checkbox"
                        checked={completedItems.includes(activeTopic.id)}
                        onCheckedChange={() => toggleComplete(activeTopic.id, activeTopic)}
                        title={completedItems.includes(activeTopic.id) ? "Mark as unread" : "Mark as read"}
                        className="h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-muted-foreground/40 rounded-md transition-colors cursor-pointer"
                      />
                      <label
                        htmlFor="mark-read-checkbox"
                        className={`text-[10px] uppercase font-bold tracking-wider cursor-pointer select-none transition-colors ${completedItems.includes(activeTopic.id)
                          ? "text-emerald-500"
                          : "text-muted-foreground/60 hover:text-muted-foreground"
                          }`}
                      >
                        {completedItems.includes(activeTopic.id) ? "Completed ✓" : "Mark Read"}
                      </label>

                      {/* Bookmark button kept separately, does not affect progress */}
                      <button
                        title="Bookmark this topic"
                        onClick={() => toggleBookmark(activeTopic.id)}
                        className={`ml-1 p-1.5 rounded-lg border transition-all ${bookmarkedItems.includes(activeTopic.id)
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"
                          }`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-foreground/95">
                    {activeView.kind === "subtopic" && activeSubtopic && viewMode === "PAGINATED"
                      ? activeSubtopic.title
                      : activeTopic?.title}
                  </h1>
                </div>
              </header>

              {viewMode === "CONTINUOUS" && activeTopic ? (
                <div className="space-y-12">
                  {activeTopic.content && <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(activeTopic.content) }} />}
                  {activeTopic.subtopics && activeTopic.subtopics.length > 0 && (
                    <div className="space-y-12">
                      {activeTopic.subtopics.map((sub) => (
                        <div key={sub.id} id={`subtopic-${sub.id}`} className="space-y-4 pt-10 border-t border-border/10 first:pt-0 first:border-0">
                          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{sub.title}</h2>
                          <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(sub.content) }} />
                        </div>
                      ))}
                    </div>
                  )}
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
              <div className="mt-16 pt-8 border-t flex gap-4">
                {currentNavIndex > 0 ? (
                  <button onClick={() => goToNav(currentNavIndex - 1)} className="flex-1 flex flex-col items-start gap-1 p-4 border rounded-2xl hover:bg-muted hover:border-foreground/30 transition-all text-left group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Previous
                    </span>
                    <p className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2">{getNavLabel(navSequence[currentNavIndex - 1])}</p>
                  </button>
                ) : !isStandalone && prevStep ? (
                  <Link href={`/modules/${prevStep.id}?roadmapId=${roadmap.id}`} className="flex-1 flex flex-col items-start gap-1 p-4 border rounded-2xl hover:bg-muted transition-all text-left group">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold"><ArrowLeft /> Prev Step</span>
                    <p className="text-base font-bold group-hover:text-primary transition-colors">{prevStep.title}</p>
                  </Link>
                ) : <div className="flex-1" />}

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

              {/* Resources */}
              {step.resources.length > 0 && (
                <div className="mt-20 pt-10 border-t space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">📚 Recommended Resources</h3>
                    <p className="text-muted-foreground mt-1 text-sm">Curated materials to go deeper.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {step.resources.map((resource) => (
                      <ResourceCard key={resource.id} resource={{
                        ...resource,
                        description: resource.description || "",
                        imageUrl: (resource as any).imageUrl || "",
                        tags: ""
                      }} />
                    ))}
                  </div>
                </div>
              )}

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