"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CATEGORIES = ["Containerization", "Orchestration", "CI/CD", "IaC", "Monitoring", "Logging", "Security", "Service Mesh", "GitOps", "MLOps", "Networking", "Other"];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LICENSES = ["Open Source", "Proprietary", "Freemium", "Free"];

export function ToolForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const mdInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "Other");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "BEGINNER");
  const [license, setLicense] = useState(initialData?.license || "Open Source");
  const [icon, setIcon] = useState(initialData?.icon || "🔧");
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [docsUrl, setDocsUrl] = useState(initialData?.docsUrl || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [moduleUrl, setModuleUrl] = useState(initialData?.moduleUrl || "");
  const [resourceUrl, setResourceUrl] = useState(initialData?.resourceUrl || "");
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");

  // Arrays
  const [pros, setPros] = useState<string[]>(initialData?.pros || []);
  const [cons, setCons] = useState<string[]>(initialData?.cons || []);
  const [useCases, setUseCases] = useState<string[]>(initialData?.useCases || []);

  const [loading, setLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    const s = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(s);
  };

  const [pasteText, setPasteText] = useState("");
  const [showPasteModal, setShowPasteModal] = useState<"JSON" | "MD" | null>(null);

  const applyJson = (text: string) => {
     try {
         const data = JSON.parse(text);
         if (data.name) handleNameChange(data.name);
         if (data.slug) setSlug(data.slug);
         if (data.description) setDescription(data.description);
         if (data.category) setCategory(data.category);
         if (data.difficulty) setDifficulty(data.difficulty);
         if (data.license) setLicense(data.license);
         if (data.icon) setIcon(data.icon);
         if (data.logoUrl) setLogoUrl(data.logoUrl);
         if (data.docsUrl) setDocsUrl(data.docsUrl);
         if (data.githubUrl) setGithubUrl(data.githubUrl);
         if (data.tags) setTags(data.tags);
         if (data.pros) setPros(data.pros);
         if (data.cons) setCons(data.cons);
         if (data.useCases) setUseCases(data.useCases);
         if (data.moduleUrl) setModuleUrl(data.moduleUrl);
         if (data.resourceUrl) setResourceUrl(data.resourceUrl);
         setShowPasteModal(null);
         setPasteText("");
     } catch (err) { alert("Invalid JSON"); }
  };

  const applyMarkdown = (text: string) => {
     const frontmatterMatch = text.match(/^---([\s\S]*?)---/);
     
     if (frontmatterMatch) {
        try {
           const lines = frontmatterMatch[1].split('\n');
           const data: any = {};
           lines.forEach(l => {
             const [k, ...v] = l.split(':');
             if (k && v.length) data[k.trim()] = v.join(':').trim();
           });
           if (data.name) handleNameChange(data.name);
           if (data.slug) setSlug(data.slug);
           if (data.description) setDescription(data.description);
           if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category);
           if (data.difficulty) setDifficulty(data.difficulty);
           if (data.license) setLicense(data.license);
           if (data.icon) setIcon(data.icon);
           if (data.docsUrl) setDocsUrl(data.docsUrl);
           if (data.githubUrl) setGithubUrl(data.githubUrl);
           if (data.logoUrl) setLogoUrl(data.logoUrl);
           if (data.tags) setTags(data.tags);
           if (data.moduleUrl) setModuleUrl(data.moduleUrl);
           if (data.resourceUrl) setResourceUrl(data.resourceUrl);
        } catch {}
     }

     const nameMatch = text.match(/^# (.*)/m);
     if (nameMatch) handleNameChange(nameMatch[1].trim());

     const descMatch = text.match(/^## Description\n([\s\S]*?)(?=\n## |$)/im);
     if (descMatch) setDescription(descMatch[1].trim());

     const prosMatch = text.match(/^## Pros\n([\s\S]*?)(?=\n## |$)/im);
     if (prosMatch) {
         const items = prosMatch[1].split('\n').map(l => l.replace(/^[-*+]\s*/, '').trim()).filter(Boolean);
         setPros(items);
     }
     const consMatch = text.match(/^## Cons\n([\s\S]*?)(?=\n## |$)/im);
     if (consMatch) {
         const items = consMatch[1].split('\n').map(l => l.replace(/^[-*+]\s*/, '').trim()).filter(Boolean);
         setCons(items);
     }
     
     const useCasesMatch = text.match(/^## Use Cases\n([\s\S]*?)(?=\n## |$)/im);
     if (useCasesMatch) {
         const items = useCasesMatch[1].split('\n').map(l => l.replace(/^[-*+]\s*/, '').trim()).filter(Boolean);
         setUseCases(items);
     }
     
     setShowPasteModal(null);
     setPasteText("");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.name) handleNameChange(data.name);
        if (data.slug) setSlug(data.slug);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.license) setLicense(data.license);
        if (data.icon) setIcon(data.icon);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.docsUrl) setDocsUrl(data.docsUrl);
        if (data.githubUrl) setGithubUrl(data.githubUrl);
        if (data.tags) setTags(data.tags);
        if (data.pros) setPros(data.pros);
        if (data.cons) setCons(data.cons);
        if (data.useCases) setUseCases(data.useCases);
        if (data.moduleUrl) setModuleUrl(data.moduleUrl);
        if (data.resourceUrl) setResourceUrl(data.resourceUrl);
      } catch (err) { alert("Invalid JSON"); }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset
  };

  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const frontmatterMatch = text.match(/^---([\s\S]*?)---/);
      
      if (frontmatterMatch) {
         try {
            const lines = frontmatterMatch[1].split('\n');
            const data: any = {};
            lines.forEach(l => {
              const [k, ...v] = l.split(':');
              if (k && v.length) data[k.trim()] = v.join(':').trim();
            });
            if (data.name) handleNameChange(data.name);
            if (data.slug) setSlug(data.slug);
            if (data.description) setDescription(data.description);
            if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category);
            if (data.difficulty) setDifficulty(data.difficulty);
            if (data.license) setLicense(data.license);
            if (data.icon) setIcon(data.icon);
            if (data.docsUrl) setDocsUrl(data.docsUrl);
            if (data.githubUrl) setGithubUrl(data.githubUrl);
            if (data.logoUrl) setLogoUrl(data.logoUrl);
            if (data.tags) setTags(data.tags);
            if (data.moduleUrl) setModuleUrl(data.moduleUrl);
            if (data.resourceUrl) setResourceUrl(data.resourceUrl);
         } catch {}
      }

      const nameMatch = text.match(/^# (.*)/m);
      if (nameMatch) handleNameChange(nameMatch[1].trim());

      const descMatch = text.match(/^## Description\n([\s\S]*?)(?=\n## |$)/im);
      if (descMatch) setDescription(descMatch[1].trim());

      const prosMatch = text.match(/^## Pros\n([\s\S]*?)(?=\n## |$)/im);
      if (prosMatch) {
         const items = prosMatch[1].split('\n').map(l => l.replace(/^[-*+]\s*/, '').trim()).filter(Boolean);
         setPros(items);
      }
      const consMatch = text.match(/^## Cons\n([\s\S]*?)(?=\n## |$)/im);
      if (consMatch) {
         const items = consMatch[1].split('\n').map(l => l.replace(/^[-*+]\s*/, '').trim()).filter(Boolean);
         setCons(items);
      }
      
      const useCasesMatch = text.match(/^## Use Cases\n([\s\S]*?)(?=\n## |$)/im);
      if (useCasesMatch) {
         const items = useCasesMatch[1].split('\n').map(l => l.replace(/^[-*+]\s*/, '').trim()).filter(Boolean);
         setUseCases(items);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset
  };

  const handleArrayChange = (setter: any, arr: string[], idx: number, val: string) => {
    const copy = [...arr];
    copy[idx] = val;
    setter(copy);
  };

  const removeArrayItem = (setter: any, arr: string[], idx: number) => {
    setter(arr.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      name, slug, description, category, difficulty, license,
      icon, logoUrl, docsUrl, githubUrl, tags, status,
      pros, cons, useCases, moduleUrl, resourceUrl
    };

    try {
      const url = initialData ? `/api/admin/tools/${initialData.id}` : "/api/admin/tools";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/admin/tools");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save");
      }
    } catch { alert("Network Error"); }
    setLoading(false);
  };

  const renderListBuilder = (title: string, items: string[], setter: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
         <label className="text-sm font-semibold text-foreground">{title}</label>
         <Button type="button" variant="outline" size="sm" onClick={() => setter([...items, ""])} className="h-7 text-xs gap-1">
             <PlusCircle className="h-3 w-3" /> Add {title.slice(0, -1)}
         </Button>
      </div>
      <div className="space-y-1.5">
          {items.map((item, idx) => (
             <div key={idx} className="flex gap-2">
                 <Input value={item} onChange={e => handleArrayChange(setter, items, idx, e.target.value)} placeholder={`e.g., ...`} className="h-8 text-xs" />
                 <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(setter, items, idx)} className="h-8 w-8 text-destructive">
                     <Trash2 className="h-3.5 w-3.5" />
                 </Button>
             </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-card rounded-2xl border border-border/40 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">{initialData ? "Edit Tool" : "New Tool"}</CardTitle>
            <CardDescription>Fill out tool descriptive elements setup natively.</CardDescription>
          </div>
          <div className="flex gap-2">
             <input type="file" ref={jsonInputRef} accept=".json" onChange={handleImportJson} className="hidden" />
             <input type="file" ref={mdInputRef} accept=".md" onChange={handleImportMarkdown} className="hidden" />
             
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
                      placeholder={`Paste your ${showPasteModal} here...`} 
                      rows={12} 
                      className="font-mono text-xs bg-muted/20" 
                   />
                   <div className="flex justify-end gap-2 pt-2">
                       <Button type="button" variant="outline" onClick={() => { setShowPasteModal(null); setPasteText(""); }}>Cancel</Button>
                       <Button type="button" onClick={() => {
                           if (showPasteModal === "JSON") applyJson(pasteText);
                           else applyMarkdown(pasteText);
                       }}>
                           Load & Apply
                       </Button>
                   </div>
               </div>
           </div>
        )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Name</label>
              <Input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g., Docker" />
              {slug && <span className="text-xs text-muted-foreground mt-0.5 block">Slug: {slug}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Slug</label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short overview describing uses..." rows={3} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 {CATEGORIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 {DIFFICULTIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">License</label>
              <select value={license} onChange={e => setLicense(e.target.value)} className="h-9 w-full px-3 border rounded-md bg-background text-sm">
                 {LICENSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Icon (Emoji)</label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🔧" maxLength={2} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Logo URL</label>
              <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Docs URL</label>
              <Input value={docsUrl} onChange={e => setDocsUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">GitHub URL</label>
              <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/10 pt-4 mt-2">
             <div className="space-y-1">
                 <label className="text-xs font-bold text-primary flex items-center gap-1"><PlusCircle className="h-3.5 w-3.5" /> Connect to Module Course (Optional)</label>
                 <Input value={moduleUrl} onChange={e => setModuleUrl(e.target.value)} placeholder="e.g., /modules/docker-basics" className="h-9 text-xs" />
             </div>
             <div className="space-y-1">
                 <label className="text-xs font-bold text-primary flex items-center gap-1"><Save className="h-3.5 w-3.5" /> Connect to Resource Guide (Optional)</label>
                 <Input value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} placeholder="e.g., /resources/notes" className="h-9 text-xs" />
             </div>
          </div>

          <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Tags</label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="comma, separated" />
          </div>

          <div className="h-px bg-border/20 my-2" />

          {/* Dynamic Builders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderListBuilder("Pros", pros, setPros)}
              {renderListBuilder("Cons", cons, setCons)}
          </div>
          <div className="mt-4">
              {renderListBuilder("Use Cases", useCases, setUseCases)}
          </div>

          <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={status === "PUBLISHED"} onChange={e => setStatus(e.target.checked ? "PUBLISHED" : "DRAFT")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" id="pub" />
              <label htmlFor="pub" className="text-sm font-medium">Publish Live</label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-6 bg-background/80 backdrop-blur-md p-4 border border-border/40 rounded-2xl shadow-md">
         <Button type="button" onClick={handleSubmit} disabled={loading} className="gap-1.5">
            <Save className="h-4 w-4" /> {initialData ? "Update Tool" : "Create Tool"}
         </Button>
      </div>
    </div>
  );
}
