"use client";

import { useEffect } from "react";
import { marked } from "marked";
import hljs from "highlight.js";

function isAsciiDiagram(text: string): boolean {
  return /\+[-=+]{2,}/.test(text) || /\|.+\|/.test(text);
}

function buildRenderer() {
  const renderer = new marked.Renderer();

  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const trimmed = text.replace(/^\n+/, "").replace(/\n+$/, "");
    const isPlain = !lang || !hljs.getLanguage(lang);
    const validLang = isPlain ? "plaintext" : lang!;
    const highlighted = hljs.highlight(trimmed, { language: validLang }).value;

    let label: string;
    let blockClass: string;
    if (isPlain) {
      label = isAsciiDiagram(trimmed) ? "◈ DIAGRAM" : "TEXT";
      blockClass = "devhub-code-block devhub-code-block--terminal";
    } else {
      label = validLang.toUpperCase();
      blockClass = "devhub-code-block";
    }

    const encoded = encodeURIComponent(trimmed);

    return `
<div class="${blockClass}" data-lang="${validLang}">
  <div class="devhub-code-header">
    <span class="devhub-lang-label">${label}</span>
    <button class="devhub-copy-btn" data-code="${encoded}" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      <span>Copy</span>
    </button>
  </div>
  <pre class="devhub-pre"><code class="hljs language-${validLang}">${highlighted}</code></pre>
</div>`;
  };

  return renderer;
}

marked.use({ gfm: true, breaks: false, renderer: buildRenderer() });

function parseMarkdown(content: string): string {
  const html = marked.parse(content) as string;
  // KINETIC TABLE ENHANCEMENT: Made the entire container hoverable with a primary glow effect
  // Added a dynamic lift (translate-y-1) and a primary-accented glowing shadow on hover
  return html
    .replace(/<table/g, '<div class="w-full overflow-x-auto my-10 border-t-2 border-primary/40 dark:border-primary/60 border-x border-b border-border/20 rounded-2xl shadow-xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] bg-background/80 dark:bg-zinc-950/40 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 group/table"><table class="w-full border-collapse divide-y divide-border/20"')
    .replace(/<\/table>/g, '</table></div>');
}

function wireCopyButtons(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll<HTMLButtonElement>(".devhub-copy-btn").forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "true";

    btn.addEventListener("click", async () => {
      const text = decodeURIComponent(btn.dataset.code ?? "");
      await navigator.clipboard.writeText(text).catch(() => { });

      const span = btn.querySelector("span");
      if (span) {
         span.innerText = "Copied!";
         btn.classList.add("copied");
         setTimeout(() => {
             span.innerText = "Copy";
             btn.classList.remove("copied");
         }, 1500);
      }
    });
  });
}

