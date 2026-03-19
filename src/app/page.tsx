import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal, BookOpen, Layers, Calendar, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full py-24 lg:py-32 xl:py-48 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-foreground/5 via-background to-background z-0"></div>
        
        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            
            <div className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-foreground/80 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 align-middle animate-pulse"></span>
              Join 10,000+ engineers mastering DevOps
            </div>

            <div className="space-y-4 max-w-4xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                The Open Platform for <br className="hidden md:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">
                  DevOps Mastery
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                A community-driven hub for sharing architecture notes, premium resources, and exclusive events. Build your profile and accelerate your engineering journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 px-8 rounded-full text-base gap-2 group">
                  Start Learning Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/resources" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full h-12 px-8 rounded-full text-base">
                  Explore Library
                </Button>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-16 md:py-24 bg-muted/20 border-t border-border/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl tracking-tight sm:text-4xl font-bold">Built for Modern Engineers</h2>
            <p className="text-muted-foreground md:text-lg">Everything you need to level up your systems design and cloud infrastructure skills in one unified platform.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-lg hover:border-foreground/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Architecture Notes</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Dive deep into crowd-sourced system design documentation and infrastructure as code snippets.
              </p>
              <Link href="/notes" className="text-sm font-medium flex items-center group-hover:text-foreground/80 transition-colors">
                Browse Notes <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-lg hover:border-foreground/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Layers className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resource Library</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Access curated PDF guides, tool configurations, and pivotal articles highly rated by the community.
              </p>
              <Link href="/resources" className="text-sm font-medium flex items-center group-hover:text-foreground/80 transition-colors">
                Discover Resources <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-lg hover:border-foreground/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Events</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Join live webinars, study groups, and hackathons hosted by industry veterans and cloud experts.
              </p>
              <Link href="/events" className="text-sm font-medium flex items-center group-hover:text-foreground/80 transition-colors">
                View Calendar <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics / Trust Section */}
      <section className="w-full py-16 bg-background border-t">
         <div className="container px-4 mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
               <div className="flex flex-col items-center justify-center space-y-2">
                 <Users className="h-5 w-5 text-muted-foreground mb-2" />
                 <h4 className="text-3xl font-bold">10k+</h4>
                 <p className="text-sm text-muted-foreground font-medium">Active Members</p>
               </div>
               <div className="flex flex-col items-center justify-center space-y-2">
                 <ShieldCheck className="h-5 w-5 text-muted-foreground mb-2" />
                 <h4 className="text-3xl font-bold">2.4k</h4>
                 <p className="text-sm text-muted-foreground font-medium">Curated Notes</p>
               </div>
               <div className="flex flex-col items-center justify-center space-y-2">
                 <Zap className="h-5 w-5 text-muted-foreground mb-2" />
                 <h4 className="text-3xl font-bold">500+</h4>
                 <p className="text-sm text-muted-foreground font-medium">Daily Upvotes</p>
               </div>
               <div className="flex flex-col items-center justify-center space-y-2">
                 <Terminal className="h-5 w-5 text-muted-foreground mb-2" />
                 <h4 className="text-3xl font-bold">100%</h4>
                 <p className="text-sm text-muted-foreground font-medium">Open Source</p>
               </div>
            </div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-24 bg-foreground text-background">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl tracking-tight sm:text-5xl font-bold mb-6 text-background">Ready to accelerate your career?</h2>
          <p className="mx-auto max-w-[600px] text-background/80 md:text-xl mb-10">
            Create your personalized engineering profile, upload your resume, and start sharing knowledge with thousands of peers.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full shadow-2xl hover:scale-105 transition-transform bg-background text-foreground hover:bg-background/90">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
