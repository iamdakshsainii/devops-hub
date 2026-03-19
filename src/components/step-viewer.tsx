"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import {
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
  Map,
} from "lucide-react";

interface Topic {
  id: string;
  title: string;
  content: string | null;
  order: number;
  subtopics?: { id: string; title: string; content: string; order: number }[];
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

export function StepViewer({ roadmap, step }: { roadmap: PartialRoadmap; step: Step }) {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(
    step.topics.length > 0 ? step.topics[0].id : null
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTopic = step.topics.find((t) => t.id === activeTopicId) || null;
  const currentIndex = activeTopic ? step.topics.findIndex((t) => t.id === activeTopicId) : -1;

  const goToTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [subtopics, setSubtopics] = useState<{ text: string, level: number }[]>([]);

  const scrollToHeading = (text: string) => {
    const divs = document.querySelectorAll('.prose h2, .prose h3');
    for (const div of Array.from(divs)) {
      if (div.textContent?.trim() === text) {
         div.scrollIntoView({ behavior: 'smooth', block: 'start' });
         break;
      }
    }
  };

  // Parse sub-headings on content change
  useState(() => {
     const t = setTimeout(() => {
        const divs = document.querySelectorAll('.prose h2, .prose h3');
        const list: { text: string, level: number }[] = [];
        divs.forEach(div => {
            const text = div.textContent?.trim() || "";
            if (text) list.push({ text, level: div.tagName === 'H2' ? 2 : 3 });
        });
        setSubtopics(list);
     }, 500);
     return () => clearTimeout(t);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar Navigation */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl flex items-center h-14 gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-muted shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <Link href={`/roadmap`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
             <Map className="h-4 w-4" />
             <span className="text-sm font-medium">All Roadmaps</span>
          </Link>

          <span className="text-muted-foreground/30 mx-1 shrink-0">/</span>
          
          <Link href={`/roadmap/${roadmap.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
             <span className="text-sm font-medium truncate max-w-[150px] md:max-w-xs">{roadmap.title}</span>
          </Link>
          
          <span className="text-muted-foreground/30 mx-1 shrink-0">/</span>

          <span className="text-sm font-bold flex items-center gap-1.5 shrink-0" style={{ color: roadmap.color }}>
             <span>{step.icon}</span> {step.title}
          </span>

          {activeTopic && (
            <>
              <span className="text-muted-foreground/30 mx-1 shrink-0">/</span>
              <span className="text-sm text-foreground font-medium truncate">{activeTopic.title}</span>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl flex flex-1 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left Sidebar (Topics Outline) */}
        <aside
          className={`
            fixed md:sticky top-32 left-0 z-40 md:z-auto
            w-72 md:w-72 lg:w-80 h-[calc(100vh-8rem)] overflow-y-auto
            bg-background md:bg-transparent border-r md:border-r-0
            transform transition-transform md:transform-none shadow-2xl md:shadow-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            shrink-0 px-4 py-8
          `}
        >
          {/* Step Context */}
          <div className="mb-8 pb-6 border-b">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                style={{ backgroundColor: roadmap.color }}
              >
                  {roadmap.icon}
              </div>
              <div>
                <h2 className="font-extrabold text-xl leading-tight">{step.title}</h2>
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Module {step.order + 1}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            
            {step.author && (
              <div className="mt-4 pt-3 border-t border-dashed flex items-center gap-2">
                 {step.author.avatarUrl ? (
                    <img src={step.author.avatarUrl} className="h-6 w-6 rounded-full overflow-hidden object-cover border"/>
                 ) : (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">🎯</div>
                 )}
                 <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Contributor</span>
                    <span className="text-xs font-bold">{step.author.fullName || "Admin"}</span>
                 </div>
              </div>
            )}
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4 px-2">Table of Contents</h3>
          
          {/* Topics List */}
          <nav className="space-y-1">
             {step.topics.map((topic, i) => (
                <div key={topic.id} className="space-y-0.5">
                   <button
                     onClick={() => goToTopic(topic.id)}
                     className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                        activeTopicId === topic.id
                           ? "bg-primary/10 text-primary font-bold shadow-sm border border-primary/20"
                           : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                     }`}
                   >
                     <span className={`text-[10px] font-mono shrink-0 ${activeTopicId===topic.id?"text-primary/70":"text-muted-foreground/40"}`}>
                       {String(i + 1).padStart(2, "0")}
                     </span>
                     <span className="flex-1 truncate">{topic.title}</span>
                   </button>
                   {activeTopicId === topic.id && topic.subtopics && topic.subtopics.length > 0 && (
                       <div className="pl-6 flex flex-col space-y-1 mt-1 border-l-2 ml-4 border-muted/50">
                         {topic.subtopics.map((sub) => (
                           <button
                             key={sub.id}
                             onClick={() => {
                               const el = document.getElementById(`subtopic-${sub.id}`);
                               if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                             }}
                             className="text-xs text-left py-1 px-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors truncate"
                           >
                             {sub.title}
                           </button>
                         ))}
                       </div>
                    )}
                </div>
             ))}

             {step.topics.length === 0 && (
                <div className="px-3 py-4 text-xs text-muted-foreground italic border border-dashed rounded-lg bg-muted/20">
                   No topics added for this module yet.
                </div>
             )}
          </nav>

          {/* Resources Summary Box */}
          {step.resources.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="bg-muted/30 border rounded-xl p-4">
                 <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                    📚 {step.resources.length} Included Resources
                 </h4>
                 <p className="text-xs text-muted-foreground">Extra materials like PDFs, videos, and articles are available at the bottom of each topic.</p>
              </div>
            </div>
          )}
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 px-4 md:px-10 py-8 lg:py-12 md:border-l bg-card/10">
          {activeTopic ? (
            <div className="max-w-4xl mx-auto space-y-10">
              {/* Topic Header */}
              <div className="space-y-4 border-b pb-8">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] px-2.5 py-1 rounded bg-muted text-muted-foreground uppercase tracking-wider font-bold border">
                    {roadmap.title}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded text-white shadow-sm"
                    style={{ backgroundColor: roadmap.color }}
                  >
                    Module {step.order + 1}: {step.title}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{activeTopic.title}</h1>
              </div>

              {/* Topic Html Content */}
              {activeTopic.content && (
                <div
                  className="prose prose-base md:prose-lg dark:prose-invert max-w-none mb-8
                    prose-headings:tracking-tight prose-headings:scroll-mt-24
                    prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4
                    prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-semibold prose-code:text-[0.9em]
                    prose-pre:bg-zinc-950 prose-pre:text-zinc-50 prose-pre:border prose-pre:shadow-xl
                    prose-img:rounded-xl prose-img:border prose-img:shadow-lg prose-img:bg-muted/50
                    prose-blockquote:border-l-primary prose-blockquote:bg-muted/20 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg"
                  dangerouslySetInnerHTML={{ __html: marked.parse(activeTopic.content as string) as string }}
                />
              )}

              {/* Nested Subtopics from Database */}
              {activeTopic.subtopics && activeTopic.subtopics.length > 0 ? (
                <div className="space-y-12">
                   {activeTopic.subtopics.map((sub, sIdx) => (
                      <div key={sub.id} id={`subtopic-${sub.id}`} className="space-y-4 scroll-mt-24">
                         <div className="flex items-center gap-2 border-b pb-2">
                            <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                               #{sIdx + 1}
                            </span>
                            <h2 className="text-2xl font-bold tracking-tight">{sub.title}</h2>
                         </div>
                         <div
                            className="prose prose-base md:prose-lg dark:prose-invert max-w-none
                              prose-headings:tracking-tight prose-headings:scroll-mt-24
                              prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4
                              prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                              prose-img:rounded-xl prose-img:border prose-img:bg-muted/50"
                            dangerouslySetInnerHTML={{ __html: marked.parse(sub.content as string) as string }}
                         />
                      </div>
                   ))}
                </div>
              ) : !activeTopic.content && (
                <div className="border border-dashed rounded-2xl p-16 text-center bg-muted/5">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Content Coming Soon</h3>
                  <p className="text-muted-foreground">The author is still working on the material for this topic.</p>
                </div>
              )}

             {/* Resources Section - Attached to every topic view so they don't miss it */}
             {step.resources.length > 0 && (
                <div className="mt-16 pt-10 border-t space-y-6">
                  <div>
                     <h3 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                       📚 Recommended Resources
                     </h3>
                     <p className="text-muted-foreground mt-1 text-sm">Supplement your learning with these curated materials.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {step.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between p-5 border rounded-2xl bg-card hover:border-primary/40 hover:shadow-lg transition-all"
                      >
                         <div>
                            <div className="flex items-start justify-between gap-4 mb-3">
                               <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors shrink-0 shadow-sm border">
                                 {resourceIcon(resource.type)}
                               </div>
                               <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-2" />
                            </div>
                            <h4 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                               {resource.title}
                            </h4>
                            {resource.description && (
                               <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{resource.description}</p>
                            )}
                         </div>
                         <div className="mt-4 pt-4 border-t border-border/50">
                             <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 bg-muted px-2 py-1 rounded">
                               {resource.type}
                             </span>
                         </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev / Next Topic Navigation */}
              <div className="mt-16 pt-8 border-t flex items-stretch justify-between gap-4">
                {currentIndex > 0 ? (
                  <button
                    onClick={() => goToTopic(step.topics[currentIndex - 1].id)}
                    className="flex-1 flex flex-col items-start gap-1 p-4 border rounded-2xl hover:bg-muted hover:border-foreground/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                      <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Previous
                    </div>
                    <p className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2">{step.topics[currentIndex - 1].title}</p>
                  </button>
                ) : (
                  <div className="flex-1" />
                )}

                {currentIndex < step.topics.length - 1 ? (
                  <button
                    onClick={() => goToTopic(step.topics[currentIndex + 1].id)}
                    className="flex-1 flex flex-col items-end gap-1 p-4 border rounded-2xl hover:bg-muted hover:border-foreground/30 transition-all text-right group"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                       Next <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2">{step.topics[currentIndex + 1].title}</p>
                  </button>
                ) : (
                  <Link
                    href={`/roadmap/${roadmap.id}`}
                    className="flex-1 flex flex-col items-end gap-1 p-4 border rounded-2xl bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40 transition-all text-right group"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-bold mb-1">
                       Module Complete <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-base font-bold text-primary transition-colors">Back to Roadmap</p>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* No topic selected fallback (rare) */
            <div className="flex flex-col items-center justify-center p-20 text-center">
               <Map className="h-16 w-16 text-muted-foreground/30 mb-6" />
               <h2 className="text-3xl font-bold mb-3">Module Overview</h2>
               <p className="text-muted-foreground mb-8 max-w-lg text-lg">Select a topic from the left sidebar to begin your learning journey.</p>
               <Button onClick={() => setSidebarOpen(true)} className="md:hidden">Select Topic</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
