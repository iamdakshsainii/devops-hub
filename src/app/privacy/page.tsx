import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="container mx-auto px-6 py-24 max-w-4xl space-y-16">
        <header className="space-y-6 text-center">
            <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                legal & Transparency
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Privacy Policy</h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-bold tracking-tight max-w-2xl mx-auto leading-relaxed opacity-80">
                At <span className="text-foreground font-black">DevOps Network</span>, we respect your data as much as your engineering time.
            </p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
          
          <section className="space-y-4">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                1. Information We Collect
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                We only collect information absolutely necessary to provide you with the best experience on our platform. This includes:
             </p>
             <ul className="space-y-3 ps-6">
                <li className="text-muted-foreground font-medium underline decoration-primary/30 decoration-2 underline-offset-4"><strong>Account Metadata:</strong> Your name, email, and profile picture (via Google OAuth).</li>
                <li className="text-muted-foreground font-medium underline decoration-primary/30 decoration-2 underline-offset-4"><strong>Interaction Data:</strong> How you navigate roadmaps, notes, and community resources.</li>
                <li className="text-muted-foreground font-medium underline decoration-primary/30 decoration-2 underline-offset-4"><strong>Contributions:</strong> Any notes, comments, or links you securely submit to the network.</li>
             </ul>
          </section>

          <section className="space-y-4">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                2. Data Lifecycle
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                Your data is used strictly to enhance the core platform experience. We process it to:
             </p>
             <ul className="space-y-3 ps-6">
                <li className="text-muted-foreground font-medium">Personalize your unique learning journey and dashboard.</li>
                <li className="text-muted-foreground font-medium">Enforce community guidelines during resource moderation.</li>
                <li className="text-muted-foreground font-medium">Identify gaps in our roadmaps to improve global content.</li>
             </ul>
          </section>

          <section className="space-y-4">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                3. Security Standards
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                We never sell your data. We use industry-standard encryption and secure databases to store your information. Data may be shared with trusted third-party providers (like Auth providers) strictly for operational infrastructure.
             </p>
          </section>

          <section className="space-y-4 border-t border-dashed pt-12">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                4. Your Control
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                You have the absolute right to request access to, modification of, or total deletion of your personal data at any point. Reach out via our contact channels to initiate a scrub.
             </p>
          </section>
          
          <footer className="pt-8 border-t border-border/40 flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/40">
             <span>DevOps Network Legal</span>
             <span>Last Updated: March 2026</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
