# 📘 DevOps Network — Course Module Guide

---

## 1. Header Rules

| Syntax | Creates | Rule |
|---|---|---|
| `# ` | Module title | Use **once only** at the very top |
| `## ` | Sidebar nav item | Every `##` MUST have 3-4 paragraphs of content before any `###` or `####` — otherwise the page renders blank |
| `### ` | Subtopic card | Use ONLY for major category switches — not for small inline titles |
| `#### ` | Inline divider | Use for ALL small sub-headings that stay on the page |

---

## 2. The Empty Page Rule — Most Critical

If a `##` jumps immediately to `###` or `####` with nothing in between, the platform shows a blank page.

Every `##` intro MUST include:
- 3-4 paragraphs of plain English explanation
- At least one table, code block, or flow diagram
- Real-world "why this matters for DevOps" context
- The page must require scrolling before the first card appears

---

## 3. Language Style

Always explain the concept BEFORE showing commands:
1. What IS this? (plain English + analogy)
2. Why does it matter in DevOps?
3. How does it work? (concept first)
4. Show the command or code
5. Comment every non-obvious line inline
6. Show a real-world example

Never dump commands without explanation.

---

## 4. Diagrams & Flow Charts — What Works and What Breaks

**Single arrows `↓` `↑` `→` `←` work perfectly — use them freely.**

The platform only breaks on heavy Unicode **box-drawing** characters. Avoid: `──`, `┐`, `┘`, `└`, `│` in box diagrams, `►`, `═`

**For side-by-side diagrams** (like OSI sender/receiver) — skip arrows entirely. Use spacing and a `---` separator line.

**For flow diagrams** — use `↓` between steps. Clean and renders perfectly.

**For request/response diagrams** — use `-->` and `<--` with spaces. Keep it simple.

---

## 5. Code Block Rules — CRITICAL

Every code block MUST open and close with plain triple backticks.

**Correct — always close with plain triple backticks:**
````
```bash
ping google.com
```
````

**Wrong — never use a language tag on a closing fence:**
````
```bash
ping google.com
```text       ← THIS BREAKS THE BLOCK — never do this
````

**Rules:**
- Opening fence: ` ```bash `, ` ```text `, ` ``` ` — language tag allowed here
- Closing fence: ` ``` ` — ALWAYS plain, NEVER add a language tag
- For plain diagrams and flow charts with no language: use ` ```text ` to open, ` ``` ` to close
- For bash/shell commands: use ` ```bash ` to open, ` ``` ` to close
- Never write ` ```text ` as a closing line — it will swallow the next block into the current one

---

## 6. Images

Place real Unsplash images at key concept moments using:
```
![Description of what image shows](https://images.unsplash.com/photo-ID?auto=format&fit=crop&w=800&q=80)
```

If no good image exists, write:
```
![Add image here: describe the concept this should show]()
```

Place images at:
- Section intro (one per `##`)
- Before complex diagrams
- After a big concept is introduced

---

## 7. Structure Template

```markdown
# Module Title
1-2 sentence description.

---

## 01. First Topic

3-4 paragraphs of intro content here.
Real-world DevOps context.
At least one table or diagram.

#### Inline Sub-heading
Explanation then code...

### Major Subtopic Card

Explanation of this major topic.

#### Sub-section inside card
Detail here...

---

## 02. Second Topic

[Never jump straight to ### or #### here]
```

---

## 8. Pre-Publish Checklist

```
Structure:
[ ] # used exactly once
[ ] Every ## has 3+ paragraphs before first ### or ####
[ ] ### used only for major subtopic cards
[ ] #### used for all inline dividers

Code Blocks:
[ ] Every closing fence is plain ``` with no language tag after it
[ ] No line anywhere reads ```text, ```bash, ```js as a CLOSING fence
[ ] Opening fences use language tags, closing fences never do

Diagrams:
[ ] No Unicode box-drawing characters in code blocks
[ ] All flows use plain ASCII (|, -, >, +, arrows ↓ ↑ → ←)
[ ] Images placed at key concept moments

Content:
[ ] Every concept explained in plain English before code
[ ] Every code block has inline comments
[ ] Real-world DevOps context in every ## intro
[ ] At least one table or diagram per ## section

Language:
[ ] Beginner-friendly throughout
[ ] Analogies used for complex concepts
[ ] "Why does this matter?" answered for every topic
```

---

## 9. AI Prompt to Use

```
Act as an Elite DevOps Instructor creating a Course Module for the DevOps Network platform.

TOPIC: [topic here]

RULES:
1. # Module Title + 1-2 sentence description
2. ## for each main topic (sidebar nav)
3. Every ## MUST have 3-4 paragraphs + table/diagram before first ### or ####
4. ### ONLY for major subtopic cards
5. #### for all inline sub-headings
6. Explain every concept in plain beginner English BEFORE showing commands
7. Comment every non-obvious line in code blocks
8. Single arrows ↓ ↑ → ← are fine. Avoid only heavy box-drawing chars: ──, └, ┐, ►, ═, │ in diagrams
9. Place Unsplash images at key concept moments
10. Answer "why does this matter in DevOps?" for every major topic
11. CRITICAL — Code block closing fences: always close with plain ``` on its own line.
    NEVER write ```text or ```bash or any language tag on a closing fence.
    Opening fence example: ```bash
    Closing fence example: ```
    A closing fence with a language tag (e.g. ```text) will break the next block.
```