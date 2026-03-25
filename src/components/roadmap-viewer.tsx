"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  ExternalLink,
  Youtube,
  BookOpen,
  Download,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Home,
} from "lucide-react";

interface Topic {
  id: string;
  title: string;
  content: string;
  order: number;
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
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  steps: Step[];
}

const resourceIcon = (type: string) => {
  switch (type) {
    case "VIDEO":
    case "YOUTUBE":
      return <Youtube className="h-4 w-4 text-red-500" />;
    case "PDF":
      return <Download className="h-4 w-4 text-orange-500" />;
    case "ARTICLE":
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    default:
      return <LinkIcon className="h-4 w-4 text-primary" />;
  }
};

export function RoadmapViewer({ roadmap }: { roadmap: Roadmap }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(() => {
    // Auto-expand first step
    return new Set(roadmap.steps.length > 0 ? [roadmap.steps[0].id] : []);
  });

  const [activeTopicId, setActiveTopicId] = useState<string | null>(() => {
    // Auto-select first topic of first step
    return roadmap.steps[0]?.topics[0]?.id ?? null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  // Find active topic data
  let activeTopic: Topic | null = null;
  let activeStep: Step | null = null;
  for (const step of roadmap.steps) {
    const found = step.topics.find((t) => t.id === activeTopicId);
    if (found) {
      activeTopic = found;
      activeStep = step;
      break;
    }
  }

  // Build flat list for prev/next navigation
  const allTopics = roadmap.steps.flatMap((step) =>
    step.topics.map((topic) => ({ ...topic, stepId: step.id, stepTitle: step.title }))
  );
  const currentIndex = allTopics.findIndex((t) => t.id === activeTopicId);

  const goToTopic = (topicId: string, stepId: string) => {
    setActiveTopicId(topicId);
    setExpandedSteps((prev) => new Set([...prev, stepId]));
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 max-w-7xl flex items-center h-12 gap-3">
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-muted"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium underline decoration-primary/20 underline-offset-4 decoration-2 truncate" style={{ color: roadmap.color }}>{roadmap.icon} {roadmap.title}</span>
          {activeStep && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate hidden sm:inline max-w-[120px]">{activeStep.title}</span>
            </>
          )}
          {activeTopic && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground hidden sm:block shrink-0" />
              <span className="text-sm text-foreground font-bold truncate hidden md:inline max-w-[200px]">{activeTopic.title}</span>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl flex relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left Sidebar */}
        <aside
          className={`
            fixed md:sticky top-28 left-0 z-40 md:z-auto
            w-72 md:w-72 lg:w-80 h-[calc(100vh-7rem)] overflow-y-auto
            bg-background md:bg-transparent border-r md:border-r-0
            transform transition-transform md:transform-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            shrink-0 px-4 py-6
          `}
        >
          {/* Roadmap info */}
          <div className="mb-6 pb-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{roadmap.icon}</span>
              <h2 className="font-bold text-lg leading-tight">{roadmap.title}</h2>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{roadmap.description}</p>
          </div>

          {/* Steps accordion */}
          <nav className="space-y-1">
            {roadmap.steps.map((step, stepIndex) => (
              <div key={step.id}>
                {/* Step header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                    activeStep?.id === step.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: roadmap.color }}
                  >
                    {stepIndex + 1}
                  </span>
                  <span className="flex-1 truncate">{step.title}</span>
                  {expandedSteps.has(step.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Topics list */}
                {expandedSteps.has(step.id) && step.topics.length > 0 && (
                  <div className="ml-4 pl-4 border-l-2 space-y-0.5 my-1" style={{ borderColor: `${roadmap.color}30` }}>
                    {step.topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => goToTopic(topic.id, step.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                          activeTopicId === topic.id
                            ? "bg-primary/10 text-primary font-semibold shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {topic.title}
                      </button>
                    ))}

                    {/* Resources count */}
                    {step.resources.length > 0 && (
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                        📎 {step.resources.length} Resources
                      </div>
                    )}
                  </div>
                )}

                {/* Empty step */}
                {expandedSteps.has(step.id) && step.topics.length === 0 && (
                  <div className="ml-8 pl-4 py-2 text-xs text-muted-foreground italic">No topics yet</div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-8 md:border-l">
          {activeTopic && activeStep ? (
            <div className="max-w-4xl space-y-8">
              {/* Topic Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-md text-white"
                    style={{ backgroundColor: roadmap.color }}
                  >
                    {activeStep.icon} {activeStep.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Step {activeStep.order + 1} of {roadmap.steps.length}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{activeTopic.title}</h1>
              </div>

              {/* Topic Content */}
              {activeTopic.content ? (
                <div
                  className="prose prose-sm md:prose-base dark:prose-invert max-w-none
                    prose-headings:tracking-tight prose-a:text-primary
                    prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:border
                    prose-img:rounded-xl prose-img:border prose-img:shadow-md"
                  dangerouslySetInnerHTML={{ __html: activeTopic.content }}
                />
              ) : (
                <div className="border border-dashed rounded-xl p-12 text-center bg-muted/10">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Content for this topic is coming soon.</p>
                </div>
              )}

              {/* Step Resources */}
              {activeStep.resources.length > 0 && (
                <div className="pt-8 border-t space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    📚 Resources & References
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeStep.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 p-4 border rounded-xl bg-card hover:border-primary/40 hover:shadow-md transition-all"
                      >
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                          {resourceIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                            {resource.title}
                          </p>
                          {resource.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                          )}
                          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mt-2 inline-block">
                            {resource.type}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev / Next Navigation */}
              <div className="pt-8 border-t flex items-center justify-between gap-4">
                {currentIndex > 0 ? (
                  <button
                    onClick={() => goToTopic(allTopics[currentIndex - 1].id, allTopics[currentIndex - 1].stepId)}
                    className="flex items-center gap-2 px-4 py-3 border rounded-xl hover:bg-muted transition-colors text-left max-w-[45%]"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Previous</p>
                      <p className="text-sm font-medium truncate">{allTopics[currentIndex - 1].title}</p>
                    </div>
                  </button>
                ) : (
                  <div />
                )}
                {currentIndex < allTopics.length - 1 ? (
                  <button
                    onClick={() => goToTopic(allTopics[currentIndex + 1].id, allTopics[currentIndex + 1].stepId)}
                    className="flex items-center gap-2 px-4 py-3 border rounded-xl hover:bg-muted transition-colors text-right max-w-[45%] ml-auto"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next</p>
                      <p className="text-sm font-medium truncate">{allTopics[currentIndex + 1].title}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ) : (
            /* No topic selected — show roadmap overview */
            <div className="max-w-3xl space-y-10">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{roadmap.icon} {roadmap.title}</h1>
                <p className="text-lg text-muted-foreground">{roadmap.description}</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold">What you'll learn</h2>
                <div className="space-y-3">
                  {roadmap.steps.map((step, i) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        toggleStep(step.id);
                        if (step.topics.length > 0) {
                          goToTopic(step.topics[0].id, step.id);
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all text-left group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: roadmap.color }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-primary transition-colors">{step.icon} {step.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{step.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {step.topics.length} topics
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
