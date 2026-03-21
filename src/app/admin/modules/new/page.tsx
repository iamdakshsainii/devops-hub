"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save, Plus, ChevronDown, ChevronRight, Code2, Type,
  ArrowUp, ArrowDown, Loader2, X, FileText
} from "lucide-react";

import { Editor } from "@/components/editor";

interface TopicForm { title: string; content: string; }
interface ResourceForm { title: string; url: string; type: string; }

interface ModuleForm {
  title: string;
  description: string;
  icon: string;
  status?: string;
  roadmapId?: string;
  order?: number;
  topics: TopicForm[];
  resources: ResourceForm[];
}

const emptyTopic = (): TopicForm => ({ title: "", content: "" });
const emptyResource = (): ResourceForm => ({ title: "", url: "", type: "ARTICLE" });

export default function NewModulePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"FORM" | "JSON" | "MARKDOWN">("FORM");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [markdownInput, setMarkdownInput] = useState("");

  const [form, setForm] = useState<ModuleForm>({
    title: "", description: "", icon: "📦", topics: [], resources: [], roadmapId: "", order: 0
  });

  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  useEffect(() => {
     fetch("/api/roadmaps")
       .then(res => res.json())
       .then(data => setRoadmaps(Array.isArray(data) ? data : []))
       .catch(console.error);
  }, []);

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

  const [replaceExisting, setReplaceExisting] = useState(false);

  // ── Markdown / AI Paste parse ────────────────────────────────────────────
  const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\n");
      const topics: TopicForm[] = [];
      let currentTopic: TopicForm | null = null;
      for (const line of lines) {
        if (line.startsWith("## ")) {
           currentTopic = { title: line.replace("## ", ""), content: "" };
           topics.push(currentTopic);
        } else if (currentTopic) {
           currentTopic.content += line + "\n";
        }
      }
      setForm({ 
         ...form, 
         topics: replaceExisting ? topics : [...form.topics, ...topics] 
      });
      setMode("FORM"); setError("");
    } catch { setError("Failed to parse markdown"); }
  };

  const handleSave = async (forceStatus?: "PENDING" | "PUBLISHED") => {
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (forceStatus) payload.status = forceStatus;

      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave("PENDING")} disabled={saving || !form.title}>
            Save as Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("PUBLISHED")} disabled={saving || !form.title} className="bg-primary">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Publish Live"}
          </Button>
        </div>
      </div>

      {error && <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">{error}</div>}

      <div className="flex bg-muted p-1 rounded-lg w-fit gap-0.5">
        <Button variant={mode === "FORM" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("FORM")}><Type className="h-4 w-4 mr-2" /> Form Builder</Button>
        <Button variant={mode === "JSON" ? "secondary" : "ghost"} size="sm" onClick={exportJson}><Code2 className="h-4 w-4 mr-2" /> JSON Mode</Button>
        <Button variant={mode === "MARKDOWN" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("MARKDOWN")}><FileText className="h-4 w-4 mr-2" /> AI/Markdown Paste</Button>
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

      {mode === "MARKDOWN" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
               <FileText className="h-5 w-5 text-primary" />
               AI / Markdown Paste Importer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Pasting notes? Use `## Topic Title` for sections. Code blocks work correctly.</p>
            <textarea value={markdownInput} onChange={e => setMarkdownInput(e.target.value)}
              className="w-full h-96 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono focus-visible:outline-none focus:ring-1 focus:ring-ring"
              placeholder={'## Introduction\nWelcome to Docker note details...\n\n## Next Chapter\nContainerization involves...'}
            />
            <div className="flex items-center justify-between pt-2">
               <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                  Replace existing topics (prevents duplication)
               </label>
               <Button onClick={handleMarkdownParse}>Apply Markdown to Form</Button>
            </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/10 pt-4 mt-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Link to Roadmap (Optional)</label>
                  <select value={form.roadmapId} onChange={e => setForm({ ...form, roadmapId: e.target.value })} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background">
                     <option value="">Standalone (No Roadmap)</option>
                     {roadmaps.map((r: any) => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Step Position Number</label>
                  <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} placeholder="0" className="h-10" />
                </div>
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
