"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Criterion {
  label: string;
  toolAValue: string;
  toolBValue: string;
}

export function ComparisonForm({ initialData, tools }: { initialData?: any; tools: any[] }) {
  const router = useRouter();
  const [toolAId, setToolAId] = useState(initialData?.toolAId || "");
  const [toolBId, setToolBId] = useState(initialData?.toolBId || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [criteria, setCriteria] = useState<Criterion[]>(initialData?.criteria || []);
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [loading, setLoading] = useState(false);

  const handleAddCriterion = () => {
    setCriteria([...criteria, { label: "", toolAValue: "", toolBValue: "" }]);
  };

  const handleCriterionChange = (idx: number, field: keyof Criterion, val: string) => {
    const copy = [...criteria];
    copy[idx] = { ...copy[idx], [field]: val };
    setCriteria(copy);
  };

  const removeCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!toolAId || !toolBId || toolAId === toolBId) {
        alert("Please select two different tools.");
        return;
    }
    setLoading(true);

    const payload = {
      toolAId, toolBId, summary, criteria, status
    };

    try {
      const url = initialData ? `/api/admin/comparisons/${initialData.id}` : "/api/admin/comparisons";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/admin/comparisons");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save");
      }
    } catch { alert("Network Error"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-card rounded-2xl border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{initialData ? "Edit Comparison" : "Create Comparison"}</CardTitle>
          <CardDescription>Setup benchmark aggregates pitting two platforms platforms together.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/10 pb-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Tool A</label>
              <select value={toolAId} onChange={e => setToolAId(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 <option value="">-- Select Tool A --</option>
                 {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Tool B</label>
              <select value={toolBId} onChange={e => setToolBId(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 <option value="">-- Select Tool B --</option>
                 {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Bulk Paste Criteria */}
          <div className="bg-primary/5 p-3 rounded-xl border border-dashed border-primary/20 space-y-2">
              <label className="text-xs font-bold text-primary flex items-center gap-1"><Save className="h-3.5 w-3.5" /> Bulk Paste Criteria (Format: <code>Label | Value A | Value B</code>)</label>
              <Textarea placeholder={"Scaling | High | Very High\nLanguage | Go | Rust"} rows={2} className="text-xs font-mono bg-background" onChange={e => {
                  const val = e.target.value;
                  if (val.trim()) {
                     const parsed: Criterion[] = [];
                     for (const line of val.split("\n")) {
                         if (line.includes("|")) {
                             const parts = line.split("|").map(p => p.trim());
                             if (parts.length >= 2) {
                                 parsed.push({
                                     label: parts[0],
                                     toolAValue: parts[1] || "",
                                     toolBValue: parts[2] || ""
                                 });
                             }
                         }
                     }
                     if (parsed.length > 0) {
                         setCriteria([...criteria, ...parsed]);
                         e.target.value = ""; // Clear
                     }
                  }
              }} />
          </div>

          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-foreground">Comparison Criteria</label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCriterion} className="h-7 text-xs gap-1">
                      <PlusCircle className="h-3 w-3" /> Add Criterion
                  </Button>
              </div>

              {criteria.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 border bg-muted/5 p-2 rounded-lg items-end">
                      <div className="md:col-span-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">Criterion Label</label>
                          <Input value={item.label} onChange={e => handleCriterionChange(idx, "label", e.target.value)} placeholder="e.g., Scaling" className="h-8 text-xs" />
                      </div>
                      <div className="md:col-span-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">Tool A Value</label>
                          <Input value={item.toolAValue} onChange={e => handleCriterionChange(idx, "toolAValue", e.target.value)} placeholder="Value for A" className="h-8 text-xs" />
                      </div>
                      <div className="md:col-span-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">Tool B Value</label>
                          <Input value={item.toolBValue} onChange={e => handleCriterionChange(idx, "toolBValue", e.target.value)} placeholder="Value for B" className="h-8 text-xs" />
                      </div>
                      <div className="flex justify-end p-0.5">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeCriterion(idx)} className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  </div>
              ))}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Summary / Verdict (Markdown)</label>
            <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Describe who wins and why with detailed reviews triggers setup flawlessly." rows={4} />
          </div>

          <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={status === "PUBLISHED"} onChange={e => setStatus(e.target.checked ? "PUBLISHED" : "DRAFT")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" id="pub" />
              <label htmlFor="pub" className="text-sm font-medium">Publish Live</label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-6 bg-background/80 backdrop-blur-md p-4 border border-border/40 rounded-2xl shadow-md">
         <Button type="button" onClick={handleSubmit} disabled={loading} className="gap-1.5">
            <Save className="h-4 w-4" /> {initialData ? "Update Comparison" : "Create Comparison"}
         </Button>
      </div>
    </div>
  );
}
