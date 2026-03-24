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
  // Wrap all tables in scroll containers to avoid display:block distortion hacks.
  return html
    .replace(/<table/g, '<div class="w-full overflow-x-auto my-5 border border-border/20 rounded-xl shadow-sm"><table class="w-full border-collapse"')
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
  "prose prose-base md:prose-lg dark:prose-invert max-w-none",
  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24",
  "prose-p:leading-relaxed prose-p:mb-5",
  "prose-ul:mb-5 prose-ol:mb-5 prose-li:mb-1.5",
  "prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:underline-offset-4",
  "prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl",
  "prose-img:rounded-2xl prose-img:border prose-img:shadow-xl",
  "prose-th:border prose-th:border-border/40 prose-th:px-3.5 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:tracking-wider prose-th:bg-muted/40",
  "prose-td:border prose-td:border-border/20 prose-td:px-3.5 prose-td:py-1.5 prose-td:text-sm prose-td:leading-normal",
  "[&_code]:before:content-none [&_code]:after:content-none",
  "[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:text-foreground [&_:not(pre)>code]:border",
  "[&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded",
  "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] [&_:not(pre)>code]:font-semibold",
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
    <div id="devhub-cheatsheet-area" className="space-y-12">
      {sections.map((sec: any) => (
        <section key={sec.id} className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight pb-3 border-b border-border/60">
            {sec.title}
          </h2>
          <div className="space-y-8 pl-1">
            {sec.subsections.map((sub: any) => (
              <div key={sub.id} className="space-y-3 p-5 md:p-6 bg-card/40 rounded-2xl border border-border/10 shadow-sm">
                <h3 className="text-xl font-bold tracking-tight text-foreground/90 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                   {sub.title}
                </h3>
                <div 
                   className={PROSE}
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
