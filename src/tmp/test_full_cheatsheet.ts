import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const markdownInput = `Tags: Docker, Containers, DevOps, Images, Networking, Volumes
Category: Docker
Difficulty: INTERMEDIATE
Cover: https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80
Description: A production-ready Docker cheatsheet covering container lifecycle, image management, volumes, networking, Docker Compose, resource control, and debugging — built for DevOps engineers who want dense, no-fluff reference.

---

# Container Lifecycle Management

## Create and Start a Container

Run a named container in detached mode with port binding:

\`\`\`bash
docker run -d --name my-app -p 8080:80 nginx:latest
\`\`\`

**Flags:**

| Flag | Description |
|------|-------------|
| \`-d\` | Detached mode (background) |
| \`--name\` | Assign a custom name |
| \`-p host:container\` | Bind host port to container port |
| \`--rm\` | Auto-remove container on exit |
| \`-it\` | Interactive + pseudo-TTY (for shells) |
| \`--restart always\` | Auto-restart policy |

## Start / Stop / Restart

\`\`\`bash
docker start <name|id>
docker stop <name|id>       # Graceful (SIGTERM → SIGKILL after 10s)
docker restart <name|id>
docker kill <name|id>       # Immediate SIGKILL
\`\`\`

## Remove Containers

\`\`\`bash
docker rm <name|id>                  # Remove stopped container
docker rm -f <name|id>               # Force remove running container
docker container prune               # Remove ALL stopped containers
\`\`\`

## Inspect Running Containers

\`\`\`bash
docker ps                            # List running containers
docker ps -a                         # Include stopped containers
docker inspect <name|id>             # Full JSON metadata
docker stats                         # Live CPU / mem / net / IO usage
docker top <name|id>                 # Running processes inside container
\`\`\`

---

# Image Operations

## Pull, Tag, and Push

\`\`\`bash
docker pull nginx:1.25-alpine
docker tag nginx:1.25-alpine myrepo/nginx:prod
docker push myrepo/nginx:prod
\`\`\`

## Build an Image

\`\`\`bash
docker build -t myapp:v1.0 .
docker build -t myapp:v1.0 -f Dockerfile.prod .
docker build --no-cache -t myapp:v1.0 .
\`\`\`

**Build arg injection:**

\`\`\`bash
docker build --build-arg ENV=production -t myapp:v1.0 .
\`\`\`

## List and Remove Images

\`\`\`bash
docker images                        # List all local images
docker rmi <image_id>                # Remove specific image
docker image prune                   # Remove dangling images
docker image prune -a                # Remove ALL unused images
\`\`\`

## Save and Load Images (Offline Transfer)

\`\`\`bash
docker save -o myapp.tar myapp:v1.0
docker load -i myapp.tar
\`\`\`

## Inspect Image Layers

\`\`\`bash
docker history myapp:v1.0
docker inspect myapp:v1.0
\`\`\`

---

# Dockerfile Reference

## Minimal Production Dockerfile (Multi-stage)

\`\`\`dockerfile
# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2 — Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
\`\`\`

## Key Dockerfile Instructions

| Instruction | Purpose |
|-------------|---------|
| \`FROM\` | Base image |
| \`WORKDIR\` | Set working directory |
| \`COPY\` | Copy files from host to image |
| \`ADD\` | Like COPY but supports URLs and tar extraction |
| \`RUN\` | Execute command during build |
| \`CMD\` | Default command at container start (overridable) |
| \`ENTRYPOINT\` | Fixed command — args appended to it |
| \`ENV\` | Set environment variables |
| \`ARG\` | Build-time variable (not in final image) |
| \`EXPOSE\` | Document port (does NOT publish it) |
| \`USER\` | Drop root privileges |
| \`VOLUME\` | Declare a mount point |
| \`HEALTHCHECK\` | Define container health probe |

## Layer Caching Best Practices

    [Dockerfile Layer Order — Best Cache Utilization]

    FROM base-image
          |
    COPY package.json        <-- Changes rarely → cache hit most often
          |
    RUN npm install          <-- Cached unless package.json changes
          |
    COPY . .                 <-- Source code changes → only rebuilds from here
          |
    CMD / ENTRYPOINT

---

# Volumes and Bind Mounts

## Volume Types

| Type | Syntax | Use Case |
|------|--------|----------|
| Named Volume | \`-v mydata:/app/data\` | Persistent DB storage, managed by Docker |
| Bind Mount | \`-v /host/path:/container/path\` | Dev hot-reload, config injection |
| tmpfs | \`--tmpfs /tmp\` | In-memory, no persistence, secrets |

## Named Volume Commands

\`\`\`bash
docker volume create mydata
docker volume ls
docker volume inspect mydata
docker volume rm mydata
docker volume prune            # Remove all unused volumes
\`\`\`

## Example: Postgres with Named Volume

\`\`\`bash
docker run -d \\
  --name postgres \\
  -e POSTGRES_PASSWORD=secret \\
  -v pgdata:/var/lib/postgresql/data \\
  -p 5432:5432 \\
  postgres:15-alpine
\`\`\`

---

# Networking

## Network Types

| Driver | Description |
|--------|-------------|
| \`bridge\` | Default. Isolated network per container (NAT) |
| \`host\` | Container shares host network stack |
| \`none\` | No networking |
| \`overlay\` | Multi-host (Swarm / Kubernetes) |
| \`macvlan\` | Container gets its own MAC/IP on LAN |

## Custom Bridge Network (Recommended)

\`\`\`bash
docker network create mynet
docker run -d --name app --network mynet myapp:v1.0
docker run -d --name db  --network mynet postgres:15
\`\`\`

Containers on the same custom bridge can resolve each other by **name** (e.g., \`app\` pings \`db\` directly).

## Network Commands

\`\`\`bash
docker network ls
docker network inspect mynet
docker network connect mynet <container>
docker network disconnect mynet <container>
docker network rm mynet
docker network prune
\`\`\`

## Container-to-Container Communication

    [Custom Bridge Network]

    Host Machine
    ┌────────────────────────────────┐
    │  Docker Network: mynet         │
    │  ┌────────┐    ┌────────────┐  │
    │  │  app   │───▶│     db     │  │
    │  │ :3000  │    │  :5432     │  │
    │  └────────┘    └────────────┘  │
    └────────────────────────────────┘
          │
    Host Port Mapping
    localhost:8080 ──▶ app:3000

---

# Docker Compose

## Minimal \`docker-compose.yml\`

\`\`\`yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    networks:
      - backend

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend

volumes:
  pgdata:

networks:
  backend:
    driver: bridge
\`\`\`

## Core Compose Commands

\`\`\`bash
docker compose up -d                 # Start all services in background
docker compose down                  # Stop and remove containers + network
docker compose down -v               # Also remove volumes
docker compose ps                    # Status of services
docker compose logs -f app           # Follow logs of specific service
docker compose build                 # Rebuild images
docker compose restart app           # Restart single service
docker compose exec app sh           # Shell into running service
docker compose pull                  # Pull latest images
\`\`\`

## Override Files (Environment-Specific)

\`\`\`bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
\`\`\`

---

# Debugging and Troubleshooting

## Exec Into a Running Container

\`\`\`bash
docker exec -it <name|id> /bin/sh    # Alpine/minimal images
docker exec -it <name|id> /bin/bash  # Ubuntu/Debian images
docker exec -it <name|id> env        # Check env vars
\`\`\`

## Logs

\`\`\`bash
docker logs <name|id>
docker logs -f <name|id>             # Follow (tail -f equivalent)
docker logs --tail 100 <name|id>     # Last 100 lines
docker logs --since 30m <name|id>    # Logs from last 30 minutes
\`\`\`

## Copy Files In/Out

\`\`\`bash
docker cp <name>:/app/config.json ./config.json    # Out of container
docker cp ./config.json <name>:/app/config.json    # Into container
\`\`\`

## Run Debugging Sidecar (Network Debug)

\`\`\`bash
docker run --rm -it --network container:<name> nicolaka/netshoot
\`\`\`

## Check Health Status

\`\`\`bash
docker inspect --format='{{.State.Health.Status}}' <name>
\`\`\`

---

# Resource Management

## Limit CPU and Memory

\`\`\`bash
docker run -d \\
  --name app \\
  --memory="512m" \\
  --cpus="1.5" \\
  myapp:v1.0
\`\`\`

| Flag | Description |
|------|-------------|
| \`--memory\` | Hard memory limit (e.g., \`256m\`, \`1g\`) |
| \`--memory-swap\` | Swap limit (set equal to memory to disable swap) |
| \`--cpus\` | CPU core fraction (e.g., \`0.5\` = half a core) |
| \`--cpu-shares\` | Relative CPU weight (default: 1024) |

## Check Resource Usage

\`\`\`bash
docker stats                         # Live stats for all containers
docker stats <name> --no-stream      # One-time snapshot
\`\`\`

---

# Registry and Authentication

## Login / Logout

\`\`\`bash
docker login                         # Docker Hub
docker login registry.example.com   # Private registry
docker logout
\`\`\`

## Tag and Push to Private Registry

\`\`\`bash
docker tag myapp:v1.0 registry.example.com/myteam/myapp:v1.0
docker push registry.example.com/myteam/myapp:v1.0
docker pull registry.example.com/myteam/myapp:v1.0
\`\`\`

## Run a Local Registry

\`\`\`bash
docker run -d -p 5000:5000 --name registry registry:2
docker tag myapp:v1.0 localhost:5000/myapp:v1.0
docker push localhost:5000/myapp:v1.0
\`\`\`

---

# Cleanup and Maintenance

## System-Wide Cleanup

\`\`\`bash
docker system df                     # Disk usage breakdown
docker system prune                  # Remove stopped containers, unused networks, dangling images
docker system prune -a               # Also remove unused images (not just dangling)
docker system prune -a --volumes     # Nuclear: everything unused
\`\`\`

## Individual Prune Commands

\`\`\`bash
docker container prune
docker image prune -a
docker volume prune
docker network prune
\`\`\`

---

# Quick Reference Card

    [Docker Object Lifecycle]

    Dockerfile ──▶ docker build ──▶ Image
                                      │
                                docker run
                                      │
                                  Container
                                 /    |    \\
                           Logs  Exec  Stats

    Image ──▶ docker push ──▶ Registry ──▶ docker pull ──▶ Image

---

**References:**
- Official Docs: https://docs.docker.com`;

