const fs = require("fs");
let content = fs.readFileSync("src/components/step-viewer.tsx", "utf8");

const targetRegex = /renderer\.code = function \({ text, lang }[\s\S]*?<\/div>\s*`;\s*};/;

const replacement = "renderer.code = function ({ text, lang }: { text: string; lang?: string }) {\n" +
"    const trimmed = text.replace(/^\\n+/, \"\").replace(/\\n+$/, \"\");\n" +
"    let highlighted: string;\n" +
"    let validLang = lang || \"\";\n" +
"    if (lang && hljs.getLanguage(lang)) {\n" +
"       highlighted = hljs.highlight(trimmed, { language: lang }).value;\n" +
"    } else {\n" +
"       try { const auto = hljs.highlightAuto(trimmed); highlighted = auto.value; validLang = auto.language || \"plaintext\"; } catch (_) { highlighted = trimmed; validLang = \"plaintext\"; }\n" +
"    }\n" +
"    const LANG_LABELS: Record<string, string> = { js: \"JavaScript\", ts: \"TypeScript\", jsx: \"React JSX\", tsx: \"React TSX\", py: \"Python\", sh: \"Shell\", bash: \"Bash\", sql: \"SQL\", yaml: \"YAML\", yml: \"YAML\", json: \"JSON\", dockerfile: \"Dockerfile\", go: \"Go\", rs: \"Rust\", css: \"CSS\", html: \"HTML\" };\n" +
"    let label = validLang === \"plaintext\" ? (isAsciiDiagram(trimmed) ? \"◈ DIAGRAM\" : \"TEXT\") : (LANG_LABELS[validLang] ?? validLang.toUpperCase());\n" +
"    let blockClass = validLang === \"plaintext\" && isAsciiDiagram(trimmed) ? \"devhub-code-block devhub-code-block--terminal\" : \"devhub-code-block\";\n" +
"    const lines = highlighted.split(\"\\n\");\n" +
"    const numberedLines = lines.map((lineContent, i) => {\n" +
"       let diffClass = \"\";\n" +
"       if (validLang === \"diff\") {\n" +
"          const raw = trimmed.split(\"\\n\")[i] || \"\";\n" +
"          if (raw.startsWith(\"+\")) diffClass = \" bg-emerald-500/10 text-emerald-400\";\n" +
"          else if (raw.startsWith(\"-\")) diffClass = \" bg-red-500/10 text-red-400\";\n" +
"       }\n" +
"       return `<div class=\"flex items-start px-4 hover:bg-muted/30${diffClass}\"><span class=\"select-none text-muted-foreground/40 text-right pr-4 font-mono text-xs w-[35px] shrink-0 mt-[2px]\">${i + 1}</span><span class=\"font-mono text-sm leading-relaxed flex-1\">${lineContent || \" \"}</span></div>`;\n" +
"    }).join(\"\");\n" +
"    const encoded = encodeURIComponent(trimmed);\n" +
"    return `<div class=\"${blockClass}\" data-lang=\"${validLang}\"><div class=\"devhub-code-header flex items-center justify-between px-4 py-2 bg-muted/50 border-b\"><span class=\"devhub-lang-label text-xs font-bold text-primary tracking-wider uppercase\">${label}</span><button class=\"devhub-copy-btn text-muted-foreground hover:text-foreground transition-colors\" data-code=\"${encoded}\" type=\"button\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/></svg></button></div><div class=\"devhub-code-content py-3 overflow-x-auto bg-background/50\"><pre class=\"bg-transparent p-0 m-0\"><code class=\"p-0 bg-transparent block w-full hljs language-${validLang}\">${numberedLines}</code></pre></div></div>`;\n" +
"  };";

// Simple index matching to avoid Regex parsing mismatches
const startIdx = content.indexOf("renderer.code = function ({ text, lang }: { text: string; lang?: string }) {");
const endIdx = content.indexOf("const encoded = encodeURIComponent(trimmed);", startIdx);

if (startIdx > -1 && endIdx > -1) {
  // We will find the boundary of return DIV container ends
  const containerEnd = content.indexOf("</div>\n`;\n  };", endIdx);
  if (containerEnd > -1) {
    const finalEnd = containerEnd + "</div>\n`;\n  };".length;
    content = content.substring(0, startIdx) + replacement + content.substring(finalEnd);
    fs.writeFileSync("src/components/step-viewer.tsx", content);
    console.log("Upgraded code block accurately!");
  } else {
    console.log("Container end NOT found.");
  }
} else {
  console.log("Target headers NOT found.");
}
