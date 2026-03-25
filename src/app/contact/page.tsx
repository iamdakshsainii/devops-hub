"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle2, Sparkles, MessageSquare, ShieldCheck, Mail } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", reason: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          <CardContent className="pt-0 pb-0 space-y-6">
            <div className="h-20 w-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter">Transmission Sent</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                    Thank you for reaching out. The <span className="text-foreground font-bold">DevOps Network</span> architects have been notified and will review your mission brief shortly.
                </p>
            </div>
            <Button onClick={() => setSuccess(false)} variant="outline" className="rounded-full px-8 font-bold">Send Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 py-24 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
            
            {/* Left Content */}
            <div className="space-y-10">
                <div className="space-y-6">
                    <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                        Human Support
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] drop-shadow-sm">
                        Let's build<br /><span className="text-primary italic">something great.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md">
                        Suggest modules, request events, report infrastructure issues, or just share your vision for the Network.
                    </p>
                </div>

                <div className="space-y-6">
                    {[
                        { icon: Sparkles, title: "Content Suggestion", desc: "Found a missing link or topic? Let us curate it." },
                        { icon: MessageSquare, title: "Architecture Feedback", desc: "Report UI/UX issues or suggest platform features." },
                        { icon: ShieldCheck, title: "Incident Report", desc: "Spotted a broken tutorial or invalid resource?" }
                    ].map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start group">
                            <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center border border-border/40 group-hover:bg-primary/10 transition-colors">
                                <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black tracking-tight">{item.title}</h4>
                                <p className="text-xs text-muted-foreground font-medium opacity-80">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-border/40 max-w-xs">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Direct Channel</p>
                     <a href="mailto:admin@devopsnetwork.com" className="group flex items-center gap-3 text-sm font-bold hover:text-primary transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/20">
                            <Mail className="h-3.5 w-3.5" />
                        </div>
                        admin@devopsnetwork.com
                     </a>
                </div>
            </div>

            {/* Right Form */}
            <Card className="backdrop-blur-3xl bg-card/40 border-border/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/5 dark:ring-white/5">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black tracking-tight">Operation Brief</CardTitle>
                    <CardDescription className="text-[13px] font-medium">We strictly curate all published material independently.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Your Alias</label>
                                <Input 
                                    required 
                                    className="h-12 rounded-xl bg-background/50 border-white/10 focus:ring-primary/40 focus:border-primary/40 px-4 font-bold"
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                    placeholder="e.g. Daksh Saini" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Digital Mail</label>
                                <Input 
                                    required 
                                    type="email" 
                                    className="h-12 rounded-xl bg-background/50 border-white/10 focus:ring-primary/40 focus:border-primary/40 px-4 font-bold"
                                    value={form.email} 
                                    onChange={e => setForm({...form, email: e.target.value})} 
                                    placeholder="you@domain.com" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Request Class</label>
                            <select 
                                required
                                value={form.reason}
                                onChange={e => setForm({...form, reason: e.target.value})}
                                className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-background">Select objective...</option>
                                <option value="CONTENT_SUGGESTION" className="bg-background">Suggest Note or Learning Module</option>
                                <option value="EVENT_REQUEST" className="bg-background">Propose a Community Event</option>
                                <option value="RESOURCE_SUBMISSION" className="bg-background">Submit Premium Resource URL</option>
                                <option value="OTHER" className="bg-background">General Support Query</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Mission Details</label>
                            <Textarea 
                                required 
                                rows={5}
                                className="rounded-2xl bg-background/50 border-white/10 focus:ring-primary/40 focus:border-primary/40 p-4 font-medium leading-relaxed resize-none"
                                value={form.message} 
                                onChange={e => setForm({...form, message: e.target.value})} 
                                placeholder="Provide context, URLs, or specific descriptions of your request for the network..." 
                            />
                        </div>

                        <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all bg-primary hover:bg-primary/90 gap-3" type="submit" disabled={loading}>
                            {loading ? (
                                "Establishing Liaison..."
                             ) : (
                                <>
                                    <Send className="h-5 w-5" /> 
                                    Initiate Deployment
                                </>
                             )}
                        </Button>
                        
                        <p className="text-center text-[10px] text-muted-foreground font-medium opacity-60">
                           By submitting, you agree to our terms of community engagement.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
