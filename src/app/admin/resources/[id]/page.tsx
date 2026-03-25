"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Trash2, Image as ImageIcon, X } from "lucide-react";

export default function EditResourceAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [form, setForm] = useState({ title: "", description: "", type: "DOCUMENTATION", url: "", tags: "", imageUrl: "", status: "PUBLISHED", linkedStepId: "" });

  const [mode, setMode] = useState<"FORM" | "JSON">("FORM");
  const [jsonInput, setJsonInput] = useState("");
  const [modules, setModules] = useState<any[]>([]);

  const handleJsonParse = () => {
    try {
      const p = JSON.parse(jsonInput);
      setForm({
        title: p.title || form.title,
        description: p.description || form.description,
        type: p.type || form.type,
        url: p.url || form.url,
        tags: p.tags || form.tags,
        imageUrl: p.imageUrl || form.imageUrl,
        linkedStepId: p.linkedStepId || form.linkedStepId,
        status: form.status,
      });
      setMode("FORM");
      setError("");
    } catch {
      setError("Invalid JSON format");
    }
  };

  useEffect(() => {
    params.then(p => {
      setResourceId(p.id);
      fetch(`/api/admin/resources/${p.id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            type: data.type || "DOCUMENTATION",
            url: data.url || "",
            tags: data.tags || "",
            imageUrl: data.imageUrl || "",
            status: data.status || "PUBLISHED",
            linkedStepId: "",
          });
          setLoading(false);
        })
        .catch(() => { setError("Failed to load resource"); setLoading(false); });
    });

    fetch('/api/modules?all=true')
      .then(res => res.json())
      .then(data => setModules(data || []))
      .catch(() => {});
  }, [params]);

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setForm({ ...form, imageUrl: data.url });
    } catch { setError("Image upload failed"); }
  };

  const handleSave = async (statusOverride?: string) => {
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (statusOverride) (payload as any).status = statusOverride;

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

      {/* Mode toggle */}
      <div className="flex bg-muted p-1 rounded-lg w-fit gap-1 text-xs border">
        <Button variant={mode === "FORM" ? "secondary" : "ghost"} size="sm" onClick={() => { setMode("FORM"); }} className="h-8"> Form Builder </Button>
        <Button variant={mode === "JSON" ? "secondary" : "ghost"} size="sm" onClick={() => { setJsonInput(JSON.stringify(form, null, 2)); setMode("JSON"); }} className="h-8"> JSON Import </Button>
      </div>

      {error && <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">{error}</div>}

      {mode === "JSON" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs text-muted-foreground">Paste full JSON fields or connect structures to satisfy creation form builders.</p>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-64 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button onClick={handleJsonParse}>Apply JSON to Form</Button>
          </CardContent>
        </Card>
      )}

      {mode === "FORM" && (
      <Card>
         <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
               <label className="text-sm font-medium">Title</label>
               <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Direct title link..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-sm font-medium">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="border h-10 px-2 rounded-md w-full bg-background font-medium">
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="VIDEO">Video</option>
                    <option value="PLAYLIST">Playlist</option>
                    <option value="NOTES">Notes</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Docker, K8s" />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium">Link to Module (Optional)</label>
               <select value={(form as any).linkedStepId || ""} onChange={e => setForm({...form, linkedStepId: e.target.value})} className="border h-10 px-2 rounded-md w-full bg-background">
                  <option value="">-- None --</option>
                  {modules.map(opt => <option key={opt.id} value={opt.id}>{opt.title}</option>)}
               </select>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium">URL</label>
               <Input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium">Cover Image</label>
               <div className="flex gap-3 items-center">
                  <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://image-url..." className="flex-1" />
                  <label className="h-10 px-3 flex items-center justify-center border rounded-md cursor-pointer hover:bg-muted font-medium text-xs bg-background shrink-0 gap-1 opacity-80 hover:opacity-100">
                       <ImageIcon className="h-4 w-4 text-muted-foreground" /> Upload Cover
                       <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                  </label>
               </div>
               {form.imageUrl && (
                   <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2 border rounded-lg p-2 bg-muted/20">
                       <img src={form.imageUrl} className="h-10 w-16 object-cover rounded-md" alt="Preview" />
                       <span className="truncate flex-1">{form.imageUrl}</span>
                       <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto" onClick={() => setForm({...form, imageUrl: ""})}><X className="h-3.5 w-3.5" /></Button>
                   </div>
               )}
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
      )}
    </div>
  );
}
