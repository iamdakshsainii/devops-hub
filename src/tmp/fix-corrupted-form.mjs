import fs from 'fs';
const path = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\cheatsheets\\cheatsheet-form.tsx';

const content = `"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Save, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CheatsheetForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "Linux");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "BEGINNER");
  const [readTime, setReadTime] = useState(initialData?.readTime || 10);
  const [icon, setIcon] = useState(initialData?.icon || "📋");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"FORM" | "MARKDOWN">("FORM");
  const [markdownInput, setMarkdownInput] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);

  const [sections, setSections] = useState<any[]>(
    initialData?.sections?.map((s: any) => ({
      id: s.id || Math.random().toString(),
      title: s.title,
      order: s.order || 0,
      subsections: s.subsections?.map((sub: any) => ({
        id: sub.id || Math.random().toString(),
        title: sub.title,
        content: sub.content,
        order: sub.order || 0
      })) || []
    })) || []
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const s = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(s);
  };

  const addSection = () => {
    setSections([...sections, { id: Math.random().toString(), title: "", order: sections.length, subsections: [] }]);
  };

  const addSubsection = (secId: string) => {
    setSections(sections.map(s => s.id === secId ? {
      ...s,
      subsections: [...s.subsections, { id: Math.random().toString(), title: "", content: "", order: s.subsections.length }]
    } : s));
  };

  const removeSection = (id: string) => setSections(sections.filter(s => s.id !== id));
  const removeSubsection = (secId: string, subId: string) => {
    setSections(sections.map(s => s.id === secId ? {
      ...s,
      subsections: s.subsections.filter((sub: any) => sub.id !== subId)
    } : s));
  };

  const updateSection = (id: string, key: string, val: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [key]: val } : s));
  };

  const updateSubsection = (secId: string, subId: string, key: string, val: any) => {
    setSections(sections.map(s => s.id === secId ? {
      ...s,
      subsections: s.subsections.map((sub: any) => sub.id === subId ? { ...sub, [key]: val } : sub)
    } : s));
  };

  const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\\n");
      const parsedSections: any[] = [];
      let currentSection: any = null;
      let currentSub: any = null;

      for (const line of lines) {
         if (line.startsWith("Tags: ")) setTags(line.replace("Tags: ", "").trim());
         if (line.startsWith("Category: ")) setCategory(line.replace("Category: ", "").trim());
         if (line.startsWith("Difficulty: ")) setDifficulty(line.replace("Difficulty: ", "").trim().toUpperCase());
         if (line.startsWith("Cover: ")) setCoverImage(line.replace("Cover: ", "").trim());
         if (line.startsWith("Description: ")) setDescription(line.replace("Description: ", "").trim());
         
         if (line.startsWith("# ")) {
             if (!title) handleTitleChange(line.replace("# ", "").trim());
             currentSection = { id: Math.random().toString(), title: line.replace("# ", "").trim(), subsections: [] };
             parsedSections.push(currentSection); currentSub = null;
         } else if (line.startsWith("## ") && currentSection) {
             currentSub = { id: Math.random().toString(), title: line.replace("## ", "").trim(), content: "" };
             currentSection.subsections.push(currentSub);
         } else if (currentSub) { currentSub.content += line + "\\n"; }
      }
      setSections(replaceExisting ? parsedSections : [...sections, ...parsedSections]);
      setMode("FORM");
    } catch {}
  };

  const handleSubmit = async (submitStatus: string) => {
    setLoading(true);
    const payload = {
      title, slug, description, category, difficulty,
      readTime: Number(readTime), icon, coverImage, tags,
      status: submitStatus,
      sections: sections.map((s, idx) => ({
         title: s.title,
         order: idx,
         subsections: s.subsections.map((sub: any, sIdx: number) => ({
            title: sub.title,
            content: sub.content,
            order: sIdx
         }))
      }))
    };

    try {
      const url = initialData ? \`/api/admin/cheatsheets/\${initialData.id}\` : "/api/admin/cheatsheets";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/admin/cheatsheets");
      } else {
        const err = await res.json();
        alert(err.message || "Something went wrong");
      }
    } catch { alert("Network Error"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex bg-muted p-1 rounded-lg w-fit gap-0.5">
        <Button variant={mode === "FORM" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("FORM")}><FileText className="h-4 w-4 mr-1 ml-[-4px]" /> Form Builder</Button>
        <Button variant={mode === "MARKDOWN" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("MARKDOWN")}><FileText className="h-4 w-4 mr-1 ml-[-4px]" /> AI/Markdown Paste</Button>
      </div>

      {mode === "MARKDOWN" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> AI / Markdown Paste Importer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <textarea value={markdownInput} onChange={e => setMarkdownInput(e.target.value)} className="w-full h-80 rounded-md border bg-background px-3 py-2 text-xs font-mono" placeholder={'# Section\\n## Subsection\\nContent...'} />
            <div className="flex items-center justify-between pt-2">
               <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"><input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)} /> Replace existing sections</label>
               <Button size="sm" onClick={handleMarkdownParse}>Apply to Form</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "FORM" && (
        <>
        <Card className="bg-card rounded-2xl border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{initialData ? "Edit Cheatsheets" : "New Cheatsheet"}</CardTitle>
          <CardDescription>Fill out metadata information describing your guides summary setups natively.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Title</label>
              <Input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g., Docker CLI Essentials" />
              {slug && <span className="text-xs text-muted-foreground mt-0.5 block">Slug: {slug}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Slug</label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short overview describing this cheatsheet topics." />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 {["Linux", "Docker", "Kubernetes", "Git", "Terraform", "Ansible", "Helm", "AWS CLI", "Security", "CI/CD", "Monitoring", "Other"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Read Time (min)</label>
              <Input type="number" value={readTime} onChange={e => setReadTime(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Icon Emoji</label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="📋" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Sections & Subsections</h2>
          <Button type="button" size="sm" onClick={addSection} className="gap-1.5 h-8">
            <PlusCircle className="h-4 w-4" /> Add Section
          </Button>
        </div>

        {sections.map((sec, secIdx) => (
          <div key={sec.id} className="border border-border/40 bg-card p-4 rounded-xl shadow-sm space-y-3">
             <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg gap-2">
                <div className="flex-1">
                    <Input value={sec.title} onChange={e => updateSection(sec.id, "title", e.target.value)} placeholder="Section Title (e.g., Basic Commands)" className="h-9 font-semibold" />
                </div>
                <div className="flex items-center gap-1">
                     <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSection(sec.id)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                </div>
             </div>

             <div className="pl-6 space-y-3 border-l-2 border-dashed border-border/30 mt-2">
                 {sec.subsections.map((sub: any) => (
                      <div key={sub.id} className="p-3 bg-muted/10 rounded-lg border border-border/10 space-y-2">
                          <div className="flex justify-between gap-2">
                              <Input value={sub.title} onChange={e => updateSubsection(sec.id, sub.id, "title", e.target.value)} placeholder="Subsection Title (e.g., File Listing)" className="h-8 text-sm font-medium" />
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive/80" onClick={() => removeSubsection(sec.id, sub.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                          </div>
                          <Textarea value={sub.content} onChange={e => updateSubsection(sec.id, sub.id, "content", e.target.value)} placeholder="Content Support Layouts..." className="text-xs font-mono" rows={3} />
                      </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addSubsection(sec.id)} className="gap-1.5 h-8 text-xs">
                     <PlusCircle className="h-3.5 w-3.5" /> Add Subsection
                  </Button>
              </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="p-12 text-center border rounded-xl bg-muted/10 border-dashed text-muted-foreground">
             No sections created yet. Click "+ Add Section" to start building.
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end items-center sticky bottom-6 bg-background/80 backdrop-blur-md p-4 border border-border/40 rounded-2xl shadow-md mt-6">
         <Button type="button" variant="outline" onClick={() => handleSubmit("DRAFT")} disabled={loading} className="gap-1.5">
            <Save className="h-4 w-4" /> {status === "DRAFT" ? "Update Draft" : "Save as Draft"}
         </Button>
         <Button type="button" onClick={() => handleSubmit("PUBLISHED")} disabled={loading} className="gap-1.5">
            <FileText className="h-4 w-4" /> {status === "PUBLISHED" ? "Update Published" : "Publish Live"}
         </Button>
      </div>
      </>
      )}
    </div>
  );
}`;

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Rebuilt File successfully.');
