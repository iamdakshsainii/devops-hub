import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Layers, Calendar, ArrowRight, 
  GitBranch, Terminal, Zap, Users, Map, FileText, Search 
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PinnedBlogs } from "@/components/pinned-blogs";

export default async function Home() {
  // PRODUCTION NOTE: Using a Raw SQL query here as a robust fallback to ensure the 
  // 'isPinned' feature works reliably even during deployment transitions or 
  // dev-server cache refreshes where the generated Prisma Client might be stale.
  const pinnedBlogsRaw = await prisma.$queryRaw`
    SELECT * FROM "BlogPost" 
    WHERE status = 'PUBLISHED' AND "isPinned" = true 
    ORDER BY "updatedAt" DESC 
    LIMIT 5
  ` as any[];
  
  // Normalize the raw database response for the client component
  // Ensure robust date handling by converting Date objects to ISO strings for client components.
  const pinnedBlogs = pinnedBlogsRaw.map((b: any) => ({
      ...b,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
      updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt
  }));
  return (
    <div className="flex flex-col w-full overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-transparent">

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient Floating Ambient Light Spheres for backdrops framing nodeCoords downwards flaws. */}
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-primary/20 blur-[90px] animate-pulse duration-[5s] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-amber-500/10 blur-[90px] animate-pulse duration-[4s] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-500/15 blur-[100px] animate-pulse duration-[6s] pointer-events-none" />

        <div className="relative z-10 container px-6 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Headline */}
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
                <span className="block text-foreground">Learn DevOps</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-amber-500">The right way</span>
              </h1>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl leading-relaxed">
                Structured roadmaps, curated resources, and a community of engineers
                sharing what actually works in production — not just what looks good in a tutorial.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/roadmap">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base gap-2 group bg-primary hover:bg-primary/95 hover:shadow-[0_15px_35px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-300">
                  Start the Roadmap
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/modules">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base hover:bg-background hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 border-border/60">
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

        {/* Pinned Blogs Floating Button - Top Right Extreme */}
        <div className="absolute top-24 right-4 md:right-10 lg:right-16 z-40">
           <div className="scale-75 md:scale-90 origin-top-right">
              <PinnedBlogs blogs={pinnedBlogs} />
           </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32
          bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      </section>

      {/* ── What's inside ─────────────────────────────────────────────────── */}
      <section className="w-full py-24 bg-background/40 backdrop-blur-md border-t border-border/50">
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
                icon: Terminal,
                title: "Deeply Nested Modules",
                desc: "Step-by-step technological implementation guides covering core concepts with structured sub-topics and practical context.",
                href: "/modules",
                cta: "Browse Modules",
              },
              {
                icon: Layers,
                title: "Resource Library",
                desc: "Hand-picked videos, articles, and production architectures — vetted by living engineers, not algorithms.",
                href: "/resources",
                cta: "Explore Library",
              },
              {
                icon: FileText,
                title: "Quick Cheatsheets", 
                desc: "Instantly search and copy native commands for Kubernetes, Docker, Terraform, and CI/CD pipelines.",
                href: "/cheatsheets",
                cta: "View Cheatsheets",
              },
              {
                icon: BookOpen,
                title: "Engineering Blog",
                desc: "Deep-dive production stories, post-mortems, and authentic framework architectures without the filler.",
                href: "/blog",
                cta: "Read Blog",
              },
              // tools block removed - decommissioned
              {
                icon: Calendar,
                title: "Community Events",
                desc: "Webinars, workshops, and meetups submitted by the community and approved by the moderation team.",
                href: "/events",
                cta: "See Events",
              },
              {
                icon: Search,
                title: "Global Command Engine",
                desc: "Hit Cmd+K from anywhere to instantly scan across every single blog, module, tool, roadmap, and cheatsheet natively.",
                href: "#",
                cta: "Try pressing Cmd+K",
              },
              {
                icon: Users,
                title: "Active Network",
                desc: "Save resources, track your reading progress, upvote concepts, and grow with the engineers building the platform.",
                href: "/signup",
                cta: "Join Network",
              },
            ].map((f) => (
              <div key={f.title}
                className="group relative rounded-2xl border border-border/10 backdrop-blur-xl bg-card/60 p-7 hover:border-primary/30 shadow-md hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1 flex flex-col overflow-hidden">
                {/* Backlight flare effect forwards downwards flaws chords. */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-700 blur-2xl pointer-events-none bg-primary" />
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
      <section className="w-full py-24 border-t border-border/50 bg-background/20 backdrop-blur-md">
        <div className="container px-6 mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            <div className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Why DevOps Network
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
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border/10 backdrop-blur-xl bg-card/60 hover:border-primary/30 hover:bg-card/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl pointer-events-none bg-primary" />
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center
                    justify-center shrink-0 group-hover:scale-110 transition-transform">
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
      <section className="w-full py-24 border-t border-border/50 bg-foreground/95 backdrop-blur-xl text-background">
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