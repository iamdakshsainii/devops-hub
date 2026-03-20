"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminRequestCard({ hasPendingRequest, isAdmin }: { hasPendingRequest: boolean, isAdmin: boolean }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (isAdmin) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-1">Administrative Access Active</h3>
        <p className="text-sm text-foreground/80">You currently hold Admin or Super Admin privileges on DevOps Network.</p>
      </div>
    );
  }

  if (hasPendingRequest || success) {
    return (
      <div className="bg-muted/50 border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-1">Request Pending</h3>
        <p className="text-sm text-muted-foreground">Your request for administrative access is currently under review by a Super Admin. You will be notified of their decision.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const reason = formData.get("reason") as string;

    try {
      const res = await fetch("/api/admin/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) throw new Error("Failed to submit request");
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-2">Request Admin Access</h3>
      <p className="text-sm text-muted-foreground mb-4">Want to help moderate the community? Request admin privileges to approve notes, resources, and events.</p>
      
      {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium">Why would you like admin access?</label>
          <Textarea 
            id="reason" 
            name="reason" 
            placeholder="I want to help review incoming DevOps architecture notes..." 
            required 
            rows={3} 
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </div>
  );
}
