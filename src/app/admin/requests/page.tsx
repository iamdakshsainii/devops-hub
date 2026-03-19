"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Mail, Calendar, Loader2 } from "lucide-react";

export default function AdminRequestsPage() {
  const [adminReqs, setAdminReqs] = useState<any[]>([]);
  const [contactReqs, setContactReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/admin/requests/list?type=admin"),
        fetch("/api/admin/requests/list?type=contact")
      ]);
      setAdminReqs(await res1.json());
      setContactReqs(await res2.json());
      setLoading(false);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      await fetch(`/api/admin/requests/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action })
      });
      fetchData(); // Reload indexes updates triggering reload
    } catch {}
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto"/> Loading Inbox...</div>;

  return (
    <div className="space-y-8">
      <div>
         <h1 className="text-2xl font-bold tracking-tight">Inbox & Requests</h1>
         <p className="text-muted-foreground mt-1 text-sm">Manage user upgrades and continuous requests streams natively.</p>
      </div>

      <div className="p-4 bg-muted/30 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div>
            <h3 className="font-bold text-sm">Application Cooldown (Days)</h3>
            <p className="text-xs text-muted-foreground">Wait time a user must clear after rejection before re-applying.</p>
         </div>
         <div className="flex items-center gap-2">
             <input 
               type="number" 
               defaultValue="7" 
               onChange={async (e) => {
                  await fetch("/api/admin/settings", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ key: "COOLDOWN_DAYS", value: e.target.value })
                  });
               }} 
               className="h-8 w-20 text-center rounded-md border bg-background text-sm font-bold"
             />
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-amber-500" /> Admin Applications ({adminReqs.length})</h2>
            <div className="space-y-3">
               {adminReqs.map(req => (
                  <Card key={req.id} className="bg-card/40">
                     <CardHeader className="p-4 pb-2">
                         <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm">{req.user.name}</h3>
                            <div className="flex gap-1 items-center">
                                <Badge variant="outline" className="text-[10px] capitalize bg-blue-500/10 text-blue-500 border-none">{req.category || "GENERAL"}</Badge>
                                <Badge variant={req.status === "PENDING" ? "secondary" : req.status === "APPROVED" ? "outline" : "destructive"}>
                                    {req.status}
                                </Badge>
                            </div>
                         </div>
                         <p className="text-xs text-muted-foreground">{req.user.email}</p>
                     </CardHeader>
                     <CardContent className="p-4 pt-2 space-y-3">
                         <p className="text-xs text-foreground/80 bg-muted/30 p-2 rounded-md italic">"{req.reason || "No reason given"}"</p>
                         {req.status === "PENDING" && (
                            <div className="flex gap-2 justify-end">
                                <Button onClick={() => handleAction(req.id, "REJECT")} size="sm" variant="outline" className="h-7 text-xs border-destructive hover:bg-destructive hover:text-white"><X className="h-3 w-3 mr-1" /> Reject</Button>
                                <Button onClick={() => handleAction(req.id, "APPROVE")} size="sm" className="h-7 text-xs bg-amber-500 hover:bg-amber-600 font-bold"><Check className="h-3 w-3 mr-1" /> Approve</Button>
                            </div>
                         )}
                     </CardContent>
                  </Card>
               ))}
               {adminReqs.length === 0 && <div className="text-center py-8 text-xs text-muted-foreground">No applications filed.</div>}
            </div>
         </div>

         <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Suggestion Inbox ({contactReqs.length})</h2>
            <div className="space-y-3">
               {contactReqs.map(msg => (
                  <Card key={msg.id} className="bg-card/40">
                     <CardHeader className="p-4 pb-2">
                         <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm">{msg.name}</h3>
                            <Badge variant="outline" className="text-[10px] capitalize">{msg.reason.replace(/_/g, " ")}</Badge>
                         </div>
                         <p className="text-xs text-muted-foreground">{msg.email}</p>
                     </CardHeader>
                     <CardContent className="p-4 pt-2 space-y-3">
                         <p className="text-xs text-foreground leading-relaxed">"{msg.message}"</p>
                         <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                             <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(msg.createdAt).toLocaleDateString()}</span>
                             {msg.status === "PENDING" && (
                                <Badge onClick={() => handleAction(msg.id, "READ")} variant="secondary" className="cursor-pointer text-xxs px-1.5 py-0 hover:bg-muted">Mark Read</Badge>
                             )}
                         </div>
                     </CardContent>
                  </Card>
               ))}
               {contactReqs.length === 0 && <div className="text-center py-8 text-xs text-muted-foreground">Inbox is empty.</div>}
            </div>
         </div>
      </div>
    </div>
  )
}
