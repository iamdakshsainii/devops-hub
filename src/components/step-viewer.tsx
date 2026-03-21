"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import hljs from "highlight.js";
import {
  FileText, Youtube, BookOpen,
  Download, Link as LinkIcon, ArrowLeft, ArrowRight,
  Menu, X, Map, ChevronDown, ChevronRight, Library, Heart, Twitter, Linkedin, Copy
} from "lucide-react";
import { ResourceCard } from "@/components/resource-card";

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
  return /\+[-=+]{2,}/.test(text) || /\|.+\|/.test(text);
}

// ── Marked custom renderer ────────────────────────────────────────────────

function buildRenderer() {
  const renderer = new marked.Renderer();

  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const trimmed = text.replace(/^\n+/, "").replace(/\n+$/, "");
    const isPlain = !lang || !hljs.getLanguage(lang);
    const validLang = isPlain ? "plaintext" : lang!;
    const highlighted = hljs.highlight(trimmed, { language: validLang }).value;

    let label: string;
    let blockClass: string;
    if (isPlain) {
      label = isAsciiDiagram(trimmed) ? "◈ DIAGRAM" : "TEXT";
      blockClass = "devhub-code-block devhub-code-block--terminal";
    } else {
      label = validLang.toUpperCase();
      blockClass = "devhub-code-block";
    }

    const encoded = encodeURIComponent(trimmed);

    return `
<div class="${blockClass}" data-lang="${validLang}">
  <div class="devhub-code-header">
    <span class="devhub-lang-label">${label}</span>
    <button class="devhub-copy-btn" data-code="${encoded}" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      <span>Copy</span>
    </button>
  </div>
  <pre class="devhub-pre"><code class="hljs language-${validLang}">${highlighted}</code></pre>
</div>`;
  };

  return renderer;
}

marked.use({ gfm: true, breaks: false, renderer: buildRenderer() });

function parseMarkdown(content: string): string {
  return marked.parse(content) as string;
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
  const getDefaultView = (): ActiveView => {
    const first = step.topics[0];
    if (!first) return { kind: "topic", topicId: "" };
    if (!first.content && first.subtopics && first.subtopics.length > 0) {
      return { kind: "subtopic", topicId: first.id, subtopicId: first.subtopics[0].id };
    }
    return { kind: "topic", topicId: first.id };
  };

  const [activeView, setActiveView] = useState<ActiveView>(getDefaultView);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (step.topics[0]) s.add(step.topics[0].id);
    return s;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setActiveView(view);
    setSidebarOpen(false);
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.add(view.topicId);
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

      {/* Breadcrumb */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl flex items-center h-14 gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide text-sm">
          <button className="md:hidden p-1.5 rounded-md hover:bg-muted shrink-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

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
          <div className="mb-8 pb-6 border-b">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0" style={{ backgroundColor: themeColor }}>{step.icon}</div>
              <div>
                <h2 className="font-extrabold text-lg leading-tight">{step.title}</h2>
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Module {step.order + 1}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          {/* Unconditionally show Table of Contents (Topics list) */}
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
                      <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${isActive ? "text-primary/70" : "text-muted-foreground/40"}`}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1 leading-snug break-words">{topic.title}</span>
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
                            {sub.title}
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
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2.5 py-1 rounded bg-muted text-muted-foreground uppercase tracking-wider font-bold border">
                    {roadmap?.title || "Standalone Module"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded text-white" style={{ backgroundColor: themeColor }}>
                    Module {step.order + 1}: {step.title}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {activeView.kind === "subtopic" && activeSubtopic ? activeSubtopic.title : activeTopic?.title}
                </h1>
              </header>

              {activeView.kind === "subtopic" && activeSubtopic ? (
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
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              <div className="flex flex-col sm:flex-row justify-between items-center bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-border/10 gap-4 mt-16 shadow-sm">
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

              {/* Resources — shown at the bottom of the module content */}
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