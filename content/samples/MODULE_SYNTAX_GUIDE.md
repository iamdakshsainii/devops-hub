# 📘 DevOps Network — Course Module Guide

---

## 🏗️ 1. Structure & Headers

*   **No `#` title needed**: The module title is set in the dashboard form. Do not include a `# Title` line.
*   `## Topic Title`: Creates a master topic card on the step reader.
*   `### Subtopic Anchor`: Creates an **Anchor Scroll Link** in the sidebar that smoothly jumps directly to that inside section on click. No strict spacing or content counts required after `##` now!

---

## 💻 2. Code Blocks Rules — CRITICAL

*   **Always use Triple Backticks (`` ``` ``) with a language label**: For isolation commands or config scripts.
    *   **Opening fence**: ` ```bash `, ` ```yaml `, ` ```dockerfile ` — language tag required.
    *   **Closing fence**: ` ``` ` — ALWAYS plain, never add a language tag.
*   **Never use Single Backticks (`` ` ``) for standalone lines**: Single backticks are strictly for *inline code statements* inside sentences (e.g., `cd /root`). They won't trigger standard styled copy-to-clipboard blocks.
*   **Comment inline**: Add `# comments` on the same line as your bash triggers so highlighting parses beautifully downstream.

---

## 📊 3. Diagrams & Flow Charts

*   **Use 4-space indentation for diagrams**: This triggers the platform's terminal/diagram overlay dashboard frame. Do not use fenced code blocks for diagrams if you want the visual wrapper setup.
*   Use raw arrows `↓` `↑` `→` `←` freely between step coordinates.
*   Avoid heavy Unicode box-drawing characters (e.g., `──`, `┐`, `┘`, `│`, `►`, `═`).

---

## 📝 4. Style & Media Formatting

*   **Bullet Lists**: Use `*` to form lists, NOT `-`.
*   **Images**: Place real Unsplash media using standard format:
    `![Description](https://images.unsplash.com/photo-ID?auto=format&fit=crop&w=800&q=80)`
*   **Context first**: Always explain WHY a concept matters to a DevOps engineer before you show configuration setups.
*   **Tables**: Use clean pipe `|` separators for grid scaling:
    | Concept | What it does | Why it matters |
    |---|---|---|
    | Value | Value | Value |
*   **Beginner-Friendly**: Simplify layout terms, use analogies, and keep it digestible. Detailed content but absolute zero unwanted fluff.
*   **Cover All Topics**: Ensure no critical details of the references provided are left out!
*   **Dynamic References**: Always include/seamlessly map any reference details given in the user input back into the document framing smoothly.

---

## 🤖 AI Prompt to Use

```text
Act as an Elite DevOps Instructor creating content for the DevOps Network platform.

RULES:
1. No `#` top headers — start with `##` for topics.
2. `##` for high-level Scroll Cards.
3. `###` for Subtopics (anchors trigger smooth-scrolling to it).
4. Diagrams: use 4-space indentation (triggers styled terminal wrapping frames).
5. Code Blocks: Opening fence requires a language tag (` ```bash `). Closing fence is plain ` ``` `.
6. Code Blocks: No single backticks isolation commands on standalone rows.
7. Bullet lists use `*` not `-`.
8. Beginner-Friendly: Simplified terms, analogies, deep coverage containing zero unwanted fluff.
9. Dynamic References: Fully integrate any reference materials/details given strictly back into content flows.
```