# How to Use the Content Folder & Markdown Importer

## Method 1: Admin Dashboard Paste (Fastest)

Go to **Admin → Roadmaps → Edit any roadmap** and click the **"Markdown/AI Paste"** tab.

Paste your ChatGPT content in this format:

```
# Step Title Here
A short description of this step goes here (optional).

## Topic 1: What is Docker?
Paste all markdown content here — tables, code blocks, lists, anything.
ChatGPT output works perfectly here.

## Topic 2: Containers vs VMs
More content here...
```

Click **"Parse & Append Steps"** — your content is instantly added to the roadmap form.
Then click **Save** to publish it to the database.

---

## Method 2: Drop .md Files (Batch Import)

1. Create a `.md` file in the `/content` folder following the format above.
2. Run: `npm run load:content`
3. The script reads all `.md` files, creates Steps + Topics, and moves processed files to `/content/processed/`.

---

## Format Rules

| Markdown | Becomes |
| :--- | :--- |
| `# Step Title` | A new Roadmap Step |
| `## Topic Name` | A Topic under that step |
| Everything below `##` | Topic content (supports full markdown) |

Images work too — just paste the full `![alt](url)` markdown syntax.
