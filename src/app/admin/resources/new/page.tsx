"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";

export default function NewResourceAdminPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", type: "ARTICLE", url: "", tags: "", imageUrl: "" });

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      router.push("/admin/resources"); router.refresh();
    } catch(err:any) { setError(err.message); setSaving(false); }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
         <h1 className="text-2xl font-bold tracking-tight">Create New Resource</h1>
         <p className="text-muted-foreground mt-1 text-sm">Add shared documentation, videos, or tools.</p>
      </div>

      {error && <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">{error}</div>}

      <Card>
         <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
               <label className="text-sm font-medium">Title</label>
               <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Direct title link..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-sm font-medium">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="border h-10 px-2 rounded-md w-full bg-background"><option value="ARTICLE">Article</option><option value="VIDEO">Video</option><option value="PDF">PDF</option><option value="TOOL">Tool</option></select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Docker, K8s" />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium">URL</label>
               <Input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium">Description</label>
               <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full border rounded-md p-2 text-sm" placeholder="Brief outline..." />
            </div>

            <Button onClick={handleSave} disabled={saving || !form.title || !form.url} className="w-full">
               {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} Create Resource
            </Button>
         </CardContent>
      </Card>
    </div>
  );
}
