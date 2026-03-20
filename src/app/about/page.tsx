import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter, Mail, Globe, Heart, Shield, Award } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 z-0" />
        <div className="container mx-auto max-w-5xl px-4 py-20 md:py-28 text-center relative z-10 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">DevOps Network</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A comprehensive, structured platform designed to bridge the gap between core systems and modern continuous delivery.
          </p>
        </div>
      </div>

      {/* Profile & Handles */}
      <div className="container mx-auto max-w-5xl px-4 py-16 grid md:grid-cols-[280px_1fr] gap-12 items-start">
        <div className="space-y-6 sticky top-24">
          <div className="relative group mx-auto md:mx-0 w-max">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-primary/40 blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
            <div className="h-48 w-48 rounded-3xl bg-secondary border flex items-center justify-center relative overflow-hidden">
              <span className="text-5xl">👑</span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">Admin / Creator</h2>
            <p className="text-sm text-muted-foreground mt-1">Full-Stack & DevOps Engineer</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <Link href="https://github.com" target="_blank">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><Github className="h-4 w-4" /></Button>
            </Link>
            <Link href="https://linkedin.com" target="_blank">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full text-blue-600"><Linkedin className="h-4 w-4" /></Button>
            </Link>
            <Link href="https://twitter.com" target="_blank">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full text-sky-400"><Twitter className="h-4 w-4" /></Button>
            </Link>
            <Link href="mailto:admin@example.com">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><Mail className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>

        <div className="space-y-10">
          <section className="space-y-4">
            <h3 className="text-2xl font-bold">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              DevOps Network was built with a single goal in mind: simplifying complexity.
              The infrastructure and cloud-native landscape moves incredibly fast. Typical guides are either overloaded with theory or outdated static files.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This platform acts as a lived visual layout, providing structured roadmaps, independent standalone module trackers, and curated feeds ensuring you learn continuous operations natively bounding standards.
            </p>
          </section>

          <section className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 border rounded-2xl bg-card/50 space-y-2">
              <Heart className="h-6 w-6 text-primary" />
              <h4 className="font-bold">Community Driven</h4>
              <p className="text-xs text-muted-foreground">Built to serve the ecosystem without corporate paywalls workflows.</p>
            </div>
            <div className="p-5 border rounded-2xl bg-card/50 space-y-2">
              <Shield className="h-6 w-6 text-emerald-500" />
              <h4 className="font-bold">Production Graded</h4>
              <p className="text-xs text-muted-foreground">Standard setups extracted directly from live configurations maps models.</p>
            </div>
          </section>

          <section className="pt-8 border-t space-y-4">
            <h4 className="font-bold text-lg">Reach Out & Feedbacks</h4>
            <p className="text-sm text-muted-foreground">Have feature requests, notes to share, or consulting inquires? Drop a suggestions on the contact form below or reach natively directly inside social feeds lists bounding streams!</p>
            <Link href="/contact">
              <Button className="rounded-full">Get In Touch</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
