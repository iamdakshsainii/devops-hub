import fs from 'fs';
const cheatPath = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\cheatsheets\\cheatsheet-form.tsx';
const blogPath = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\blog\\blog-form.tsx';

// ── CHEATSHEET PATCHER ────────────────────────────────────────────────────────
let c = fs.readFileSync(cheatPath, 'utf8');
if (!c.includes("const [mode, setMode]")) {
  const stateIn = `const [loading, setLoading] = useState(false);`;
  const stateOut = `const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"FORM" | "MARKDOWN">("FORM");
  const [markdownInput, setMarkdownInput] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);`;
  c = c.replace(stateIn, stateOut);

  const parseIn = `const handleSubmit = async (submitStatus: string) => {`;
  const parseOut = `const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\\n");
      const parsedSections: any[] = [];
      let currentSection: any = null;
      let currentSub: any = null;
      for (const line of lines) {
         if (line.startsWith("# ")) {
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

  const handleSubmit = async (submitStatus: string) => {`;
  c = c.replace(parseIn, parseOut);

  const viewIn = `<Card className="bg-card rounded-2xl border border-border/40 shadow-sm">`;
  const viewOut = `<div className="flex bg-muted p-1 rounded-lg w-fit gap-0.5">
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
        <Card className="bg-card rounded-2xl border border-border/40 shadow-sm">`;
  const viewEndIn = `</div>
  );
}`;
  const viewEndOut = `</Card>)}
    </div>
  );
}`;
  c = c.replace(viewIn, viewOut).replace(viewEndIn, viewEndOut);
  fs.writeFileSync(cheatPath, c, 'utf8');
}

// ── BLOG PATCHER ─────────────────────────────────────────────────────────────
let b = fs.readFileSync(blogPath, 'utf8');
if (!b.includes("const [mode, setMode]")) {
  b = b.replace(`const [loading, setLoading] = useState(false);`, `const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"FORM" | "MARKDOWN">("FORM");
  const [markdownInput, setMarkdownInput] = useState("");`);

  b = b.replace(`const handleSubmit = async (submitStatus: string) => {`, `const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\\n");
      let tFound = ""; let contentFound = "";
      for (const line of lines) {
        if (line.startsWith("# ") && !tFound) tFound = line.replace("# ", "").trim();
        else contentFound += line + "\\n";
      }
      if (tFound) setTitle(tFound);
      setContent(contentFound); setMode("FORM");
    } catch {}
  };

  const handleSubmit = async (submitStatus: string) => {`);

  const bViewIn = `<Card className="bg-card rounded-2xl border border-border/40 shadow-sm">`;
  const bViewOut = `<div className="flex bg-muted p-1 rounded-lg w-fit gap-0.5">
        <Button variant={mode === "FORM" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("FORM")}><FileText className="h-4 w-4 mr-1 ml-[-4px]" /> Form Builder</Button>
        <Button variant={mode === "MARKDOWN" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("MARKDOWN")}><FileText className="h-4 w-4 mr-1 ml-[-4px]" /> AI/Markdown Paste</Button>
      </div>

      {mode === "MARKDOWN" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> AI / Markdown Paste Importer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <textarea value={markdownInput} onChange={e => setMarkdownInput(e.target.value)} className="w-full h-80 rounded-md border bg-background px-3 py-2 text-xs font-mono" placeholder={'# Blog Title\\nYour content supports natively triggers...'} />
            <div className="flex justify-end pt-2"><Button size="sm" onClick={handleMarkdownParse}>Apply to Form</Button></div>
          </CardContent>
        </Card>
      )}

      {mode === "FORM" && (
        <Card className="bg-card rounded-2xl border border-border/40 shadow-sm">`;
  
  b = b.replace(bViewIn, bViewOut).replace(`</Card>
      </div>`, `</Card>)}
      </div>`);

  fs.writeFileSync(blogPath, b, 'utf8');
}
console.log("✅ Forms toggled and glassy blurs setups initialized successfully sequential!");
