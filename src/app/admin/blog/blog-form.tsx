"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { ContentImageManager } from "@/components/content-image-manager";
import { Editor } from "@/components/editor";


const CATEGORIES = ["Docker", "Kubernetes", "Terraform", "Linux", "Security", "CI/CD", "MLOps", "AIOps", "SecOps", "Career", "General"];

export function BlogForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [category, setCategory] = useState(initialData?.category || "General");
  const [readAmount, setReadAmount] = useState<number>(
    initialData?.readTime ? (
      initialData.readTime >= 43200 ? Math.floor(initialData.readTime / 43200) :
      initialData.readTime >= 1440 ? Math.floor(initialData.readTime / 1440) :
      initialData.readTime >= 60 ? Math.floor(initialData.readTime / 60) : initialData.readTime
    ) : 5
  );
  const [readUnit, setReadUnit] = useState<string>(
    initialData?.readTime ? (
      initialData.readTime >= 43200 ? "month" :
      initialData.readTime >= 1440 ? "days" :
      initialData.readTime >= 60 ? "hours" : "min"
    ) : "min"
  );
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");

  const [tags, setTags] = useState(initialData?.tags || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"FORM" | "MARKDOWN">("FORM");
  const [markdownInput, setMarkdownInput] = useState("");
  const [collapsedContent, setCollapsedContent] = useState(false);


  const handleTitleChange = (val: string) => {
    setTitle(val);
    const s = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(s);
  };

  const handleMarkdownParse = () => {
    try {
      const trimmedInput = markdownInput.trim();
      let contentFound = trimmedInput;
      let tFound = "";

      // 1. Detect Standard YAML Frontmatter between ---
      const matchYaml = trimmedInput.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

      if (matchYaml) {
         const yaml = matchYaml[1];
         contentFound = matchYaml[2];

         yaml.split("\n").forEach(line => {
             const idx = line.indexOf(":");
             if (idx === -1) return;
             const key = line.slice(0, idx).trim().toLowerCase();
             const val = line.slice(idx + 1).trim();

             if (key === "tags") setTags(val);
             if (key === "category") setCategory(val);
             if (key === "cover" || key === "coverimage") setCoverImage(val);
             if (key === "excerpt") setExcerpt(val);
             if (key === "title") tFound = val;
         });
      } else {
         // 2. Fallback prefix-matching parser node
         contentFound = "";
         markdownInput.split("\n").forEach(line => {
             if (line.startsWith("Tags: ")) { setTags(line.replace("Tags: ", "").trim()); return; }
             if (line.startsWith("Category: ")) { setCategory(line.replace("Category: ", "").trim()); return; }
             if (line.startsWith("Cover: ")) { setCoverImage(line.replace("Cover: ", "").trim()); return; }
             if (line.startsWith("Excerpt: ")) { setExcerpt(line.replace("Excerpt: ", "").trim()); return; }

             if (line.startsWith("# ") && !tFound) {
                 tFound = line.replace("# ", "").trim();
             }
             contentFound += line + "\n";
         });
      }

      const h1Match = contentFound.match(/^# (.*?)$/m);
      if (h1Match && !tFound) {
          tFound = h1Match[1].trim();
      }

      if (tFound) handleTitleChange(tFound);
      setContent(contentFound.trim()); 
      setMode("FORM");
    } catch (e) { console.error(e); }
  };


  const handleSubmit = async (submitStatus: string) => {
    setLoading(true);
    const payload = {
      title, slug, excerpt, content, category,
      readTime: Number(readAmount) * (readUnit === "month" ? 43200 : readUnit === "days" ? 1440 : readUnit === "hours" ? 60 : 1),
      coverImage, tags,
      status: submitStatus,
      isPinned
    };


    try {
      const url = initialData ? `/api/admin/blog/${initialData.id}` : "/api/admin/blog";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/admin/blog");
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
            <textarea value={markdownInput} onChange={e => setMarkdownInput(e.target.value)} className="w-full h-80 rounded-md border bg-background px-3 py-2 text-xs font-mono" placeholder={'# Blog Title\nYour content supports natively triggers...'} />
            <div className="flex justify-end pt-2"><Button size="sm" onClick={handleMarkdownParse}>Apply to Form</Button></div>
          </CardContent>
        </Card>
      )}

      {mode === "FORM" && (
        <Card className="bg-card rounded-2xl border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{initialData ? "Edit Blog Post" : "New Blog Post"}</CardTitle>
          <CardDescription>Fill out metadata describing your articles setups natively.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Title</label>
              <Input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g., Understanding Kubernetes Network Policies" />
              {slug && <span className="text-xs text-muted-foreground mt-0.5 block">Slug: {slug}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Slug</label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Excerpt</label>
            <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary explaining the contents." rows={2} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 {CATEGORIES.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                 ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Read Time</label>
              <div className="flex gap-1">
                <Input type="number" value={readAmount} onChange={e => setReadAmount(Number(e.target.value))} className="h-9 w-16" />
                <select value={readUnit} onChange={e => setReadUnit(e.target.value)} className="h-9 px-1 border rounded-md bg-background text-sm">
                  <option value="min">min</option>
                  <option value="hours">hr</option>
                  <option value="days">days</option>
                  <option value="month">mon</option>
                </select>
              </div>
            </div>
            <div className="col-span-1">
              <label className="text-sm font-semibold text-foreground">Tags</label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="comma, separated" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input 
                type="checkbox" 
                id="isPinned" 
                checked={isPinned} 
                onChange={e => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isPinned" className="text-sm font-semibold text-foreground cursor-pointer">Pin to Home</label>
            </div>
          </div>

          <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Cover Image</label>
              <div className="flex gap-2">
                 <Input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://... or auto-uploaded paths" className="flex-1 h-9" />
                 <input type="file" id="cover-upload" accept="image/*" className="hidden" onChange={async (e) => {
                     const f = e.target.files?.[0]; if (!f) return;
                     const fd = new FormData(); fd.append("file", f);
                     try {
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const d = await res.json(); if (d.url) setCoverImage(d.url);
                     } catch { alert("Upload Failed"); }
                 }} />
                 <Button type="button" variant="outline" size="sm" className="h-9 px-3 text-xs" onClick={() => document.getElementById("cover-upload")?.click()}>Upload File</Button>
              </div>
          </div>

          <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Article Content (Markdown)</label>
              <Textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="# Introduction\nYour markdown content..." 
                className="font-mono text-sm leading-relaxed"
                rows={20} 
              />
              <div className="mt-2">
                <ContentImageManager content={content} onChange={setContent} />
              </div>
          </div>




        </CardContent>
      </Card>)}

      <div className="flex gap-3 justify-end items-center sticky bottom-6 bg-background/80 backdrop-blur-md p-4 border border-border/40 rounded-2xl shadow-md">
         <Button type="button" variant="outline" onClick={() => handleSubmit("DRAFT")} disabled={loading} className="gap-1.5">
            <Save className="h-4 w-4" /> {status === "DRAFT" ? "Update Draft" : "Save as Draft"}
         </Button>
         <Button type="button" onClick={() => handleSubmit("PUBLISHED")} disabled={loading} className="gap-1.5">
            <FileText className="h-4 w-4" /> {status === "PUBLISHED" ? "Update Published" : "Publish Live"}
         </Button>
      </div>
    </div>
  );
}
