import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Map, Search, LayoutGrid, Clock, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; steps?: string }>;
}) {
  const { q = "", sort = "newest", steps = "all" } = await searchParams;
  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));

  const where: any = { status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  let roadmaps = await prisma.roadmap.findMany({
    where,
    orderBy: { order: "asc" },
    include: {
      steps: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          icon: true,
          order: true,
          _count: { select: { topics: true, resources: true } },
        },
      },
    },
  });

  // Calculate stats
  const totalRoadmaps = roadmaps.length;
  const totalSteps = roadmaps.reduce((sum, r) => sum + r.steps.length, 0);
  const totalTopics = roadmaps.reduce((sum, r) => sum + r.steps.reduce((s, st) => s + st._count.topics, 0), 0);

  // Apply steps filter
  if (steps !== "all") {
    roadmaps = roadmaps.filter((r) => {
      const cnt = r.steps.length;
      if (steps === "short") return cnt <= 4;
      if (steps === "medium") return cnt > 4 && cnt <= 8;
      if (steps === "long") return cnt > 8;
      return true;
    });
  }

  // Apply sorting
  if (sort === "steps") {
    roadmaps.sort((a, b) => b.steps.length - a.steps.length);
  } else if (sort === "topics") {
    roadmaps.sort(
      (a, b) =>
        b.steps.reduce((s, st) => s + st._count.topics, 0) -
        a.steps.reduce((s, st) => s + st._count.topics, 0)
    );
  }

  const SORTS = [
    { label: "Default", value: "newest" },
    { label: "By Steps", value: "steps" },
    { label: "By Topics", value: "topics" },
  ];

  const STEP_BUCKETS = [
    { label: "All Lengths", value: "all" },
    { label: "Short (≤ 4 steps)", value: "short" },
    { label: "Medium (5-8 steps)", value: "medium" },
    { label: "Long (> 8 steps)", value: "long" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-12 lg:py-16 overflow-hidden border-b bg-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent z-0" />
        <div className="container relative z-10 px-4 mx-auto space-y-4 max-w-7xl">
          <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-xs text-foreground/80 shadow-sm backdrop-blur-md">
            <Map className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {totalRoadmaps} Guides · {totalSteps} Steps · {totalTopics} Topics
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">Roadmaps</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            Structured, step-by-step guides curated by the community to master DevOps infrastructure step by step.
          </p>
        </div>
      </section>

      {/* Main Grid Layout */}
      <section className="container px-4 mx-auto max-w-7xl py-12">
        {/* Core selection portal layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <Link href="/roadmap?q=DevOps" className="group">
              <div className="p-7 h-full backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl hover:border-primary/30 shadow-md hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col items-start group hover:-translate-y-1">
                 <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl pointer-events-none bg-primary" />
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-all duration-500 filter drop-shadow-md">🚀</div>
                 <h3 className="text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors">Core DevOps</h3>
                 <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">Master core infrastructure components, CI/CD, and pipelined automation.</p>
                 <div className="mt-5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary group-hover:underline">
                    Explore Focus <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Link>

           <Link href="/roadmap?q=Security" className="group">
              <div className="p-7 h-full backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl hover:border-amber-500/30 shadow-md hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col items-start group hover:-translate-y-1">
                 <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl pointer-events-none bg-amber-500" />
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-all duration-500 filter drop-shadow-md">🛡️</div>
                 <h3 className="text-lg font-extrabold tracking-tight group-hover:text-amber-500 transition-colors">DevSecOps</h3>
                 <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">Implement security scanning, compliance grids, and shift-left configurations.</p>
                 <div className="mt-5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-500 group-hover:underline">
                    Explore Focus <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Link>

           <Link href="/roadmap?q=AI" className="group">
              <div className="p-7 h-full backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl hover:border-purple-500/30 shadow-md hover:shadow-[0_20px_40px_rgba(168,85,247,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col items-start group hover:-translate-y-1">
                 <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl pointer-events-none bg-purple-500" />
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-all duration-500 filter drop-shadow-md">🧠</div>
                 <h3 className="text-lg font-extrabold tracking-tight group-hover:text-purple-500 transition-colors">AIOps / MLOps</h3>
                 <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">Monitor models, LLM Deployments, and setup metric anomaly detection streams.</p>
                 <div className="mt-5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-purple-500 group-hover:underline">
                    Explore Focus <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Link>
        </div>
        <RoadmapClient 
           roadmaps={roadmaps}
           isAdmin={isAdmin}
           q={q}
           sort={sort}
           steps={steps}
           SORTS={SORTS}
           STEP_BUCKETS={STEP_BUCKETS}
        />
      </section>
    </div>
  );
}

import RoadmapClient from "./roadmap-client";
