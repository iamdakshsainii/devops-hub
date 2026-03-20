"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Terminal, Send, CheckCircle } from "lucide-react";

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
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md text-center border-green-500/20 bg-green-500/5">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Request Submitted!</h2>
            <p className="text-sm text-muted-foreground">Thank you for reaching out. The Admin Team has been notified and will review your request shortly.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center space-y-3 mb-12">
         <Terminal className="h-10 w-10 text-primary mx-auto" />
         <h1 className="text-3xl font-bold">Contact & Requests</h1>
         <p className="text-muted-foreground text-sm max-w-md mx-auto">
           Want to suggest a new module content? Request an event, setup guide, or report an issue directly to the admin.
         </p>
      </div>

      <Card>
         <CardHeader>
            <CardTitle className="text-lg">Submit a Request</CardTitle>
            <CardDescription>We strictly curate all published material independently.</CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold">Your Name</label>
                     <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Daksh" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold">Email Address</label>
                     <Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@domain.com" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Request Type</label>
                  <select 
                     required
                     value={form.reason}
                     onChange={e => setForm({...form, reason: e.target.value})}
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                     <option value="">Select a reason...</option>
                     <option value="CONTENT_SUGGESTION">Suggest Note or Learning Module</option>
                     <option value="EVENT_REQUEST">Suggest a Community Event</option>
                     <option value="RESOURCE_SUBMISSION">Submit resource URL</option>
                     <option value="OTHER">General Query</option>
                  </select>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Message & Details</label>
                  <Textarea 
                     required 
                     rows={5}
                     value={form.message} 
                     onChange={e => setForm({...form, message: e.target.value})} 
                     placeholder="Provide links or specific descriptions of what you'd like added to the DevOps Network..." 
                  />
               </div>

               <Button className="w-full gap-2" type="submit" disabled={loading}>
                  <Send className="h-4 w-4" /> {loading ? "Sending..." : "Send Request"}
               </Button>
            </form>
         </CardContent>
      </Card>
    </div>
  );
}
