"use client";

import { useState } from "react";
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
        <CardHeader>
          <CardTitle className="text-xl font-bold">{initialData ? "Edit Tool" : "New Tool"}</CardTitle>
          <CardDescription>Fill out tool descriptive elements setup natively.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
