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
  return marked.parse(content) as string;
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
              <div key={sub.id} className="space-y-3">
                <h3 className="text-xl font-bold tracking-tight text-foreground/90">
                   {sub.title}
                </h3>
                <div 
                   className="devhub-prose prose prose-invert max-w-none text-muted-foreground leading-relaxed text-sm md:text-base"
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
