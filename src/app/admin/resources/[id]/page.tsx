"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Trash2 } from "lucide-react";

export default function EditResourceAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [form, setForm] = useState({ title: "", description: "", type: "ARTICLE", url: "", tags: "", imageUrl: "", status: "PUBLISHED" });

  useEffect(() => {
    params.then(p => {
      setResourceId(p.id);
      fetch(`/api/admin/resources/${p.id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            type: data.type || "ARTICLE",
            url: data.url || "",
            tags: data.tags || "",
            imageUrl: data.imageUrl || "",
            status: data.status || "PUBLISHED"
          });
          setLoading(false);
        })
        .catch(() => { setError("Failed to load resource"); setLoading(false); });
    });
  }, [params]);

  const handleSave = async (statusOverride?: string) => {
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (statusOverride) payload.status = statusOverride;

      const res = await fetch(`/api/admin/resources/${resourceId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      router.push("/admin/resources"); router.refresh();
    } catch(err:any) { setError(err.message); setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await fetch(`/api/admin/resources/${resourceId}`, { method: "DELETE" });
      router.push("/admin/resources"); router.refresh();
    } catch { setError("Failed to delete"); }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading resource...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Resource</h1>
            <p className="text-muted-foreground mt-1 text-sm">Modify global documentation or link details.</p>
         </div>
         <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
         </Button>
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

            <div className="flex gap-2">
               <Button variant="outline" onClick={() => handleSave("PENDING")} disabled={saving} className="flex-1">
                  Save as Draft
               </Button>
               <Button onClick={() => handleSave("PUBLISHED")} disabled={saving || !form.title || !form.url} className="flex-1 bg-primary">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} Update Resource
               </Button>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