function parseMarkdown(md: string) {
    const lines = md.split("\n");
    let title = "Docker Cheatsheet Test " + Date.now();
    let description = "";
    let category = "Linux";
    let difficulty = "BEGINNER";
    let coverImage = "";
    let tags = "";
    
    const parsedSections: any[] = [];
    let currentSection: any = null;
    let currentSub: any = null;

    for (const line of lines) {
         if (line.startsWith("Tags: ")) { tags = line.replace("Tags: ", "").trim(); continue; }
         if (line.startsWith("Category: ")) { category = line.replace("Category: ", "").trim(); continue; }
         if (line.startsWith("Difficulty: ")) { difficulty = line.replace("Difficulty: ", "").trim().toUpperCase(); continue; }
         if (line.startsWith("Cover: ")) { coverImage = line.replace("Cover: ", "").trim(); continue; }
         if (line.startsWith("Description: ")) { description = line.replace("Description: ", "").trim(); continue; }
         
         if (line.startsWith("# ")) {
             title = line.replace("# ", "").trim();
             currentSection = { title: title, order: parsedSections.length, subsections: [] };
             parsedSections.push(currentSection); 
             currentSub = null;
         } else if (line.startsWith("## ") && currentSection) {
             currentSub = { title: line.replace("## ", "").trim(), content: "", order: currentSection.subsections.length };
             currentSection.subsections.push(currentSub);
         } else if (currentSub) { 
             currentSub.content += line + "\n"; 
         }
    }
    return { title, description, category, difficulty, coverImage, tags, sections: parsedSections };
}

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
     console.error("No user found in DB");
     return;
  }
  
  const parsed = parseMarkdown(markdownInput);
  
  const payload = {
    title: parsed.title,
    slug: parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + "-test-" + Date.now(),
    description: parsed.description,
    category: parsed.category,
    icon: "📋",
    difficulty: parsed.difficulty,
    readTime: 10,
    coverImage: parsed.coverImage,
    tags: parsed.tags,
    status: "DRAFT",
    authorId: user.id,
    sections: parsed.sections
  };

  try {
    const cheatsheet = await prisma.$transaction(async (tx) => {
      const createdCheatsheet = await tx.cheatsheet.create({
        data: {
          title: payload.title,
          slug: payload.slug,
          description: payload.description || null,
          category: payload.category,
          icon: payload.icon,
          difficulty: payload.difficulty,
          readTime: payload.readTime,
          coverImage: payload.coverImage || null,
          tags: payload.tags || null,
          status: payload.status,
          authorId: payload.authorId
        }
      });

      for (const [sIdx, sec] of payload.sections.entries()) {
        const createdSec = await tx.cheatsheetSection.create({
          data: {
            title: sec.title,
            order: sIdx,
            cheatsheetId: createdCheatsheet.id
          }
        });

        if (sec.subsections && sec.subsections.length > 0) {
          await tx.cheatsheetSubsection.createMany({
            data: sec.subsections.map((sub: any, subIdx: number) => ({
              title: sub.title,
              content: sub.content,
              order: subIdx,
              sectionId: createdSec.id
            }))
          });
        }
      }
      return createdCheatsheet;
    }, { timeout: 15000 });
    console.log("Success! Created full cheatsheet:", cheatsheet.id);
  } catch (error) {
    console.error("Transaction failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
