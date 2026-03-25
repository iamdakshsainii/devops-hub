import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="container mx-auto px-6 py-24 max-w-4xl space-y-16">
        <header className="space-y-6 text-center">
            <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                governance & compliance
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Terms of Service</h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-bold tracking-tight max-w-2xl mx-auto leading-relaxed opacity-80">
                Welcome to <span className="text-foreground font-black">DevOps Network</span>. By using our platform, you agree to these operating standards.
            </p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
          
          <section className="space-y-4">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                1. Acceptance of Terms
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                By accessing and using DevOps Network, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our service.
             </p>
          </section>

          <section className="space-y-4 border-t border-dashed pt-12">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                2. User Core Conduct
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                You are solely responsible for any content you post (notes, resources, events). You agree not to post content that is:
             </p>
             <ul className="space-y-3 ps-6">
                <li className="text-muted-foreground font-medium underline decoration-destructive/30 decoration-2 underline-offset-4">Illegal, harmful, or abusive in nature.</li>
                <li className="text-muted-foreground font-medium underline decoration-destructive/30 decoration-2 underline-offset-4">Infringing on any third parties' intellectual property.</li>
                <li className="text-muted-foreground font-medium underline decoration-destructive/30 decoration-2 underline-offset-4">Spam or malicious code intended for service disruption.</li>
             </ul>
             <p className="text-sm font-black text-amber-500 bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 mt-4 leading-snug">
                Moderators reserve the right to prune any content or suspend any account that violates these guidelines without prior notice or refund.
             </p>
          </section>

          <section className="space-y-4 border-t border-dashed pt-12">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                3. Intellectual Capital
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                The roadmaps, curated content, design language, and original resources provided by DevOps Network are protected by global intellectual property laws. You may not reproduce our core platform code or premium content without explicit written permission.
             </p>
          </section>

          <section className="space-y-4 border-t border-dashed pt-12">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                4. Disclaimer of Warranties
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium underline decoration-muted/30 underline-offset-4">
                Our service is provided "as is" and "as available". We make no warranties, expressed or implied, regarding the reliability or availability of the platform. We are not responsible for the accuracy of community-submitted resources or notes.
             </p>
          </section>

          <section className="space-y-4 border-t border-dashed pt-12">
             <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full inline-block" />
                5. Limitation of Liability
             </h2>
             <p className="text-muted-foreground leading-relaxed font-medium">
                In no event shall <span className="text-foreground font-black">DevOps Network</span> or its creators be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use our infrastructure.
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
