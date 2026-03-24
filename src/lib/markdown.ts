import { marked } from "marked";
import hljs from "highlight.js";

// ── ASCII diagram detector ─────────────────────────────────────────────────
export function isAsciiDiagram(text: string): boolean {
  const lines = text.split("\n").filter((l: string) => l.trim());
  if (lines.length < 1) return false;

  // Box-drawing: +----+ or |text|
  if (/\+[-=+]{2,}/.test(text) || /\|.+\|/.test(text)) return true;

  // Any unicode arrow or line-draw character (→ ← ↑ ↓ ↔ ⇒ ⇐ ⟶ ➜ ➡ ─ ═ └ ┌ ┐ ┘ ├ ┤ ┬ ┴ ┼)
  const arrowCount = (text.match(/[→←↑↓↔↕⇒⇐⇔⟶⟵⟷➜➡➞➝─═└┘┌┐├┤┬┴┼]/g) || []).length;
  if (arrowCount >= 1) return true;

  // ASCII arrows: -> <-  --> <-- => <=  ==>
  const asciiArrows = (text.match(/(-->|<--|->|<-|=>|<=|==>)/g) || []).length;
  if (asciiArrows >= 1) return true;

  // Step/numbered flow: lines starting with 1. 2. 3. style across multiple lines
  const numberedLines = lines.filter((l: string) => /^\s*\d+[\.\)]\s+\S/.test(l)).length;
  if (numberedLines >= 3) return true;

  // Indented block with separator line (----, ====)
  const hasSeparator = lines.some((l: string) => /^[-─═]{4,}$/.test(l.trim()));
  const hasIndented = lines.filter((l: string) => /^\s{2,}\S/.test(l)).length >= 2;
  if (hasSeparator && hasIndented) return true;

  // Key: value table-like pattern (used in config/env diagrams)
  const kvLines = lines.filter((l: string) => /^\s*\S+\s*[:=]\s*\S+/.test(l)).length;
  if (kvLines >= 3 && lines.length >= 3) return true;

  return false;
}

