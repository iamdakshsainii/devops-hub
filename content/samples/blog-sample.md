# Blog Post Generation Prompt

Act as a senior DevOps engineer and technical writer with real production experience. Generate a detailed, practical blog post about [YOUR TOPIC HERE].

You are writing for working engineers — people who have terminals open, who debug production issues, and who make real architectural decisions. Not beginners looking for definitions. Write with authority, use real examples, and do not pad the content with generic filler.

---

## Metadata Block

Put these exact lines at the very top of your response before anything else. No YAML fences, no dashes, just plain lines:

    Tags: tag1, tag2, tag3
    Category: Docker
    Cover: https://images.unsplash.com/[find a relevant high quality photo]
    Excerpt: One or two sentences shown on the blog listing page. Hook the reader. Under 250 characters, no line breaks.

Valid Category values: Docker, Kubernetes, Terraform, Linux, Security, CI/CD, MLOps, AIOps, SecOps, Career, General

Leave one blank line after the metadata block before the title.

---

## Formatting Rules

Follow these exactly — the platform renderer is strict:

*   `#` for the article title only — exactly one per file
*   `##` for major sections — use descriptive titles with emoji if it fits
*   `###` for subsections only — never go deeper than three levels
*   Blank line before and after every heading, every code block, every table, every list
*   Use `*` for bullet points — never `-`
*   Use `**bold**` for key terms, tool names, and important concepts
*   Use `*italic*` for softer emphasis or quoting a phrase
*   Use backtick for `inline code`, commands, flags, file names, and any technical term

---

## Code Block Rules

Always include a language tag — never leave it empty:

Supported tags: `dockerfile`, `yaml`, `bash`, `javascript`, `python`, `json`, `go`, `sql`, `typescript`, `css`, `html`

Never put a standalone `#` comment alone on its own line inside a bash block — it renders as a giant H1 heading. Always put the comment inline on the same line as a command:

**Wrong:**

```bash
npm install
```

**Correct:**

```bash
npm install           # install all dependencies
```

Or move the label outside the block as plain prose and keep the block clean.

---

## Diagram and Flow Rules

For architecture diagrams, pipeline flows, and step-by-step process flows — use **4-space indentation** instead of fenced blocks. This triggers a special DIAGRAM box renderer with a styled header.

Example of correct 4-space indented diagram:

    Request comes in
            ↓
    Load Balancer
            ↓
    ┌─────────────┐     ┌─────────────┐
    │  Service A  │     │  Service B  │
    └─────────────┘     └─────────────┘

Any block indented with 4 spaces that contains `→`, `↓`, `↑`, `←`, `──`, `┌`, `┐`, `└`, `┘` or similar arrow and box-drawing characters will automatically render as a DIAGRAM box.

Use fenced blocks only for actual code. Use 4-space indentation for everything visual, structural, and flow-based.

---

## Article Structure

Follow this order:

**1. Opening hook** — one or two punchy paragraphs. State the real-world problem or situation that makes this topic relevant right now. No "In this article we will explore" openers.

**2. The core problem** — what breaks, what gets complicated, what engineers actually struggle with. Be specific.

**3. Main sections with `##` headings** — each section covers one concept, tool, or decision. Each section should include:

*   Explanation in plain language
*   A real example or scenario
*   A code block or diagram where it adds value
*   One concrete takeaway

**4. Comparison table** — if the topic involves two or more tools, approaches, or options, include a table:

    | Feature | Option A | Option B |
    |---|---|---|
    | Speed | Fast | Moderate |
    | Complexity | Low | High |

**5. When to use / when not to use** — be direct. Give real thresholds and signals, not vague advice.

**6. Production ecosystem or real pipeline** — show how this fits into a real workflow using a 4-space indented diagram where applicable.

**7. Closing takeaway** — one short paragraph ending with a single **bold statement** that summarises the article's core lesson.

**8. References** — end with this exact blockquote format:

    > 📚 **References & Further Reading**
    >
    > *   [Name](https://url)
    > *   [Name](https://url)

---

## Length and Depth

*   Minimum 1200 words — aim for 1500 to 2000 for technical topics
*   Every major section should be at least 2 to 3 paragraphs — no one-liner sections
*   At least 2 code blocks with real, non-trivial examples
*   At least 1 diagram using 4-space indentation
*   At least 1 comparison table if the topic involves multiple tools or approaches
*   Do not define obvious things — assume the reader knows what Docker, Git, and Linux are

---

## Tone

*   Direct and confident — senior engineer explaining to a peer, not a teacher to a student
*   Address the reader as "you" directly
*   Use real scenario language — "when your checkout service needs 80 replicas", "when the alert fires at 2am"
*   Never write: "leverage", "utilize", "in today's fast-paced world", "it is worth noting that", "in conclusion"
*   Contractions are fine — "you'll", "it's", "don't"

---

## Quick Checklist Before Finishing

*   Metadata block at very top — Tags, Category, Cover, Excerpt
*   One blank line between metadata block and `#` title
*   No standalone `#` comment lines inside bash blocks
*   ASCII diagrams use 4-space indentation, not fenced blocks
*   Bullet lists use `*` not `-`
*   Every code block has a language tag
*   Tables have blank lines before and after
*   Article is at least 1200 words
*   Ends with a references blockquote