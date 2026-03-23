"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save, Trash2, Plus, ChevronDown, ChevronRight, Code2, Type, FileText,
  GripVertical, ArrowUp, ArrowDown, Loader2, X
} from "lucide-react";

import { Editor } from "@/components/editor";





interface StepForm {
  id?: string;
  title: string;
  description: string;
  icon: string;
  
  
  
  expanded: boolean;
}

interface RoadmapForm {
  title: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  steps: StepForm[];
}

const COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B",
  "#EF4444", "#14B8A6", "#EC4899", "#6366F1",
  "#F97316", "#06B6D4",
];

const emptyStep = (): StepForm => ({
  title: "",
  description: "",
  icon: "📦",
  
  
  expanded: true,
});




// --- Inline Sub-Component for Attached Modules ---
function AttachedModulesSection({ stepId, roadmapId }: { stepId?: string; roadmapId: string }) {
  const [attached, setAttached] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttached = async () => {
    if (!stepId) return;
    const res = await fetch(`/api/roadmaps/${roadmapId}/steps/${stepId}/modules`);
    const data = await res.json();
    setAttached(data);
  };

  useEffect(() => {
    fetchAttached();
  }, [stepId]);

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/modules?all=true&search=${q}`);
      const data = await res.json();
      setResults(data);
    } catch { }
    setLoading(false);
  };

  const attachModule = async (moduleId: string) => {
    if (!stepId) return;
    await fetch(`/api/roadmaps/${roadmapId}/steps/${stepId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, order: attached.length }),
    });
    setSearch("");
    setResults([]);
    fetchAttached();
  };

  const detachModule = async (moduleId: string) => {
    if (!stepId) return;
    await fetch(`/api/roadmaps/${roadmapId}/steps/${stepId}/modules`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    });
    fetchAttached();
  };



  if (!stepId) {
    return (
      <div className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-md">
        Save this step first to attach standalone modules.
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4 border-t">
      <h4 className="text-sm font-bold">🔗 Attached Modules</h4>

      {/* Search Input and Dropdown */}
      <div className="relative">
        <label className="text-xs font-medium mb-1 block">Search modules to attach</label>
        <div className="flex gap-2">
          <Input 
            placeholder="Type module title..." 
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 text-sm h-9"
          />
        </div>
        
        {loading && <div className="absolute right-3 top-9"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}

        {results.length > 0 && (
          <div className="absolute top-16 left-0 right-0 max-h-48 overflow-y-auto border rounded-xl bg-card shadow-lg z-50">
            {results.map((m) => (
              <div 
                key={m.id} 
                className="p-2.5 hover:bg-muted cursor-pointer flex items-center justify-between text-sm"
                onClick={() => attachModule(m.id)}
              >
                <div>
                  <span className="font-semibold">{m.icon} {m.title}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{m.description || "No description"}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2">Attach</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List Attached */}
      {attached.length > 0 ? (
        <div className="space-y-2">
          {attached.map((am) => (
            <div key={am.id} className="border rounded-lg p-2 flex items-center justify-between bg-muted/5">
              <div className="flex gap-2 items-center">
                <span className="text-lg bg-muted p-1 rounded">{am.module?.icon || "📦"}</span>
                <div>
                  <p className="text-xs font-semibold leading-none">{am.module?.title}</p>
                  <span className="text-[10px] text-muted-foreground">Order: {am.order}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => detachModule(am.moduleId)} className="p-1 hover:bg-destructive/10 rounded">
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground italic p-2 border border-dashed rounded-md text-center">
          No modules attached yet
        </div>
      )}
    </div>
  );
}

export default function RoadmapEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [roadmapId, setRoadmapId] = useState<string>("");
  const [isNew, setIsNew] = useState(true);
  const [mode, setMode] = useState<"FORM" | "JSON" | "MARKDOWN">("FORM");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [markdownInput, setMarkdownInput] = useState("");

  const [form, setForm] = useState<RoadmapForm>({
    title: "",
    description: "",
    icon: "🗺️",
    color: "#3B82F6",
    status: "PUBLISHED",
    steps: [],
  });

  // Resolve params and load data
  useEffect(() => {
    params.then(({ id }) => {
      setRoadmapId(id);
      if (id !== "new") {
        setIsNew(false);
        setLoading(true);
        fetch(`/api/roadmaps/${id}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.title) {
              setForm({
                title: data.title,
                description: data.description,
                icon: data.icon || "🗺️",
                color: data.color || "#3B82F6",
                status: data.status || "PUBLISHED",
                steps: (data.steps || []).map((s: any) => ({
                  id: s.id,
                  title: s.title,
                  description: s.description || "",
                  icon: s.icon || "📦",
                  
                  topics: (s.topics || []).map((t: any) => ({
                    title: t.title,
                    content: t.content || "",
                  })),
                  resources: (s.resources || []).map((r: any) => ({
                    title: r.title,
                    url: r.url,
                    type: r.type || "ARTICLE",
                    description: r.description || "",
                  })),
                  expanded: false,
                })),
              });
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    });
  }, [params]);

  // JSON mode parsing
  const handleJsonParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setForm({
        title: parsed.title || form.title,
        description: parsed.description || form.description,
        icon: parsed.icon || form.icon,
        color: parsed.color || form.color,
        status: parsed.status || form.status,
        steps: (parsed.steps || []).map((s: any) => ({
          title: s.title || "",
          description: s.description || "",
          icon: s.icon || "📦",
          topics: (s.topics || []).map((t: any) => ({
            title: t.title || "",
            content: t.content || "",
          })),
          resources: (s.resources || []).map((r: any) => ({
            title: r.title || "",
            url: r.url || "",
            type: r.type || "ARTICLE",
            description: r.description || "",
          })),
          expanded: false,
        })),
      });
      setMode("FORM");
      setError("");
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\n");
      let currentStep: any = null;
      let currentTopic: any = null;
      const steps: any[] = [];

      for (const line of lines) {
        if (line.trim().startsWith("# ")) {
          currentStep = {
            title: line.replace("# ", "").trim(),
            description: "",
            icon: "📦",
            
            
            expanded: false,
          };
          steps.push(currentStep);
          currentTopic = null;
        } else if (line.trim().startsWith("## ") && currentStep) {
          currentTopic = {
            title: line.replace("## ", "").trim(),
            content: "",
          };
          currentStep.topics.push(currentTopic);
        } else if (currentTopic) {
          currentTopic.content += line + "\n";
        } else if (currentStep && !currentTopic) {
          currentStep.description += line + "\n";
        }
      }

      setForm({
        ...form,
        steps: [...form.steps, ...steps], // Append to existing steps!
      });
      setMode("FORM");
      setMarkdownInput("");
      setError("");
    } catch {
      setError("Failed to parse Markdown structure layout");
    }
  };

  // Export current form as JSON
  const exportJson = () => {
    const data = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      color: form.color,
      status: form.status,
      steps: form.steps.map((s) => ({
        title: s.title,
        description: s.description,
        icon: s.icon,

      })),
    };
    setJsonInput(JSON.stringify(data, null, 2));
    setMode("JSON");
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        icon: form.icon,
        color: form.color,
        status: form.status,
        steps: form.steps.map((s) => ({
          title: s.title,
          description: s.description,
          icon: s.icon,

        })).filter((s) => s.title),
      };

      const url = isNew ? "/api/roadmaps" : `/api/roadmaps/${roadmapId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Save failed");
      }



      router.push("/admin/roadmaps");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this roadmap?")) return;
    try {
      await fetch(`/api/roadmaps/${roadmapId}`, { method: "DELETE" });
      router.push("/admin/roadmaps");
      router.refresh();
    } catch {
      setError("Delete failed");
    }
  };

  // Step operations
  const updateStep = (idx: number, data: Partial<StepForm>) => {
    const steps = [...form.steps];
    steps[idx] = { ...steps[idx], ...data };
    setForm({ ...form, steps });
  };

  const removeStep = (idx: number) => {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const steps = [...form.steps];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];
    setForm({ ...form, steps });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? "Create New Roadmap" : `Edit: ${form.title || "Roadmap"}`}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Build a step-by-step learning path with topics and resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || !form.title} className="min-w-[120px]">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save</>}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm">{error}</div>
      )}

      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button variant={mode === "FORM" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("FORM")}>
            <Type className="h-4 w-4 mr-2" /> Form Builder
          </Button>
          <Button variant={mode === "JSON" ? "secondary" : "ghost"} size="sm" onClick={exportJson}>
            <Code2 className="h-4 w-4 mr-2" /> JSON Mode
          </Button>
          <Button variant={mode === "MARKDOWN" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("MARKDOWN")}>
            <FileText className="h-4 w-4 mr-2" /> Markdown/AI Paste
          </Button>
        </div>
      </div>

      {/* JSON Mode */}
      {mode === "JSON" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              Paste or edit the complete roadmap JSON. Click "Apply JSON" to load it into the form builder.
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-96 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={'{\n  "title": "DevOps Roadmap",\n  "description": "...",\n  "icon": "🚀",\n  "color": "#3B82F6",\n  "steps": [\n    {\n      "title": "Docker",\n      "description": "Learn containers",\n      "icon": "🐳",\n      "topics": [\n        { "title": "What is Docker?", "content": "<p>Docker is...</p>" }\n      ],\n      "resources": [\n        { "title": "Docker Docs", "url": "https://docs.docker.com", "type": "ARTICLE" }\n      ]\n    }\n  ]\n}'}
            />
            <Button onClick={handleJsonParse}>Apply JSON to Form</Button>
          </CardContent>
        </Card>
      )}

      {/* Markdown / AI Paste Mode */}
      {mode === "MARKDOWN" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs text-muted-foreground border-l-2 border-primary-500/40 pl-3 bg-primary/5 py-2 rounded-r-md">
              💡 **Why use this Mode?** This global Markdown tool is intended to create the **Structural Frame** (creating DOZENS of Steps) for the entire roadmap list at once. If you need inside detail notes for a **Specific Lesson**, you should import that directly inside the individual **Module Editor panel** instead!
            </p>
            <textarea
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              className="w-full h-96 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`# Step 1: Introduction To Docker\n## What is Containerization\nWrite full descriptions inside list offsets safely.\n\n## Containers vs VMs\nWrite full notes sets.`}
            />
            <Button onClick={handleMarkdownParse}>Parse & Append Steps</Button>
          </CardContent>
        </Card>
      )}

      {/* Form Mode */}
      {mode === "FORM" && (
        <div className="space-y-8">
          {/* Basic Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Roadmap Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. DevOps Engineering Roadmap 2026"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Icon</label>
                    <Input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="🗺️"
                      className="text-center text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setForm({ ...form, color: c })}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                            form.color === c ? "border-foreground scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What will learners achieve with this roadmap?"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Steps Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Steps ({form.steps.length})</h2>
              <Button variant="outline" onClick={() => setForm({ ...form, steps: [...form.steps, emptyStep()] })}>
                <Plus className="h-4 w-4 mr-2" /> Add Step
              </Button>
            </div>

            {form.steps.map((step, si) => (
              <Card key={si} className="overflow-hidden">
                <div className="h-1" style={{ backgroundColor: form.color }} />
                {/* Step header — click to expand/collapse (changed to div to avoid nested buttons) */}
                <div
                  onClick={() => updateStep(si, { expanded: !step.expanded })}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: form.color }}
                  >
                    {si + 1}
                  </span>
                  <span className="text-sm font-semibold flex-1 truncate">
                    {step.icon} {step.title || `Step ${si + 1} (untitled)`}
                  </span>
                  <span></span>
                  <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="p-1 hover:bg-muted rounded" onClick={() => moveStep(si, -1)} disabled={si === 0}>
                      <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button type="button" className="p-1 hover:bg-muted rounded" onClick={() => moveStep(si, 1)} disabled={si === form.steps.length - 1}>
                      <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button type="button" className="p-1 hover:bg-destructive/10 rounded" onClick={() => removeStep(si)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                  {step.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>

                {/* Expanded content */}
                {step.expanded && (
                  <CardContent className="border-t pt-5 space-y-6">
                    {/* Step details */}
                    <div className="grid sm:grid-cols-[1fr_80px] gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Step Title</label>
                        <Input
                          value={step.title}
                          onChange={(e) => updateStep(si, { title: e.target.value })}
                          placeholder="e.g. Docker & Containers"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Icon</label>
                        <Input
                          value={step.icon}
                          onChange={(e) => updateStep(si, { icon: e.target.value })}
                          placeholder="🐳"
                          className="text-center text-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Step Description</label>
                      <Input
                        value={step.description}
                        onChange={(e) => updateStep(si, { description: e.target.value })}
                        placeholder="What does this step cover?"
                      />
                    </div>







                    {/* Attached Modules */}
                    <AttachedModulesSection stepId={step.id} roadmapId={roadmapId} />
                  </CardContent>
                )}
              </Card>
            ))}

            {form.steps.length === 0 && (
              <div className="border border-dashed rounded-xl p-12 text-center bg-muted/10">
                <p className="text-muted-foreground mb-4">No steps yet. Add steps to build your roadmap.</p>
                <Button variant="outline" onClick={() => setForm({ ...form, steps: [emptyStep()] })}>
                  <Plus className="h-4 w-4 mr-2" /> Add First Step
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
