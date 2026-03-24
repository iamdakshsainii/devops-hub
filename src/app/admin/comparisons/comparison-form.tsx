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

  const [pasteText, setPasteText] = useState("");
  const [showPasteModal, setShowPasteModal] = useState<"JSON" | "MD" | "Criteria" | null>(null);

  const applyJson = (text: string) => {
     try {
         const data = JSON.parse(text);
         if (data.toolAId) setToolAId(data.toolAId);
         if (data.toolBId) setToolBId(data.toolBId);
         if (data.summary) setSummary(data.summary);
         if (data.criteria) setCriteria(data.criteria);
         setShowPasteModal(null);
         setPasteText("");
     } catch { alert("Invalid JSON"); }
  };

  const applyCriteria = (text: string) => {
      const lines = text.split("\n").filter(l => l.includes("|"));
      const parsed: Criterion[] = [];
      for (const line of lines) {
          const parts = line.replace(/^-\s*/, '').split("|").map(p => p.trim());
          if (parts.length >= 2) {
              parsed.push({
                  label: parts[0],
                  toolAValue: parts[1] || "",
                  toolBValue: parts[2] || ""
              });
          }
      }
      if (parsed.length > 0) setCriteria([...criteria, ...parsed]);
      setShowPasteModal(null);
      setPasteText("");
  };

  const applyMarkdown = (text: string) => {
     const summaryMatch = text.match(/^## Summary\n([\s\S]*?)(?=\n## |$)/im);
     if (summaryMatch) setSummary(summaryMatch[1].trim());

     const titleMatch = text.match(/^# (.*?) vs (.*)/i);
     if (titleMatch && tools.length) {
         const nameA = titleMatch[1].trim().toLowerCase();
         const nameB = titleMatch[2].trim().toLowerCase();
         
         const tA = tools.find(t => t.name.toLowerCase() === nameA || nameA.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(nameA));
         const tB = tools.find(t => t.name.toLowerCase() === nameB || nameB.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(nameB));
         if (tA) setToolAId(tA.id);
         if (tB) setToolBId(tB.id);
     }

     const criteriaMatch = text.match(/^## Criteria\n([\s\S]*?)(?=\n## |$)/im);
     if (criteriaMatch) {
         const lines = criteriaMatch[1].split("\n").filter(l => l.includes("|"));
         const parsed: Criterion[] = [];
         for (const line of lines) {
             const parts = line.replace(/^-\s*/, '').split("|").map(p => p.trim());
             if (parts.length >= 2) {
                 parsed.push({
                     label: parts[0],
                     toolAValue: parts[1] || "",
                     toolBValue: parts[2] || ""
                 });
             }
         }
         if (parsed.length > 0) setCriteria([...criteria, ...parsed]);
     }

     setShowPasteModal(null);
     setPasteText("");
  };

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">{initialData ? "Edit Comparison" : "Create Comparison"}</CardTitle>
            <CardDescription>Setup benchmark aggregates pitting two platforms together.</CardDescription>
          </div>
          <div className="flex gap-2">
             <Button type="button" variant="outline" size="sm" onClick={() => setShowPasteModal("Criteria")} className="h-8 gap-1 text-xs">
                 Paste Criteria Only
             </Button>
             <Button type="button" variant="outline" size="sm" onClick={() => setShowPasteModal("JSON")} className="h-8 gap-1 text-xs">
                 Paste JSON
             </Button>
             <Button type="button" variant="outline" size="sm" onClick={() => setShowPasteModal("MD")} className="h-8 gap-1 text-xs">
                 Paste Markdown
             </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

        {/* Paste Modal Overlay */}
        {showPasteModal && (
           <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
               <div className="bg-card border border-border/40 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                   <div className="flex justify-between items-center">
                       <div>
                          <h3 className="text-lg font-bold">Paste {showPasteModal}</h3>
                          <p className="text-xs text-muted-foreground">Paste your raw content below and we'll fill the form natively.</p>
                       </div>
                       <Button type="button" variant="ghost" size="sm" onClick={() => { setShowPasteModal(null); setPasteText(""); }} className="h-8 w-8 p-0">
                           <Trash2 className="h-4 w-4" />
                       </Button>
                   </div>
                   <Textarea 
                      value={pasteText} 
                      onChange={e => setPasteText(e.target.value)} 
                      placeholder={showPasteModal === "JSON" ? '{"toolAId": "...", "criteria": [...]}' : showPasteModal === "Criteria" ? 'Scaling | High | Very High\nLanguage | Go | Rust' : '# ToolA vs ToolB\n\n## Summary\n...\n\n## Criteria\n- Criterion | ValA | ValB'} 
                      rows={12} 
                      className="font-mono text-xs bg-muted/20" 
                   />
                   <div className="flex justify-end gap-2 pt-2">
                       <Button type="button" variant="outline" onClick={() => { setShowPasteModal(null); setPasteText(""); }}>Cancel</Button>
                       <Button type="button" onClick={() => {
                           if (showPasteModal === "JSON") applyJson(pasteText);
                           else if (showPasteModal === "Criteria") applyCriteria(pasteText);
                           else applyMarkdown(pasteText);
                       }}>
                           Load & Apply
                       </Button>
                   </div>
               </div>
           </div>
        )}
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
