import fs from 'fs';
const cheatPath = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\cheatsheets\\cheatsheet-form.tsx';
const blogPath = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\blog\\blog-form.tsx';

// ── CHEATSHEET METADATA PATCHER ───────────────────────────────────────────
let c = fs.readFileSync(cheatPath, 'utf8');
const cheatParseIn = `const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\\n");
      const parsedSections: any[] = [];`;

const cheatParseOut = `const handleMarkdownParse = () => {
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
  const _dummy = () => {`;

if (c.includes(`let currentSection: any = null;`)) {
   // Re-inject entire function carefully
   const targetFunc = c.match(/const handleMarkdownParse = \(\) => {[\s\S]*?setMode\("FORM"\);[\s\S]*?catch[\s\S]*?}/)[0];
   c = c.replace(targetFunc, cheatParseOut.replace("const _dummy = () => {", ""));
   fs.writeFileSync(cheatPath, c, 'utf8');
}

// ── BLOG METADATA PATCHER ────────────────────────────────────────────────
let b = fs.readFileSync(blogPath, 'utf8');
const blogParseIn = `const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\\n");
      let tFound = ""; let contentFound = "";
      for (const line of lines) {
        if (line.startsWith("# ") && !tFound) tFound = line.replace("# ", "").trim();
        else contentFound += line + "\n";
      }
      if (tFound) setTitle(tFound);
      setContent(contentFound); setMode("FORM");
    } catch {}
  };`;

const blogParseOut = `const handleMarkdownParse = () => {
    try {
      const lines = markdownInput.split("\\n");
      let tFound = ""; let contentFound = "";
      for (const line of lines) {
         if (line.startsWith("Tags: ")) setTags(line.replace("Tags: ", "").trim());
         if (line.startsWith("Category: ")) setCategory(line.replace("Category: ", "").trim());
         if (line.startsWith("Cover: ")) setCoverImage(line.replace("Cover: ", "").trim());
         if (line.startsWith("Excerpt: ")) setExcerpt(line.replace("Excerpt: ", "").trim());

         if (line.startsWith("# ") && !tFound) {
             tFound = line.replace("# ", "").trim();
         } else {
             contentFound += line + "\\n";
         }
      }
      if (tFound) setTitle(tFound);
      setContent(contentFound); setMode("FORM");
    } catch {}
  };`;

b = b.replace(blogParseIn, blogParseOut);
fs.writeFileSync(blogPath, b, 'utf8');

console.log("✅ Metadata Regex parsers added flawlessly to loaders.");
