"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save, Plus, ChevronDown, ChevronRight, Code2, Type,
  ArrowUp, ArrowDown, Loader2, X
} from "lucide-react";

import { Editor } from "@/components/editor";

interface TopicForm { title: string; content: string; }
interface ResourceForm { title: string; url: string; type: string; }

interface ModuleForm {
  title: string;
  description: string;
  icon: string;
  topics: TopicForm[];
  resources: ResourceForm[];
}

const emptyTopic = (): TopicForm => ({ title: "", content: "" });
const emptyResource = (): ResourceForm => ({ title: "", url: "", type: "ARTICLE" });

export default function NewModulePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"FORM" | "JSON">("FORM");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [jsonInput, setJsonInput] = useState("");

  const [form, setForm] = useState<ModuleForm>({
    title: "", description: "", icon: "📦", topics: [], resources: []
  });

  const handleJsonParse = () => {
    try {
      const p = JSON.parse(jsonInput);
      setForm({
        title: p.title || form.title,
        description: p.description || form.description,
        icon: p.icon || form.icon,
        topics: (p.topics || []).map((t: any) => ({ title: t.title || "", content: t.content || "" })),
        resources: (p.resources || []).map((r: any) => ({ title: r.title || "", url: r.url || "", type: r.type || "ARTICLE" }))
      });
      setMode("FORM"); setError("");
    } catch { setError("Invalid JSON format"); }
  };

  const exportJson = () => {
    setJsonInput(JSON.stringify(form, null, 2));
    setMode("JSON");
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Save failed"); }
      router.push("/admin/modules"); router.refresh();
    } catch (err: any) { setError(err.message); setSaving(false); }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Standalone Module</h1>
          <p className="text-muted-foreground mt-1 text-sm">Standalone pages explaining elite system design concepts.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !form.title} className="min-w-[120px]">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Create</>}
        </Button>
      </div>

      {error && <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">{error}</div>}

      <div className="flex bg-muted p-1 rounded-lg w-fit">
        <Button variant={mode === "FORM" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("FORM")}><Type className="h-4 w-4 mr-2" /> Form Builder</Button>
        <Button variant={mode === "JSON" ? "secondary" : "ghost"} size="sm" onClick={exportJson}><Code2 className="h-4 w-4 mr-2" /> JSON Mode</Button>
      </div>

      {mode === "JSON" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)}
              className="w-full h-96 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus:ring-1 focus:ring-ring"
              placeholder={'{\n  "title": "Module Name",\n  "topics": [{"title": "Basics", "content":"..."}]\n}'}
            />
            <Button onClick={handleJsonParse}>Apply JSON to Form</Button>
          </CardContent>
        </Card>
      )}

      {mode === "FORM" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-base">Identity & Core Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-[1fr_80px] gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. CI/CD Pipeline Architectures" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="📦" className="text-center text-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief summary view..." className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[80px]" />
              </div>
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
             <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base">📄 Topics ({form.topics.length})</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setForm({ ...form, topics: [...form.topics, emptyTopic()] })}><Plus className="h-3 w-3 mr-1" /> Add Topic</Button>
             </CardHeader>
             <CardContent className="space-y-4">
                {form.topics.map((t, i) => (
                   <div key={i} className="border rounded-xl p-4 bg-muted/5 space-y-3">
                      <div className="flex gap-2 items-center">
                         <Input value={t.title} onChange={e => {
                            const nt = [...form.topics]; nt[i].title = e.target.value; setForm({ ...form, topics: nt });
                         }} placeholder="Topic Name" />
                         <button onClick={() => setForm({ ...form, topics: form.topics.filter((_, j) => j !== i) })} className="p-2 hover:bg-destructive/10 rounded"><X className="h-4 w-4 text-destructive" /></button>
                      </div>
                      <Editor 
                         content={t.content} 
                         onChange={(html) => {
                            const nt = [...form.topics]; 
                            nt[i].content = html; 
                            setForm({ ...form, topics: nt });
                         }} 
                      />
                   </div>
                ))}
             </CardContent>
          </Card>

          {/* Resources */}
          <Card>
             <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base">📚 Resources ({form.resources.length})</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setForm({ ...form, resources: [...form.resources, emptyResource()] })}><Plus className="h-3 w-3 mr-1" /> Add Resource</Button>
             </CardHeader>
             <CardContent className="space-y-4">
                {form.resources.map((r, i) => (
                   <div key={i} className="flex gap-2 items-center">
                      <Input value={r.title} onChange={e => {
                         const nr = [...form.resources]; nr[i].title = e.target.value; setForm({ ...form, resources: nr });
                      }} placeholder="Name" className="flex-1" />
                      <Input value={r.url} onChange={e => {
                         const nr = [...form.resources]; nr[i].url = e.target.value; setForm({ ...form, resources: nr });
                      }} placeholder="https://..." className="flex-1" />
                      <select value={r.type} onChange={e => {
                         const nr = [...form.resources]; nr[i].type = e.target.value; setForm({ ...form, resources: nr });
                      }} className="border h-10 px-2 rounded text-sm"><option value="ARTICLE">Article</option><option value="VIDEO">Video</option></select>
                      <button onClick={() => setForm({ ...form, resources: form.resources.filter((_, j) => j !== i) })} className="p-2.5 hover:bg-destructive/10 rounded"><X className="h-4 w-4 text-destructive" /></button>
                   </div>
                ))}
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
