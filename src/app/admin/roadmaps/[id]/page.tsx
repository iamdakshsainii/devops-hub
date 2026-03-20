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

interface TopicForm {
  title: string;
  content: string;
}

interface ResourceForm {
  title: string;
  url: string;
  type: string;
  description: string;
}

interface StepForm {
  title: string;
  description: string;
  icon: string;
  topics: TopicForm[];
  resources: ResourceForm[];
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
  topics: [],
  resources: [],
  expanded: true,
});

const emptyTopic = (): TopicForm => ({ title: "", content: "" });
const emptyResource = (): ResourceForm => ({ title: "", url: "", type: "ARTICLE", description: "" });

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
            topics: [],
            resources: [],
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
        topics: s.topics.map((t) => ({ title: t.title, content: t.content })),
        resources: s.resources.map((r) => ({
          title: r.title, url: r.url, type: r.type, description: r.description
        })),
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
          topics: s.topics.filter((t) => t.title),
          resources: s.resources.filter((r) => r.title && r.url),
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

  // Topic operations
  const updateTopic = (stepIdx: number, topicIdx: number, data: Partial<TopicForm>) => {
    const steps = [...form.steps];
    const topics = [...steps[stepIdx].topics];
    topics[topicIdx] = { ...topics[topicIdx], ...data };
    steps[stepIdx] = { ...steps[stepIdx], topics };
    setForm({ ...form, steps });
  };

  const removeTopic = (stepIdx: number, topicIdx: number) => {
    const steps = [...form.steps];
    steps[stepIdx] = { ...steps[stepIdx], topics: steps[stepIdx].topics.filter((_, i) => i !== topicIdx) };
    setForm({ ...form, steps });
  };

  // Resource operations
  const updateResource = (stepIdx: number, resIdx: number, data: Partial<ResourceForm>) => {
    const steps = [...form.steps];
    const resources = [...steps[stepIdx].resources];
    resources[resIdx] = { ...resources[resIdx], ...data };
    steps[stepIdx] = { ...steps[stepIdx], resources };
    setForm({ ...form, steps });
  };

  const removeResource = (stepIdx: number, resIdx: number) => {
    const steps = [...form.steps];
    steps[stepIdx] = { ...steps[stepIdx], resources: steps[stepIdx].resources.filter((_, i) => i !== resIdx) };
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
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {step.topics.length} topics · {step.resources.length} resources
                  </span>
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

                    {/* Topics */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold">📄 Topics ({step.topics.length})</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStep(si, { topics: [...step.topics, emptyTopic()] })}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Topic
                        </Button>
                      </div>

                      {step.topics.map((topic, ti) => (
                        <div key={ti} className="border rounded-xl p-4 space-y-3 bg-muted/5">
                          <div className="flex gap-2 items-start">
                            <Input
                              value={topic.title}
                              onChange={(e) => updateTopic(si, ti, { title: e.target.value })}
                              placeholder="Topic title"
                              className="flex-1"
                            />
                            <button onClick={() => removeTopic(si, ti)} className="p-2 hover:bg-destructive/10 rounded">
                              <X className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                          <Editor 
                            content={topic.content} 
                            onChange={(html) => updateTopic(si, ti, { content: html })} 
                          />
                        </div>
                      ))}
                    </div>

                    {/* Resources */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold">📚 Resources ({step.resources.length})</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStep(si, { resources: [...step.resources, emptyResource()] })}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Resource
                        </Button>
                      </div>

                      {step.resources.map((res, ri) => (
                        <div key={ri} className="border rounded-lg p-3 flex flex-wrap gap-2 items-start bg-muted/5">
                          <Input
                            value={res.title}
                            onChange={(e) => updateResource(si, ri, { title: e.target.value })}
                            placeholder="Resource title"
                            className="flex-1 min-w-[150px] h-9 text-sm"
                          />
                          <Input
                            value={res.url}
                            onChange={(e) => updateResource(si, ri, { url: e.target.value })}
                            placeholder="https://..."
                            className="flex-1 min-w-[180px] h-9 text-sm"
                          />
                          <select
                            value={res.type}
                            onChange={(e) => updateResource(si, ri, { type: e.target.value })}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm w-24"
                          >
                            <option value="ARTICLE">Article</option>
                            <option value="VIDEO">Video</option>
                            <option value="PDF">PDF</option>
                            <option value="TOOL">Tool</option>
                            <option value="NOTES">Notes</option>
                          </select>
                          <button onClick={() => removeResource(si, ri)} className="p-2 hover:bg-destructive/10 rounded">
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
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
