"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Instagram, Mail, ArrowUpRight, CheckCircle2, XCircle, Sparkles, Target, Zap, User as UserIcon } from "lucide-react";
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

  return <span className="text-primary font-black">{text}<span className="animate-pulse">|</span></span>;
}

// ── Contact row ───────────────────────────────────────────────────────────────
function CRow({ label, sub, href, icon: Icon }:
  { label: string; sub: string; href: string; icon: React.ElementType }) {
  return (
    <Link href={href} target={href.startsWith("http") ? "_blank" : undefined}>
      <div className="group flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-background/40 backdrop-blur-md
        hover:border-primary/40 hover:bg-muted/40 transition-all duration-300 shadow-sm hover:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center
            group-hover:bg-primary/10 group-hover:rotate-6 transition-all">
            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight">{label}</p>
            <p className="text-xs text-muted-foreground font-medium opacity-70">{sub}</p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* ── Hero section ── */}
      <section className="container mx-auto max-w-5xl px-6 pt-32 pb-24 relative">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                 The Creator
               </Badge>
               <span className="h-px w-12 bg-border inline-block" />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] drop-shadow-sm">
                Hey, I'm Daksh.
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground/90 font-bold tracking-tight">
                DevOps engineer, full-stack enthusiast, and the{" "}
                <Typewriter words={["founder.", "creator.", "architect.", "visionary builder."]} />
              </p>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl font-medium">
              I built <span className="text-foreground font-black">DevOps Network</span> because I was tired of the same problem every engineer faces
              when trying to get serious about specialized infrastructure — too much noise, no structure, and zero
              context for actual production scale.
            </p>

            <div className="flex gap-3 pt-2">
              {[
                { href: "https://github.com/iamdakshsainii", icon: Github, label: "GitHub" },
                { href: "https://www.linkedin.com/in/daksh-saini", icon: Linkedin, label: "LinkedIn" },
                { href: "https://instagram.com/iamdakshsainii", icon: Instagram, label: "Instagram" },
                { href: "mailto:sainidaksh70@gmail.com", icon: Mail, label: "Email" },
              ].map((s) => (
                <Link key={s.label} href={s.href} target="_blank">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-card/40 backdrop-blur-sm border-border/40 hover:bg-primary/10 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                    <s.icon className="h-5 w-5" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center relative">
               <div className="absolute -inset-10 rounded-full bg-primary/10 blur-[60px] animate-pulse" />
               <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-[3rem] bg-gradient-to-br from-card to-background p-1 border border-white/10 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                  <Image 
                    src="/admin.jpg" 
                    alt="Daksh Saini" 
                    fill 
                    className="object-cover rounded-[2.8rem] transition-transform duration-1000 group-hover:scale-110" 
                    priority
                  />
               </div>
               
               {/* Floating Badges */}
               <div className="absolute -bottom-6 -right-6 bg-background/80 backdrop-blur-xl border border-border/40 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce shadow-primary/10">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Status</p>
                    <p className="text-xs font-bold">Always Shipping</p>
                  </div>
               </div>
          </div>
        </div>
      </section>

      {/* ── The Problem Section ── */}
      <section className="bg-muted/30 border-y border-dashed py-24">
        <div className="container mx-auto max-w-5xl px-6 grid md:grid-cols-[200px_1fr] gap-16">
          <div className="space-y-4">
             <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/5 font-black uppercase tracking-widest text-[10px] rounded-full px-3 py-1">The Crisis</Badge>
             <h2 className="text-4xl font-black leading-none tracking-tighter">Learning<br />DevOps is<br /><span className="text-destructive underline decoration-2 underline-offset-4">Broken.</span></h2>
          </div>

          <div className="space-y-10">
            <p className="text-xl text-muted-foreground/80 leading-relaxed font-medium">
              Every engineer starting out in infrastructure hits the same wall. There's no shortage of content —
              there's a shortage of <span className="text-foreground font-black">curation and structure</span>. Tutorials exist in isolation. YouTube playlists
              cover tools, not architectural systems. Documentation assumes you're already an expert.
              Nothing connects the dots between a "Hello World" deployment and production-grade stability.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Scattered tutorials with zero progression",
                "Outdated content that fails in production",
                "Tool-focused learning instead of system logic",
                "Resources dumped without context or sequence",
                "Roadmaps that list tools but skip the 'why'",
                "Nowhere to find true production-ready patterns",
              ].map((p) => (
                <div key={p} className="flex items-start gap-3 p-5 rounded-2xl bg-destructive/5 border border-destructive/10 backdrop-blur-md hover:bg-destructive/10 transition-colors group">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 group-hover:rotate-12 transition-transform" />
                  <p className="text-[15px] text-muted-foreground font-bold leading-snug">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Solution Section ── */}
      <section className="py-24">
        <div className="container mx-auto max-w-5xl px-6 grid md:grid-cols-[200px_1fr] gap-16">
          <div className="space-y-4 order-2 md:order-1">
             <p className="text-xl text-muted-foreground/80 leading-relaxed font-medium">
               <span className="text-foreground font-black">DevOps Network</span> is built around one singular idea: <span className="text-primary italic">Structure beats volume.</span> You don't need more
               content — you need a map, vetted resources that actually move the needle, and a community
               of engineers sharing what survives in the real world.
             </p>

             <div className="grid sm:grid-cols-2 gap-4 mt-8">
               {[
                 "Roadmaps that mirror actual team workflows",
                 "Curated resources — zero noise, zero filler",
                 "Module-based learning with deep context",
                 "Community-vetted tools, notes, and events",
                 "High-level engineering patterns revealed",
                 "Free. Always. Open for the true builders",
               ].map((s) => (
                 <div key={s} className="flex items-start gap-3 p-5 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-md hover:bg-primary/10 transition-colors group">
                   <CheckCircle2 className="h-5 w-5 text-primary shrink-0 group-hover:scale-125 transition-transform" />
                   <p className="text-[15px] text-muted-foreground font-bold leading-snug">{s}</p>
                 </div>
               ))}
             </div>
          </div>

          <div className="space-y-4 text-right order-1 md:order-2">
             <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-black uppercase tracking-widest text-[10px] rounded-full px-3 py-1">The Cure</Badge>
             <h2 className="text-4xl font-black leading-none tracking-tighter">Engineered<br />for the<br /><span className="text-primary underline decoration-2 underline-offset-4">Top 1%.</span></h2>
          </div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="container mx-auto max-w-5xl px-6 py-24 space-y-16">
        <div className="text-center space-y-4">
           <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">Our Core Principles</Badge>
           <h2 className="text-4xl md:text-5xl font-black tracking-tighter">We never compromise.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              n: "01",
              title: "Honest over Hyped",
              icon: Sparkles,
              desc: "If a tool is a nightmare to operate in production, we say exactly that. No sugarcoating just to be beginner-friendly.",
            },
            {
              n: "02",
              title: "Structure over Noise",
              icon: Target,
              desc: "Every resource, module, and roadmap connects to a broader vision. Nothing here is a random dump of links.",
            },
            {
              n: "03",
              title: "Community Intelligence",
              icon: UserIcon,
              desc: "The best knowledge comes from engineers in the trenches. We exist to surface and scale that intelligence.",
            },
          ].map((v) => (
            <div key={v.n} className="group relative bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 shadow-xl overflow-hidden hover:border-primary/40 transition-all duration-500 hover:-translate-y-2">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               <div className="flex items-center justify-between mb-6">
                 <p className="text-6xl font-black text-muted-foreground/10 leading-none">{v.n}</p>
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                    <v.icon className="h-6 w-6 text-primary" />
                 </div>
               </div>
               <h3 className="text-xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{v.title}</h3>
               <p className="text-muted-foreground font-medium leading-relaxed opacity-90">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section className="bg-muted/30 border-t border-dashed py-32">
        <div className="container mx-auto max-w-5xl px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] rounded-full px-4 py-1.5 border-border/60">Collaboration</Badge>
            <h2 className="text-5xl md:text-6xl font-black leading-[0.9] tracking-tighter">
              Want to help<br /><span className="text-primary italic">build the future?</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-md">
              Feature ideas, resource suggestions, collaboration, or just raw feedback —
              every contribution helps us scale the mission.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Drop a Message", sub: "Priority communication", href: "/contact", icon: Mail },
              { label: "LinkedIn Connection", sub: "Professional enquiries", href: "https://www.linkedin.com/in/daksh-saini", icon: Linkedin },
              { label: "Follow the Journey", sub: "@iamdakshsainii", href: "https://instagram.com/iamdakshsainii", icon: Instagram },
              { label: "The Source Code", sub: "Contribute on GitHub", href: "https://github.com/iamdakshsainii", icon: Github },
            ].map((c) => <CRow key={c.label} {...c} />)}
          </div>
        </div>
      </section>

    </div>
  );
}