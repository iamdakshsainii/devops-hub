# 📚 DevOps Network: Master Content Guideline

This guide explains exactly how our content system is structured and how you should format your technical notes to ensure they look premium, professional, and easy for students to navigate.

---

## 🏗️ The System Architecture

Our platform follows a strict **3-level hierarchy** to prevent cluttered menus and messy navigation:

| Level | Syntax | Purpose |
| :--- | :--- | :--- |
| **1. Module** | `# Title` | The main course/chapter (e.g., "Docker", "Linux"). |
| **2. Topic** | `## Title` | **Sidebar Step.** These are the main chapters listed in your navigation. Aim for **5-8 Topics** per module. |
| **3. Sub-Section** | `### Title` | **Internal Link.** These appear as "nested cards" within the topic and get a **scroll-link** in the sidebar. |

---

## 🎯 User Experience Requirements

To maintain a **State-of-the-Art** educational experience, strictly follow these rules:

### 1. **Focus on the Sidebar**
Do NOT use `##` for every small detail. A sidebar with 45 items is overwhelming. Instead, group your details (using `###`) into a few major topics (using `##`).

### 2. **Smooth Scroll Navigation**
Every `### Sub-Section` generates a link in your sidebar. When a student clicks it, the page **smoothly scrolls** to that section instead of opening a new page—this keeps the student in "deep reading mode".

### 3. **Rich Media & Clean Layout**
- Use **Code Blocks** (with language tags) for all technical commands.
- Use **Tables** for comparisons (e.g., Tool A vs Tool B).
- Use **ASCII Diagrams** for architectures.
- Each `###` starts a new "Card" with a vertical accent line.

---

## 🤖 AI Prompt (Secret Weapon)

If you are using ChatGPT or Claude to generate your content, **copy and paste this prompt EXACTLY** to get perfect formatting:

```text
"Act as a Senior DevOps Curriculum Designer. I need a comprehensive learning guide for [TOPIC NAME]. 

Please follow this exact structural blueprint:

1. Use # [Title] for the very top of the guide.
2. Use ## [Chapter Name] for the main high-level milestones. (Generate about 5-8 of these strands).
3. Under each ## Chapter, use several ### [Specific Detail] headings for technical deep-dives.
4. Ensure each ### section has clear, professional text, code blocks (bash/js/yaml), and comparisons using tables where helpful.
5. Use diagrams built with ASCII or clear text-based flows for architectural concepts.

Provide the full markdown suitable for a premium educational platform."
```

---

## 💡 Quick Syntax Ref:

```markdown
# Docker Mastering

## 1. Containers Fundamentals  <-- Shown in Sidebar
This is the intro text for this step.

### What is Docker?          <-- Linked in Sidebar (Scrolls here)
Docker is a platform for...

### Why we use Containers    <-- Linked in Sidebar (Scrolls here)
Containers provide isolation...

## 2. Docker Networking       <-- Next Sidebar Step
Content for chapter 2...
```

By following this guide, you ensure the platform remains the most professional technical learning resource on the web! 🚀🔥

 this is new instruction make sur 10 to 12 topic adn subtopic or subheading rule is there to and make topic as looks good and needed in left sidebar not naything uhwantewd in sidebar and detialed good simple easy notes expalkin everything with pronlem and slolution approch if neededa