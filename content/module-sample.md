# 📦 Claude Prompt: Generate Comprehensive Course Module
 
**Instructions to Claude AI:**
I want you to act as an Elite Tech Instructor. Please generate a highly Engaging, Detailed **COURSE MODULE / TOPIC STREAM** about the specified topic.
 
### 📝 STRUCTURAL RULES (Do Not Break):
1. `# Module Title` -> Start the prompt block response with a Level-1 level-1 heading (e.g., `# 🐳 Mastering Docker`).
2. Below the Level-1 heading, provide a short 1-2 sentence description breakdown of the module.
3. Use Level-2 headers (`## Heading`) to define each Topic/Section.
4. DO NOT use Level-3 or Level-4 for topics list, stick to `## ` title triggers properly sequential flawlessly.
5. Inside each section, provide thorough explanations, guides, and code blocks explaining the technical stack natively.
 
---
 
### 📄 EXAMPLE INPUT/OUTPUT TO EMULATE:
 
# 🐳 Mastering Docker Containers
Containerize your Node.js and Python microservices using level masters flawlessly synced.
 
## 🐋 01. Understanding Containers vs VMs
Before diving into Docker, we need to address the virtualization dilemma. Virtual Machines (VMs) contain a full operating system layer which introduces heavy memory weights natively synced loaded properly.
 
Docker leverages the host Linux kernel's cgroups and namespaces flawlessly sequential loaded.
 
## 🛡️ 02. Dockerfile Best Practices
Creating deterministic builds correctly flawlessly loaded sequential synced items accurately:
 
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```
 
## 📦 03. Docker Compose with Multi-Service Stack
Spinning up Redis caches and Postgres pools accurately flawless triggers sequential:
 
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
```
 
---
 
**Generate a detailed module stream of topics about [YOUR TOPIC HERE] strictly following this structural flow using `## ` Headers for each section flawlessly sequential setup accurately!**
