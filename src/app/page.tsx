import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Layers, Calendar, ArrowRight,
  GitBranch, Terminal, Zap, Users, Map,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-background">

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glow — top-left */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full
          bg-primary/10 blur-[120px] pointer-events-none" />
        {/* Glow — bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full
          bg-primary/8 blur-[100px] pointer-events-none" />

        <div className="relative z-10 container px-6 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-8">

            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border
              bg-background/80 backdrop-blur px-4 py-1.5 text-xs font-semibold
              text-muted-foreground tracking-wide shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Free · Open · Community-built
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                <span className="block text-foreground">Learn DevOps.</span>
                <span className="block text-foreground/30">The right way.</span>
              </h1>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl leading-relaxed">
                Structured roadmaps, curated resources, and a community of engineers
                sharing what actually works in production — not just what looks good in a tutorial.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link href="/roadmap">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base gap-2 group">
                  Start the Roadmap
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/modules">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base">
                  Browse Modules
                </Button>
              </Link>
            </div>

            {/* Tool strip */}
            <div className="flex flex-wrap justify-center gap-2 pt-4 max-w-xl">
              {["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "Linux", "Kafka", "Prometheus"].map((t) => (
                <span key={t}
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60
                  border border-border rounded-full px-3 py-1">
                  {t}
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32
          bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ── What's inside ─────────────────────────────────────────────────── */}
      <section className="w-full py-24 bg-muted/20 border-t border-border/50">
        <div className="container px-6 mx-auto max-w-6xl">

          <div className="text-center mb-16 space-y-3 max-w-xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              What's inside
            </p>
            <h2 className="text-4xl font-black tracking-tight">
              Everything in one place.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              No jumping between YouTube, Notion, and random blogs.
              The whole learning loop — here.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Map,
                title: "Structured Roadmaps",
                desc: "Phase-by-phase paths that mirror how real DevOps teams work — not how textbooks describe it.",
                href: "/roadmap",
                cta: "View Roadmap",
              },
              {
                icon: BookOpen,
                title: "Learning Modules",
                desc: "Deep-dive modules covering every core concept, each with curated resources and practical context.",
                href: "/modules",
                cta: "Browse Modules",
              },
              {
                icon: Layers,
                title: "Resource Library",
                desc: "Hand-picked videos, articles, tools and notes — vetted by engineers, not algorithms.",
                href: "/resources",
                cta: "Explore Library",
              },
              {
                icon: Calendar,
                title: "Community Events",
                desc: "Webinars, workshops, and meetups submitted by the community and approved by admins.",
                href: "/events",
                cta: "See Events",
              },
              {
                icon: Users,
                title: "Open Community",
                desc: "Submit resources, share events, write notes — the platform grows with the engineers using it.",
                href: "/signup",
                cta: "Join Now",
              },
              {
                icon: GitBranch,
                title: "Production-Grounded",
                desc: "Configs and architectures from real setups — not simplified toy examples built for demos.",
                href: "/modules",
                cta: "See Modules",
              },
            ].map((f) => (
              <div key={f.title}
                className="group relative rounded-2xl border bg-card p-7 hover:border-primary/30
                hover:shadow-md transition-all duration-200 flex flex-col">
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-6 right-6 h-px bg-primary scale-x-0
                  group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />

                <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center
                  justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow mb-5">
                  {f.desc}
                </p>
                <Link href={f.href}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground
                  flex items-center gap-1 group-hover:text-primary transition-colors">
                  {f.cta} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why this is different ──────────────────────────────────────────── */}
      <section className="w-full py-24 border-t border-border/50 bg-background">
        <div className="container px-6 mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            <div className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Why DevOps Hub
              </p>
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                Not another<br />YouTube playlist.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                There's no shortage of DevOps content — there's a shortage of structure.
                Tutorials exist in isolation. Playlists cover tools, not systems. Nothing
                connects what you're learning to what production actually looks like.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every resource here is connected to a roadmap. Every module has context.
                Every event is community-submitted and admin-vetted. It's a system,
                not a content dump.
              </p>
              <Link href="/about">
                <Button variant="outline" className="rounded-full gap-2 mt-2">
                  Read the full story <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {[
                { label: "Roadmaps built around real team workflows" },
                { label: "Modules with production context, not just syntax" },
                { label: "Resources curated by engineers, not scraped" },
                { label: "Community that submits, upvotes, and improves content" },
                { label: "Events from real practitioners in the community" },
                { label: "Free forever — no paywalls, no subscriptions" },
              ].map((item) => (
                <div key={item.label}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border
                  bg-muted/30 hover:border-primary/20 hover:bg-muted/50 transition-colors">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center
                    justify-center shrink-0">
                    <Zap className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 border-t border-border bg-foreground text-background">
        <div className="container px-6 mx-auto max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase
            tracking-widest text-background/50 border border-background/10
            rounded-full px-4 py-1.5">
            <Terminal className="h-3.5 w-3.5" />
            Start here
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight text-background">
            Ready to build<br />real infrastructure?
          </h2>
          <p className="text-background/60 text-lg max-w-lg mx-auto leading-relaxed">
            Start with the roadmap, pick a module, or browse the resource library.
            Your path, your pace. Always free.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" variant="secondary"
                className="h-12 px-8 rounded-full text-base bg-background
                text-foreground hover:bg-background/90 gap-2 group">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button size="lg" variant="ghost"
                className="h-12 px-8 rounded-full text-base text-background/70
                hover:text-background hover:bg-background/10 border border-background/20">
                View Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}