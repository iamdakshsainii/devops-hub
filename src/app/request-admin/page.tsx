"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Lock, Shield } from "lucide-react";
import Link from "next/link";

export default function RequestAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState<{ isBlocked: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/requests/check")
      .then(res => res.json())
      .then(data => {
         if (data.isBlocked) {
            setCooldown(data);
         }
      }).catch(() => {});
  }, []);

  if (status === "loading") return <div className="p-12 text-center text-muted-foreground">Loading...</div>;
  if (!session) { router.push("/login"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError("Reason is required"); return; }
    
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, category })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.message || "Request failed or already submitted");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-16 space-y-4">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
         <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Card className="border shadow-lg">
        <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
               <Shield className="h-6 w-6" />
            </div>
          <CardTitle className="text-xl">Apply for Admin</CardTitle>
          <CardDescription>We're always looking for stewards to help maintain the modules index!</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4 py-4">
               <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <Shield className="h-6 w-6" />
               </div>
               <p className="text-sm font-bold text-foreground">Submitted Successfully!</p>
               <p className="text-xs text-muted-foreground">Reviewers have been notified. Check back alerts soon.</p>
            </div>
          ) : cooldown?.isBlocked ? (
            <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                     <Lock className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-foreground">Form Locked</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{cooldown.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">What role would you like?</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
                >
                  <option value="GENERAL">Overall Site Moderation</option>
                  <option value="MODULES">Standalone Modules Creator</option>
                  <option value="RESOURCES">continuous Resources Manager</option>
                  <option value="EVENTS">Upcoming Events Organizer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Why would you like access?</label>
                <textarea 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  placeholder="Share a short bio or detailed specifics..."
                  className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[120px] bg-background"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Processing...</> : "Submit Request"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
