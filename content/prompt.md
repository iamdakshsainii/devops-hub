Act as an expert DevOps and Systems Software instructor building technical materials for an elite documentation hub. Your task is to generate a comprehensive, structured, and visually clean Markdown file for the following topic:

👉 TOPIC: [ENTER YOUR TOPIC HERE (e.g., Kubernetes, Terraform, Git, Linux)]

Follow these EXACT structural and formatting rules below. Failure to do so will break the site layout:

### ⚙️ 1. HEADER & HIERARCHY RULES
- Main Title must use exactly: `# [Topic Title] - The Complete Guide` at the very top.
- Major sections must use ONLY: `## [Number]. Section Title`
- Sub-sections must use ONLY: `### Sub-topic Title`
- NEVER use more than three levels of headers (No ####). Keep hierarchies flat.

### 📚 2. CONTENT COMPOSITION
- Divide the topic into 5 to 7 logical sections ranging from **Absolute Beginner/Core Principles** up to **Advanced/Enterprise Production Best Practices**.
- Inside every sub-topic, provide a mix of concise explanations, bullet points, and practical syntax.
- Add brief tables outlining pros/cons, comparisons, or flag references where relevant.

### 💻 3. CODE & SYNTAX BLOCKS
- ALL commands, file configurations, and code MUST be wrapped inside fenced code blocks WITH the language specified (e.g., ```bash, ```yaml, ```dockerfile, ```go).
- Include comments inside the code block to explain exactly what each continuous snippet/parameter does.
- For executable commands, use `$` or `#` to denote prompts clearly.
- NEVER use ASCII art, box-drawing characters (+---, |---|, arrows made of dashes) inside code blocks or anywhere in the document. Use real images instead (see rule 4).

### 🖼️ 4. VISUALS & DIAGRAMS — CRITICAL RULE
- NEVER draw diagrams using ASCII/text characters. No +---, no |---|, no text-based boxes or arrows.
- For every concept that needs a diagram (architecture, lifecycle, flow, pipeline, comparison), use a REAL image URL with this syntax:
  `![Clear description of what this shows](DIRECT_IMAGE_URL)`
- ONLY use direct image URLs that end in .png, .jpg, .svg, or .webp — no redirects, no HTML pages.
- Preferred reliable image sources (use these, they never expire):
  - Wikimedia Commons direct URLs: `https://upload.wikimedia.org/wikipedia/commons/...`
  - Official project documentation CDN images
  - GitHub raw content: `https://raw.githubusercontent.com/[org]/[repo]/main/docs/images/...`
  - Draw.io exported PNGs hosted on GitHub
- Also include 3-4 Unsplash banner/section images for visual spacing between major sections:
  `![Section banner](https://images.unsplash.com/photo-XXXXXXXXXX?auto=format&fit=crop&w=1200&q=80)`
- Place images immediately after introducing a concept — not at the end of a section.
- Every major `##` section must contain at least one image.

### ✅ 5. QUALITY RULES
- Minimum 1000 words. Aim for 8 to 10 topics covering all concepts in depth.
- Every section must feel complete — no stubs, no "coming soon" placeholders.
- Write for senior engineers — precise, production-focused, no hand-holding.
- All tables must have a header row and at least 3 data rows.

---
🚀 [Start generating the highly structured, detailed guide below following exactly the layout above]: