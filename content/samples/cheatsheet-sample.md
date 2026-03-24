# 📋 Claude Prompt: Generate Comprehensive Cheatsheet

**Instructions to Claude AI:**
I want you to act as an Elite DevOps Instructor. Please generate a detailed, comprehensive, and highly-organized **CHEATSHEET** regarding the specified topic.

### 📝 STRUCTURAL RULES (Do Not Break):
1. **Metadata Headers** -> Insert exactly these 5 lines at the VERY TOP of the response prior to any headings:
   `Tags: Tag1, Tag2`
   `Category: Options are Linux, Docker, Kubernetes, Git, Terraform, Ansible, AWS CLI`
   `Difficulty: Options are BEGINNER, INTERMEDIATE, ADVANCED`
   `Cover: URL of banner image (e.g., Unsplash)`
   `Description: A short summary describing the cheatsheet.`

2. `# Section Title` -> Use single Level-1 Headings to define a **Major Group / Category** (e.g., `# 🐋 Container Management`).
3. `## Subsection Title` -> Use Level-2 Headings under a level-1 heading to define a **Specific Action / Command** (e.g., `## Start a container`).
4. **Use Pipe Tables** (`|---|---|:---`) for parameter descriptions with exact spaces above and below it.
5. **Diagrams & flows**: Whenever doing ASCII architecture pipeline representations, **use 4-space indentation**. DO NOT use normal backtick fenced blocks for visual graphs or chartswardsWARDS outwards.
6. **Everything else** (Paragraphs, Code blocks, Lists, URL references) -> Falls directly inside that subsection content frame flawlessly.

---

### 📄 EXAMPLE INPUT/OUTPUT TO EMULATE:

Tags: Docker, Containers, DevOps
Category: Docker
Difficulty: BEGINNER
Cover: https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80
Description: Master essential Docker commands for container lifecycle, image operations, and network configurations natively flawless.

# 🐋 Container Lifecycle Management
## 🚀 Starting & Creating Containers
Create and start a new container from an image securely:
```bash
docker run -d --name app-nginx -p 8080:80 nginx:latest
```
**Flags break-down:**
- `-d`: Run in detached mode (background)
- `-p 8080:80`: Map Host Port 8080 to Container Port 80
- `--name`: Assign custom naming identifier index

## 🛑 Stopping & Removing
Graceful termination of running threads:
```bash
docker stop <container_id_or_name>
```
Force delete fully allocated storage blocks:
```bash
docker rm -f <container_id>
```

---

# 📜 Image Operations & Repositories
## 📥 Pulling & Tagging
Fetch images from DockerHub flawless triggers loaded:
```bash
docker pull postgres:15-alpine
```

---

**Generate a production-ready, highly dense Cheatsheet about [YOUR TOPIC HERE] expanding over 6+ major sections securely with links support referenced if available!**
