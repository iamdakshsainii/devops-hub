"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Instagram, Mail, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ words }: { words: string[] }) {
  const [wi, setWi] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[wi];
    let t: ReturnType<typeof setTimeout>;
    if (!del && text.length < word.length)
      t = setTimeout(() => setText(word.slice(0, text.length + 1)), 75);
    else if (!del)
      t = setTimeout(() => setDel(true), 2000);
    else if (del && text.length > 0)
      t = setTimeout(() => setText(text.slice(0, -1)), 35);
    else { setDel(false); setWi((i) => (i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [text, del, wi, words]);

  return <span className="text-primary">{text}<span className="animate-pulse">|</span></span>;
}

// ── Contact row ───────────────────────────────────────────────────────────────
function CRow({ label, sub, href, icon: Icon }:
  { label: string; sub: string; href: string; icon: React.ElementType }) {
  return (
    <Link href={href} target={href.startsWith("http") ? "_blank" : undefined}>
      <div className="group flex items-center justify-between p-4 rounded-xl border border-border
        hover:border-primary/40 hover:bg-muted/40 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center
            group-hover:bg-primary/10 transition-colors">
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Creator intro — brief, human, not the focus ── */}
      <section className="container mx-auto max-w-4xl px-6 pt-20 pb-16">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-6 bg-primary inline-block" />
              Who built this
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Hey, I'm Daksh.
              </h1>
              <p className="text-lg text-muted-foreground font-light">
                DevOps engineer, full-stack enthusiast, and the{" "}
                <Typewriter words={["founder.", "creator.", "admin.", "person who built this."]} />
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-lg">
              I built DevOps Hub because I was tired of the same problem every engineer faces
              when trying to get serious about DevOps — too much content, no structure, and
              nothing that reflects what production actually looks like.
            </p>

            <div className="flex gap-2 pt-1">
              {[
                { href: "https://github.com/iamdakshsainii", icon: Github, label: "GitHub" },
                { href: "https://www.linkedin.com/in/daksh-saini", icon: Linkedin, label: "LinkedIn" },
                { href: "https://instagram.com/iamdakshsainii", icon: Instagram, label: "Instagram" },
                { href: "mailto:sainidaksh70@gmail.com", icon: Mail, label: "Email" },
              ].map((s) => (
                <Link key={s.label} href={s.href} target="_blank">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                    <s.icon className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Avatar — small, not the hero */}
          <div className="hidden md:flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-xl" />
              <div className="relative h-36 w-36 rounded-3xl bg-muted border overflow-hidden">
                <Image src="/admin.jpg" alt="Daksh Saini" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-dashed" />

      {/* ── The problem ── */}
      <section className="container mx-auto max-w-4xl px-6 py-16 grid md:grid-cols-[180px_1fr] gap-12">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">The problem</p>
          <h2 className="text-3xl font-black leading-tight">Learning<br />DevOps is<br />broken.</h2>
        </div>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-7">
            Every engineer starting out in DevOps hits the same wall. There's no shortage of content —
            there's a shortage of <em>structure</em>. Tutorials exist in isolation. YouTube playlists
            cover tools, not systems. Documentation assumes you already know everything.
            And nothing connects the dots between learning a tool and using it in production.
          </p>

          {/* Pain points */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Scattered tutorials with no clear progression",
              "Outdated content that doesn't reflect real infra",
              "No community that speaks plainly about production",
              "Resources dumped with no context or sequence",
              "Roadmaps that list tools but skip the why",
              "Nowhere to find what actually works at scale",
            ].map((p) => (
              <div key={p} className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-snug">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-dashed" />

      {/* ── The solution ── */}
      <section className="container mx-auto max-w-4xl px-6 py-16 grid md:grid-cols-[180px_1fr] gap-12">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">The solution</p>
          <h2 className="text-3xl font-black leading-tight">That's what<br />we're here<br />to fix.</h2>
        </div>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-7">
            DevOps Hub is built around one idea: structure beats volume. You don't need more
            content — you need a map, vetted resources that actually matter, and a community
            of engineers sharing what works in the real world.
          </p>

          {/* Solutions */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Structured roadmaps that mirror how real teams operate",
              "Curated resources — no noise, no affiliate filler",
              "Module-based learning with production-level context",
              "Community-submitted tools, notes, and events",
              "Admin-vetted content so quality stays high",
              "Free. Always. No paywalls, no subscriptions",
            ].map((s) => (
              <div key={s} className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-dashed" />

      {/* ── Values ── */}
      <section className="container mx-auto max-w-4xl px-6 py-16 space-y-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Principles</p>
          <h2 className="text-2xl font-black">Three things this platform never compromises on.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border">
          {[
            {
              n: "01",
              title: "Honest over hyped",
              desc: "If a tool is hard to operate in production, we say so. No sugarcoating difficulty to seem more beginner-friendly.",
            },
            {
              n: "02",
              title: "Structure over noise",
              desc: "Every resource, module, and roadmap connects to a bigger map. Nothing here is a random dump of links.",
            },
            {
              n: "03",
              title: "Community over solo",
              desc: "The best knowledge comes from engineers shipping real systems. This platform exists to surface and share that.",
            },
          ].map((v) => (
            <div key={v.n} className="bg-background p-8 space-y-3">
              <p className="text-5xl font-black text-muted-foreground/10 leading-none">{v.n}</p>
              <h3 className="font-bold leading-tight">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-dashed" />

      {/* ── Contact ── */}
      <section className="container mx-auto max-w-4xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Get in touch</p>
          <h2 className="text-4xl font-black leading-tight">
            Want to help<br />build this?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Feature ideas, resource suggestions, collaboration proposals, or just feedback —
            everything helps. Reach out on any platform.
          </p>
        </div>

        <div className="space-y-2">
          {[
            { label: "Drop a message", sub: "Via the contact form", href: "/contact", icon: Mail },
            { label: "Connect on LinkedIn", sub: "Professional enquiries", href: "https://www.linkedin.com/in/daksh-saini", icon: Linkedin },
            { label: "Follow on Instagram", sub: "Behind the scenes", href: "https://instagram.com/iamdakshsainii", icon: Instagram },
            { label: "See the code", sub: "github.com/iamdakshsainii", href: "https://github.com/iamdakshsainii", icon: Github },
          ].map((c) => <CRow key={c.label} {...c} />)}
        </div>
      </section>

    </div>
  );
}