import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Layers, Calendar, ArrowRight, ArrowUpRight,
  GitBranch, Terminal, Zap, Users, Map, FileText, Search,
  ChevronRight, Sparkles, CheckCircle2, Star
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PinnedBlogs } from "@/components/pinned-blogs";

export default async function Home() {
  const pinnedBlogsRaw = await prisma.$queryRaw`
    SELECT * FROM "BlogPost"
    WHERE status = 'PUBLISHED' AND "isPinned" = true
    ORDER BY "updatedAt" DESC
    LIMIT 5
  ` as any[];

  const pinnedBlogs = pinnedBlogsRaw.map((b: any) => ({
    ...b,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt
  }));

  const features = [
    {
      icon: Map,
      title: "Structured Roadmaps",
      desc: "Phase-by-phase paths that mirror how real DevOps teams work — not how textbooks describe it.",
      href: "/roadmap",
      cta: "View Roadmap",
      accent: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      border: "group-hover:border-emerald-500/30",
    },
    {
      icon: Terminal,
      title: "Deep-Dive Modules",
      desc: "Step-by-step guides covering core concepts with structured sub-topics and real production context.",
      href: "/modules",
      cta: "Browse Modules",
      accent: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
      border: "group-hover:border-purple-500/30",
    },
    {
      icon: Layers,
      title: "Resource Library",
      desc: "Hand-picked videos, articles, and production architectures vetted by real engineers.",
      href: "/resources",
      cta: "Explore Library",
      accent: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
      border: "group-hover:border-blue-500/30",
    },
    {
      icon: FileText,
      title: "Quick Cheatsheets",
      desc: "Instantly look up native commands for Kubernetes, Docker, Terraform, and CI/CD — no fluff.",
      href: "/cheatsheets",
      cta: "View Cheatsheets",
      accent: "from-cyan-500/20 to-cyan-500/5",
      iconColor: "text-cyan-500",
      iconBg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
      border: "group-hover:border-cyan-500/30",
    },
    {
      icon: BookOpen,
      title: "Engineering Blog",
      desc: "Deep-dive production stories, post-mortems, and real architectures without the filler.",
      href: "/blog",
      cta: "Read Blog",
      accent: "from-orange-500/20 to-orange-500/5",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10 group-hover:bg-orange-500/20",
      border: "group-hover:border-orange-500/30",
    },
    {
      icon: Calendar,
      title: "Community Events",
      desc: "Webinars, workshops, and meetups submitted by the community and approved by the team.",
      href: "/events",
      cta: "See Events",
      accent: "from-pink-500/20 to-pink-500/5",
      iconColor: "text-pink-500",
      iconBg: "bg-pink-500/10 group-hover:bg-pink-500/20",
      border: "group-hover:border-pink-500/30",
    },
    {
      icon: Search,
      title: "Global Command Engine",
      desc: "Hit ⌘K from anywhere to instantly scan every blog, module, roadmap, and cheatsheet.",
      href: "#",
      cta: "Try ⌘K",
      accent: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10 group-hover:bg-primary/20",
      border: "group-hover:border-primary/30",
    },
    {
      icon: Users,
      title: "Active Network",
      desc: "Save resources, track progress, upvote concepts, and grow alongside engineers building the platform.",
      href: "/signup",
      cta: "Join Network",
      accent: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
      border: "group-hover:border-violet-500/30",
    },
  ];

  const techStack = ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "Linux", "Kafka", "Prometheus", "ArgoCD", "Helm"];

  const differentiators = [
    "Roadmaps built around real team workflows",
    "Modules with production context, not just syntax",
    "Resources curated by engineers, not scraped",
    "Community that submits, upvotes, and improves content",
    "Events from real practitioners in the community",
    "Free forever — no paywalls, no subscriptions",
  ];

  return (
    <div className="flex flex-col w-full overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden">

        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(var(--foreground-rgb, 0,0,0), 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(var(--foreground-rgb, 0,0,0), 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px"
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none" />

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px] pointer-events-none" />

        <div className="relative z-10 container px-6 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-background/60 backdrop-blur-sm text-xs font-bold text-foreground/70 shadow-sm hover:border-primary/30 hover:text-foreground transition-all cursor-default">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Always Free & Open Access
              <span className="text-muted-foreground/40">·</span>
              <span className="text-primary">No paywalls</span>
            </div>

            {/* Heading */}
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-black tracking-[-0.03em] leading-[0.93]">
                <span className="block">Learn DevOps</span>
                <span className="block bg-gradient-to-r from-primary via-violet-500 to-amber-500 bg-clip-text text-transparent">
                  the right way.
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed font-medium">
                Structured roadmaps, curated resources, and a community of engineers
                sharing what actually works in production.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link href="/roadmap">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl text-[15px] font-bold gap-2 group shadow-[0_8px_30px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 transition-all duration-300">
                  Start the Roadmap
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/modules">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl text-[15px] font-bold hover:-translate-y-0.5 transition-all duration-300 border-border/50 hover:border-border bg-background/50 backdrop-blur-sm">
                  Browse Modules
                </Button>
              </Link>
            </div>

            {/* Tech tags */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl pt-2">
              {techStack.map((t) => (
                <span key={t} className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/50 border border-border/30 rounded-full px-3 py-1 hover:border-border/60 hover:text-muted-foreground/70 transition-all cursor-default">
                  {t}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 text-center">
              {[
                { val: "12+", label: "Roadmap phases" },
                { val: "50+", label: "Modules" },
                { val: "100%", label: "Free forever" },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-black tracking-tight">{val}</span>
                  <span className="text-[11px] text-muted-foreground/60 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pinned blogs — desktop right float */}
        <div className="hidden xl:block absolute top-12 right-8 z-20 animate-in fade-in slide-in-from-right-6 duration-700">
          <PinnedBlogs blogs={pinnedBlogs} />
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ── Features Grid ── */}
      <section className="w-full py-24 bg-background relative">
        {/* Top border glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="container px-6 mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">What's inside</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Everything in one place.</h2>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
              No jumping between YouTube, Notion, and random blogs. The whole learning loop — here.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className={`
  group relative rounded-2xl border border-border/20 bg-card/40 p-6
  hover:bg-card/70 active:bg-card/70 transition-all duration-300
  hover:-translate-y-1 active:scale-[0.98]
  hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]
  flex flex-col gap-4 overflow-hidden
  ${f.border}
`}
              >
                {/* BG gradient on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${f.accent} pointer-events-none rounded-2xl`} />

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />

                <div className={`relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>

                <div className="relative space-y-1.5 flex-1">
                  <h3 className="text-[15px] font-bold leading-tight">{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>

                <div className={`relative flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground/50 group-hover:text-foreground/70 transition-colors`}>
                  {f.cta}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Different ── */}
      <section className="w-full py-24 bg-foreground/[0.02] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="container px-6 mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text side */}
            <div className="space-y-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Why DevOps Network</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
                Not another<br />
                <span className="text-muted-foreground">YouTube playlist.</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  There's no shortage of DevOps content — there's a shortage of <strong className="text-foreground font-semibold">structure</strong>. Tutorials exist in isolation. Playlists cover tools, not systems.
                </p>
                <p>
                  Every resource here is connected to a roadmap. Every module has context. Every event is community-submitted and admin-vetted.
                </p>
              </div>
              <Link href="/about">
                <Button variant="outline" className="rounded-xl gap-2 h-11 px-6 font-bold hover:-translate-y-0.5 transition-all border-border/50">
                  Read the full story <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Checklist side */}
            <div className="space-y-2.5">
              {differentiators.map((item, i) => (
                <div
                  key={item}
                  className="group flex items-center gap-3.5 p-4 rounded-xl border border-border/20 bg-card/40 hover:bg-card/70 active:bg-card/70 hover:border-primary/25 active:border-primary/25 hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-default"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-[13.5px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="w-full py-16 border-y border-border/20 bg-background">
        <div className="container px-6 mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="text-center sm:text-left">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-2">Built for engineers</p>
              <p className="text-2xl font-black tracking-tight">Learning that actually sticks.</p>
            </div>
            <div className="flex items-center gap-8">
              {[
                { n: "100%", t: "Free forever" },
                { n: "0", t: "Paywalls" },
                { n: "∞", t: "Resources" },
              ].map(({ n, t }) => (
                <div key={t} className="text-center">
                  <p className="text-3xl font-black tracking-tight text-primary">{n}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full py-28 relative overflow-hidden bg-foreground dark:bg-foreground/95">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

        <div className="relative container px-6 mx-auto max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-background/40 border border-background/10 rounded-full px-4 py-1.5">
            <Terminal className="h-3.5 w-3.5" />
            Start here
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] leading-tight text-background">
            Ready to build<br />real infrastructure?
          </h2>

          <p className="text-background/50 text-lg max-w-md mx-auto leading-relaxed font-medium">
            Start with the roadmap, pick a module, or browse the library. Your path, your pace.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" variant="secondary"
                className="h-12 px-8 rounded-xl text-[15px] font-bold bg-background text-foreground hover:bg-background/90 gap-2 group hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button size="lg" variant="ghost"
                className="h-12 px-8 rounded-xl text-[15px] font-bold text-background/60 hover:text-background hover:bg-background/8 border border-background/15 hover:border-background/25 transition-all duration-300 hover:-translate-y-0.5">
                View Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}