// ── Marked custom renderer ────────────────────────────────────────────────
export function buildRenderer() {
  const renderer = new marked.Renderer();

  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const blockId = "code-" + Math.abs(hash).toString(36);
    const unescaped = text

      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const trimmed = unescaped.replace(/^\n+/, "").replace(/\n+$/, "");

    let fileName = "";
    let baseLang = lang || "";
    let highlightedLines: number[] = [];

    const highlightMatch = baseLang.match(/\{([\d,\-]+)\}/);
    if (highlightMatch) {
      const rangeStr = highlightMatch[1];
      rangeStr.split(",").forEach(part => {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          for (let i = start; i <= end; i++) highlightedLines.push(i);
        } else {
          highlightedLines.push(Number(part));
        }
      });
      baseLang = baseLang.replace(/\{([\d,\-]+)\}/, "").trim();
    }

    if (baseLang.includes(":")) {
      const parts = baseLang.split(":");
      baseLang = parts[0].trim();
      fileName = parts[1].trim();
    }

    let highlighted: string;
    let validLang = baseLang;

    if (baseLang && hljs.getLanguage(baseLang)) {
      highlighted = hljs.highlight(trimmed, { language: baseLang }).value;
    } else {
      try {
        const autoResult = hljs.highlightAuto(trimmed);
        highlighted = autoResult.value;
        validLang = autoResult.language || "plaintext";
      } catch (_) {
        highlighted = trimmed;
        validLang = "plaintext";
      }
    }

    const LANG_LABELS: Record<string, string> = {
      js: "JavaScript", ts: "TypeScript", jsx: "React JSX", tsx: "React TSX",
      py: "Python", sh: "Shell", bash: "Bash", sql: "SQL",
      yaml: "YAML", yml: "YAML", json: "JSON", dockerfile: "Dockerfile",
      go: "Go", rs: "Rust", css: "CSS", html: "HTML"
    };

    let label: string;
    let blockClass = "devhub-code-block";

    const isDiag = (!baseLang || baseLang === "text") && isAsciiDiagram(trimmed);

    if (isDiag) {
      label = "◈ DIAGRAM";
      blockClass = "devhub-code-block devhub-code-block--terminal";
      validLang = "plaintext";
    } else {
      label = LANG_LABELS[validLang] ?? validLang.toUpperCase();
    }

    const lines = highlighted.split("\n");
    const numberedLines = lines.map((lineContent, i) => {
      const lineNum = i + 1;
      let diffClass = "";
      if (validLang === "diff" || baseLang === "diff") {
        const rawLine = trimmed.split("\n")[i] || "";
        if (rawLine.startsWith("+")) diffClass = " bg-emerald-500/10 text-emerald-400";
        else if (rawLine.startsWith("-")) diffClass = " bg-red-500/10 text-red-400";
      }
      if (highlightedLines.includes(lineNum)) {
        diffClass += " bg-amber-500/10 border-l-2 border-amber-500";
      }
      return `<div class="flex items-start px-4 hover:bg-muted/30${diffClass}"><span class="select-none text-muted-foreground/40 text-right pr-4 font-mono text-xs w-[35px] shrink-0 mt-[2px]">${lineNum}</span><span class="font-mono text-sm leading-relaxed flex-1">${lineContent || " "}</span></div>`;
    }).join("");

    const encoded = encodeURIComponent(trimmed);

    return `
<div class="${blockClass}" data-lang="${validLang}">
  <div class="devhub-code-header flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
    <div class="flex items-center gap-2">
      <span class="devhub-lang-label text-xs font-bold text-primary tracking-wider uppercase">${label}</span>
      ${fileName ? `<span class="text-[10px] font-mono text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded border border-border/50">${fileName}</span>` : ""}
    </div>
    <div class="flex items-center gap-3">
      <button onclick="const c = document.getElementById('${blockId}'); if (c) { const isWrap = c.style.whiteSpace === 'pre-wrap'; c.style.setProperty('white-space', isWrap ? '' : 'pre-wrap', 'important'); c.style.setProperty('word-break', isWrap ? '' : 'break-all', 'important'); this.classList.toggle('text-primary'); }" class="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded" title="Toggle Word Wrap" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h15a3 3 0 1 1 0 6h-4m-2-2-2 2 2 2"/></svg>
      </button>
      <button class="devhub-copy-btn text-muted-foreground/60 hover:text-foreground transition-all p-0.5" data-code="${encoded}" type="button" title="Copy code">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      </button>
    </div>
  </div>
  <div class="devhub-code-content py-3 overflow-x-auto bg-background/50">
    <pre class="bg-transparent p-0 m-0"><code id="${blockId}" class="p-0 bg-transparent block w-full hljs language-${validLang}">${numberedLines}</code></pre>
  </div>

</div>`;
  };

  renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
    const slug = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const sizeClasses: Record<number, string> = {
      1: "text-3xl font-extrabold mb-6 mt-12",
      2: "text-2xl font-bold mb-4 mt-10 scroll-mt-24",
      3: "text-xl font-bold mb-3 mt-8 scroll-mt-24",
      4: "text-lg font-bold mb-2 mt-6",
    };
    const classes = sizeClasses[depth] || "font-bold";
    return `<h${depth} id="${slug}" class="${classes}">${text}</h${depth}>`;
  };

  return renderer;
}

export function parseMarkdown(content: string): string {
  const trimmed = (content || "").trim();
  const isHTML = trimmed.startsWith("<") && trimmed.includes(">");
  if (isHTML) return trimmed;

  const html = marked.parse(trimmed, { renderer: buildRenderer(), gfm: true, breaks: false }) as string;
  return html
    .replace(/<table/g, '<div class="w-full overflow-x-auto my-6 border border-border/40 rounded-xl shadow-lg bg-card/40 backdrop-blur-xl [&_tr:nth-child(even)]:bg-muted/15 [&_tr:hover]:bg-primary/5 [&_tr]:transition-colors"><table class="w-full border-collapse"')
    .replace(/<\/table>/g, '</table></div>');
}