const PROSE = [
  "devhub-prose",
  "prose prose-base md:prose-lg dark:prose-invert max-w-none text-foreground/90",
  "prose-headings:font-black prose-headings:tracking-tight prose-headings:scroll-mt-24",
  "prose-p:leading-relaxed prose-p:mb-5 prose-p:opacity-90 dark:prose-p:opacity-80 font-bold",
  "prose-ul:mb-5 prose-ol:mb-5 prose-li:mb-1.5",
  "prose-a:text-primary prose-a:no-underline prose-a:font-black hover:prose-a:underline prose-a:underline-offset-4",
  "prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary/60 prose-blockquote:bg-primary/5 dark:prose-blockquote:bg-primary/[0.03] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:shadow-inner",
  "prose-img:rounded-3xl prose-img:border prose-img:shadow-2xl dark:prose-img:shadow-[0_0_50px_rgba(59,130,246,0.1)]",
  /* ULTRA-PREMIUM KINETIC TABLE STYLING */
  "prose-th:px-6 prose-th:py-5 prose-th:text-left prose-th:text-[11px] prose-th:font-black prose-th:uppercase prose-th:tracking-[0.2em] prose-th:bg-muted/80 dark:prose-th:bg-zinc-900/90 prose-th:text-foreground/80",
  "prose-td:px-6 prose-td:py-5 prose-td:text-[14px] prose-td:leading-normal prose-td:font-black prose-td:text-foreground/90",
  "[&_tr:has(td)]:hover:bg-primary/[0.08] dark:[&_tr:has(td)]:hover:bg-primary/[0.12] [&_tr:has(td)]:transition-all [&_tr:has(td)]:duration-300 [&_tr:has(td)]:cursor-default [&_tr:has(td)]:hover:translate-x-1.5",
  "[&_tr:nth-child(even)]:bg-muted/10 dark:[&_tr:nth-child(even)]:bg-white/[0.02]",
  "[&_code]:before:content-none [&_code]:after:content-none",
  /* ULTRA-MODERN GLOW PILLS (FLAGS) */
  "[&_:not(pre)>code]:bg-primary/10 dark:[&_:not(pre)>code]:bg-primary/20 [&_:not(pre)>code]:text-primary [&_:not(pre)>code]:border [&_:not(pre)>code]:border-primary/30",
  "[&_:not(pre)>code]:px-2.5 [&_:not(pre)>code]:py-1 [&_:not(pre)>code]:rounded-lg [&_:not(pre)>code]:shadow-[0_0_15px_rgba(59,130,246,0.2)]",
  "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.8em] [&_:not(pre)>code]:font-black [&_:not(pre)>code]:tracking-tighter",
  "prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-pre:shadow-none prose-pre:border-0 prose-pre:rounded-none",
].join(" ");

export function CheatsheetContent({ sections, slug }: { sections: any[], slug?: string }) {
  useEffect(() => {
     wireCopyButtons("devhub-cheatsheet-area");

     if (slug) {
         const key = `viewed_cheatsheet_${slug}`;
         const viewed = localStorage.getItem(key);
         if (!viewed) {
             fetch(`/api/cheatsheets/${slug}/view`, { method: "POST" })
                 .catch(() => { }); // Ignore errors
             localStorage.setItem(key, "true");
         }
     }
  }, [sections, slug]);

  return (
    <div id="devhub-cheatsheet-area" className="space-y-16">
      {sections.map((sec: any) => (
        <section key={sec.id} className="space-y-10 relative">
          {/* Main Section Header */}
          <div className="flex items-center gap-4 pb-5 border-b border-border/20">
            <div className="h-8 w-1.5 rounded-full bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-foreground drop-shadow-sm">
              {sec.title}
            </h2>
          </div>
          
          <div className="space-y-10 md:pl-3">
            {sec.subsections.map((sub: any) => (
              <div key={sub.id} className="relative group space-y-5 p-7 md:p-10 bg-background/50 dark:bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[2.5rem] border border-border/40 dark:border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)] transition-all duration-700 overflow-hidden ring-1 ring-white/10 dark:ring-white/[0.02] group/card">
                
                {/* ADVANCED ATMOSPHERIC EFFECTS (DARK MODE) */}
                <div 
                   className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-0 dark:opacity-20 group-hover:opacity-40 transition-all duration-1000 pointer-events-none" 
                   style={{ backgroundColor: `rgba(59,130,246,0.15)` }} 
                />
                <div 
                   className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-0 dark:opacity-10 group-hover:opacity-20 transition-all duration-1000 pointer-events-none" 
                   style={{ backgroundColor: `rgba(16,185,129,0.1)` }} 
                />

                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-4 group-hover/card:translate-x-1 transition-transform duration-500">
                   <div className="w-3 h-3 rounded-full bg-primary shrink-0 shadow-[0_0_15px_rgba(59,130,246,1)] outline outline-4 outline-primary/10" />
                   {sub.title}
                </h3>
                
                <div 
                   className={PROSE + " relative z-10"}
                   dangerouslySetInnerHTML={{ __html: parseMarkdown(sub.content) }}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
