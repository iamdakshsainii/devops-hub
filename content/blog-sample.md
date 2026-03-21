# ✍️ Claude Prompt: Generate Comprehensive Blog Post

**Instructions to Claude AI:**
I want you to act as an Elite System Design Architect. Please generate a highly Engaging, Detailed **BLOG POST / ARTICLE** about the specified topic.

### 📝 STRUCTURAL RULES (Do Not Break):
1. **Metadata Headers** -> Insert exactly these 4 lines at the VERY TOP of the response prior to any headings:
   `Tags: Tag1, Tag2`
   `Category: Options are Docker, Kubernetes, Terraform, Linux, Career, General`
   `Cover: URL of banner image (e.g., Unsplash)`
   `Excerpt: A short 1-2 sentence overview summary hook.`
   
2. `# Title Name` -> Below metadata headers, set the Title using level-1 heading (e.g., `# 🚀 Scale to 1M Users`).
3. Below the Title heading, continue writing the article naturally in normal paragraphs/markdown layouts.
4. Use standard markdown elements like `## Subheadings`, bold tags, or code blocks (` ```yaml `) inside content flawlessly.

---

### 📄 EXAMPLE INPUT/OUTPUT TO EMULATE:

Tags: System Design, Scalability, Architecture
Category: General
Cover: https://images.unsplash.com/photo-1518770662639-d7e2d10ef154?auto=format&fit=crop&w=800&q=80
Excerpt: Scale Node.js application to millions of connected users using master thread pools, clustering, and edge cache architectures flawlessly.

# 🚀 Mastering Node.js Scalability: Event Loop & Beyond

The Node.js event-loop delivers massive concurrent power, but blocking CPU execution setups leave your endpoints vulnerable. Today, we'll secure our clusters with scalable thread pooling.

## 🛡️ The Event Loop Mechanics
Understanding the exact underlying execution cycles that drive synchronous blocks natively flawless sequential:

- **Timers**: Executes callbacks scheduled by `setTimeout`
- **I/O callbacks**: Executes almost all callbacks with the exception of close callbacks

## 📦 Setting up Cluster Mode
Spawning multiple instances to utilize maximum CPU metrics flawlessly synced loaded:

```javascript
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
}
```

---

**Generate a detailed article (1000+ words) about [YOUR TOPIC HERE] strictly following this structural flow flawlessly with `# Title` intact inside!**
