## What is Docker & Containerization?

Docker is an open-source **containerization platform**. It packages your application and everything it needs — code, libraries, dependencies, config — into one portable unit called a **container**.

That container runs the same way on your laptop, a CI server, or a cloud VM. No more *"it works on my machine"* problems.

Docker was released in **2013** by **Solomon Hykes**. It is built on two Linux kernel features — **namespaces** (isolation) and **cgroups** (resource limits).

### The Problem Docker Solves

Classic scenario:

- Developer builds a Node.js app on **Node v14**
- Sends code to a tester who has **Node v16**
- App breaks — *"But it works on my machine!"*

This is the **environment mismatch problem**. It happens with Node.js, Python, Java, databases — anything with versions.

**How Docker fixes it:**

The developer packages the app + Node v14 + all dependencies into a **Docker Image**, pushes it to Docker Hub, and the tester pulls and runs that exact same image. The environment travels with the app.

### Virtual Machines vs Containers

Both isolate applications — but in very different ways.

A **VM** runs a full guest OS on top of a hypervisor. Heavy, slow, large.

A **container** shares the host OS kernel directly. It only carries the app and its dependencies. Tiny and fast.

| Feature | Virtual Machines | Docker Containers |
| :--- | :--- | :--- |
| OS Layer | Full Guest OS per VM | Shares Host OS kernel |
| Image Size | 3 GB – 20 GB | 5 MB – 500 MB |
| Boot Time | 1 – 5 minutes | Under 1 second |
| Memory Overhead | 512 MB – 4 GB per VM | 10 MB – 200 MB per container |
| Isolation Level | Full OS boundary | Process-level (namespaces) |
| Portability | Hypervisor-dependent | Runs anywhere with Docker |
| Density per Server | 3 – 10 VMs | 10 – 100+ containers |
| Security Boundary | Strong (separate kernel) | Moderate (shared kernel) |

**Use VMs when:** you need a different OS, or compliance requires full kernel isolation.

**Use Containers when:** deploying APIs, microservices, CI/CD pipelines — anything needing fast startup and portability.

### How Linux Namespaces and cgroups Work

**Namespaces** control what a container process can *see*:

| Namespace | What It Isolates |
| :--- | :--- |
| `pid` | Process IDs — container sees its own PID 1 |
| `net` | Network interfaces, IPs, routing |
| `mnt` | Filesystem mount points |
| `uts` | Hostname and domain name |
| `ipc` | Inter-process communication |
| `user` | User and group IDs |

**cgroups** control what a container process can *use* — CPU, memory, disk I/O, network bandwidth.

Together: **namespaces = isolation**, **cgroups = resource limits**.

```bash
# See namespaces of a running container's process
ls -la /proc/$(docker inspect --format '{{.State.Pid}}' my_container)/ns
```

### OCI — The Open Container Initiative

OCI is an open standard so containers are not locked to Docker alone.

- **OCI Image Spec** — format of a container image (layers, manifests, config)
- **OCI Runtime Spec** — how a runtime creates and runs a container

Because Docker images follow the OCI standard, the same image works on Kubernetes, Podman, containerd — without any changes.

### The Container Ecosystem

| Layer | Tools |
| :--- | :--- |
| Developer Tools | Docker CLI, Docker Compose, BuildKit |
| Container Runtime | containerd, runc, crun |
| Orchestration | Kubernetes, Docker Swarm, Nomad |
| Image Registries | Docker Hub, AWS ECR, GitHub Container Registry |
| Security | Trivy, Snyk, AppArmor |
| Service Mesh | Istio, Linkerd, Envoy |

---

## Installing Docker & Core Components

### Docker Desktop

**Docker Desktop** is the recommended install for **macOS and Windows**. It bundles:

- Docker CLI
- Docker Daemon
- Docker Compose
- A lightweight Linux VM (needed because containers require a Linux kernel, which macOS/Windows don't have natively)

On **Linux**, you install Docker Engine directly — no VM needed.

### Installing on macOS

```bash
# Option 1 — Homebrew
brew install --cask docker

# Option 2 — Download .dmg from:
# https://docs.docker.com/desktop/install/mac-install/
```

After installing, open Docker Desktop and wait for the whale icon to show "Docker is running".

### Installing on Windows

```powershell
# Option 1 — Winget
winget install Docker.DockerDesktop

# Requires WSL 2 — enable it first:
wsl --install
```

### Installing on Linux (Ubuntu / Debian)

```bash
# Step 1 — Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Step 2 — Install prerequisites
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Step 3 — Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Step 4 — Add Docker's repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Step 5 — Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# Step 6 — Add your user to the docker group (avoids sudo every time)
sudo usermod -aG docker $USER
newgrp docker

# Step 7 — Verify
docker --version
docker run hello-world
```

If `hello-world` prints a success message, Docker is installed correctly.

### Docker Daemon

The **Docker Daemon** (`dockerd`) is the background service that manages everything — images, containers, networks, volumes. When you type a `docker` command, the CLI sends that request to the daemon over a Unix socket at `/var/run/docker.sock`.

```
You type:  docker run nginx
                |
           Docker CLI
                |  (sends request via /var/run/docker.sock)
           Docker Daemon (dockerd)
                |
           Pulls image → Creates container → Runs it
```

```bash
# Check daemon status
sudo systemctl status docker

# Restart daemon
sudo systemctl restart docker

# Watch daemon logs live
journalctl -u docker.service -f
```

### Daemon Configuration

Configured via `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true
}
```

| Option | What It Does |
| :--- | :--- |
| `log-driver` | How container logs are stored |
| `max-size` | Each log file won't grow beyond 10 MB |
| `storage-driver` | How Docker stores image layers on disk (`overlay2` is standard) |
| `live-restore` | Keeps containers running even if the daemon restarts |

### Images vs Containers

This is one of the most important Docker concepts.

**Image** = the blueprint. Read-only. Built from a Dockerfile. Like a **class** in programming.

**Container** = a running instance of an image. Has its own writable layer. Like an **object** created from that class.

One image can create many independent containers. Each gets its own isolated writable layer — changes in one container don't affect others.

```
Image (read-only blueprint)
  |-- Container 1 (running — its own writable layer)
  |-- Container 2 (running — separate writable layer)
  |-- Container 3 (stopped — separate writable layer)
```

```bash
# See image layer history and sizes
docker history nginx

# Check image size
docker images nginx

# Inspect image layers
docker image inspect nginx --format '{{json .RootFS.Layers}}'
```

### Image Naming Convention

```bash
# Format: [REGISTRY]/[NAMESPACE]/[IMAGE]:[TAG]

nginx                    # → docker.io/library/nginx:latest
node:20-alpine           # → docker.io/library/node:20-alpine
myuser/my-app:v1.2.3     # → Docker Hub (your account)
ghcr.io/org/service:abc  # → GitHub Container Registry
123456.dkr.ecr.us-east-1.amazonaws.com/my-app:latest  # → AWS ECR
```

- No registry = Docker assumes **docker.io** (Docker Hub)
- No tag = Docker assumes **latest**
- Always pin a specific tag in production — `latest` can change unexpectedly

---

## Standard Docker CLI Operations

### Container Lifecycle

A container goes through these states:

```
Created → Running → Paused → Stopped → Removed
```

### docker run — Full Syntax

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

```bash
# Run nginx in detached mode, map host port 8080 to container port 80
docker run -d -p 8080:80 --name my_web nginx

# Run with environment variables
docker run -d \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --name api \
  my-app:v1

# Run with resource limits
docker run -d \
  --memory="512m" \
  --cpus="0.5" \
  --name limited_app \
  my-app:v1

# Run interactively (useful for debugging)
docker run -it --rm ubuntu bash

# Auto-remove container when it exits
docker run --rm alpine echo "Hello from Alpine"

# Run with a restart policy
docker run -d \
  --restart unless-stopped \
  --name always_on \
  nginx
```

### Restart Policies

| Policy | Behavior |
| :--- | :--- |
| `no` (default) | Never restart |
| `on-failure` | Restart only on non-zero exit code |
| `on-failure:5` | Restart on failure, max 5 attempts |
| `always` | Always restart including after daemon restart |
| `unless-stopped` | Always restart except if manually stopped |

### docker stop / docker kill

```bash
# Graceful stop — sends SIGTERM, waits 10s, then SIGKILL
docker stop my_web

# Custom grace period
docker stop --time 30 my_web

# Immediate kill — sends SIGKILL directly
docker kill my_web

# Stop all running containers
docker stop $(docker ps -q)
```

### docker exec — Run Commands Inside a Running Container

```bash
# Open an interactive bash shell inside container
docker exec -it my_web bash

# Run a single command and exit
docker exec my_web cat /etc/nginx/nginx.conf

# Run as root user
docker exec -u root -it my_web bash

# Run in a specific working directory
docker exec -w /app -it my_web ls -la
```

### Listing and Inspecting Containers

```bash
# List running containers
docker ps

# List all containers (running + stopped)
docker ps -a

# Custom formatted output
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Filter by status
docker ps -a --filter "status=exited"

# View container logs
docker logs my_web

# Follow logs in real-time
docker logs -f my_web

# Show last 100 lines only
docker logs --tail 100 my_web

# Logs with timestamps
docker logs -t my_web

# Full container metadata (JSON)
docker inspect my_web

# Extract specific field
docker inspect --format '{{.NetworkSettings.IPAddress}}' my_web

# Live resource usage stats
docker stats

# Processes running inside a container
docker top my_web

# Copy file from container to host
docker cp my_web:/etc/nginx/nginx.conf ./nginx.conf

# Copy file from host to container
docker cp ./nginx.conf my_web:/etc/nginx/nginx.conf
```

### Image Commands

```bash
# List all local images
docker images

# Pull a specific image
docker pull node:20-alpine

# Remove an image
docker rmi nginx

# Remove all dangling (untagged) images
docker image prune

# Remove all unused images
docker image prune -a

# Tag an image
docker tag my-app:latest myrepo/my-app:v1.0.0

# Push to registry
docker push myrepo/my-app:v1.0.0

# Save image to a tar file
docker save -o nginx.tar nginx:latest

# Load image from tar file
docker load -i nginx.tar
```

### System Commands

```bash
# Full Docker system info
docker info

# Disk usage breakdown
docker system df

# Remove all stopped containers
docker container prune

# Remove all unused networks
docker network prune

# Remove everything unused
docker system prune

# Remove EVERYTHING including unused images and volumes
docker system prune -a --volumes
```

---

## Dockerfile — Building Custom Images

A `Dockerfile` is a text file with sequential instructions Docker reads to build an image layer by layer. Each instruction creates a new layer.

### Complete Dockerfile Instruction Reference

```dockerfile
# FROM — Base image (must be first)
FROM node:20-alpine

# ARG — Build-time variables (only available during build, not at runtime)
ARG APP_VERSION=1.0.0

# ENV — Runtime environment variables (persisted in image)
ENV NODE_ENV=production
ENV PORT=3000

# WORKDIR — Set working directory (creates it if it doesn't exist)
WORKDIR /app

# COPY — Copy files from build context to image
COPY package*.json ./
COPY src/ ./src/
COPY . .

# COPY from a named build stage (used in multi-stage builds)
COPY --from=builder /app/dist ./dist

# RUN — Execute commands during build (each RUN = a new layer)
# Chain commands to keep layers small
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

RUN npm ci --only=production

# EXPOSE — Document which port the app listens on (informational only, does NOT publish)
EXPOSE 3000

# USER — Switch to non-root user for security
USER node

# HEALTHCHECK — Tell Docker how to test if the container is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# ENTRYPOINT — The executable that runs when the container starts
ENTRYPOINT ["node"]

# CMD — Default arguments passed to ENTRYPOINT
CMD ["server.js"]
# Combined result → runs: node server.js
```

### ENTRYPOINT vs CMD

| ENTRYPOINT | CMD | Result |
| :--- | :--- | :--- |
| Not set | `["node","server.js"]` | `node server.js` |
| `["node"]` | `["server.js"]` | `node server.js` |
| `["node"]` | `["--version"]` | `node --version` |
| `["docker-entrypoint.sh"]` | `["postgres"]` | `docker-entrypoint.sh postgres` |

Always use **exec form** (`["node", "server.js"]`) for `CMD` and `ENTRYPOINT` so the process receives OS signals like SIGTERM when the container is stopped.

### .dockerignore

Just like `.gitignore`, this tells Docker what NOT to copy into the image:

```bash
node_modules/
.git/
*.log
*.md
.env
.env.*
dist/
coverage/
Dockerfile
docker-compose*.yml
```

Without `.dockerignore`, your `node_modules` folder gets copied into the image — which is slow and wasteful since `npm install` will run anyway.

### Layer Caching and Optimization

Docker caches each layer. If a layer changes, **all layers below it are rebuilt**. Always copy dependency files before source code so installs only re-run when dependencies actually change.

```dockerfile
# WRONG — npm install reruns on every code change
FROM node:20-alpine
WORKDIR /app
COPY . .               # Any file change busts the cache here
RUN npm ci             # Reinstalls everything every time

# CORRECT — npm install only reruns when package.json changes
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./  # Only changes when deps change
RUN npm ci             # Cached unless package.json changes
COPY . .               # Code changes don't affect the npm layer
CMD ["node", "server.js"]
```

### Choosing the Right Base Image

| Base Image | Size | Use Case |
| :--- | :--- | :--- |
| `ubuntu:22.04` | ~80 MB | Full OS, debugging tools |
| `debian:slim` | ~30 MB | Smaller Debian without extras |
| `alpine:3.19` | ~5 MB | Minimal — musl libc |
| `node:20` | ~360 MB | Full Debian-based Node.js |
| `node:20-slim` | ~70 MB | Debian without build tools |
| `node:20-alpine` | ~50 MB | Alpine-based — recommended for most |
| `gcr.io/distroless/nodejs20` | ~30 MB | No shell — maximum security |
| `scratch` | 0 MB | Empty — for Go/Rust static binaries only |

### Multi-Stage Builds

Multi-stage builds let you use one image to build and a smaller image to run. You get a lean production image without any build tools left behind.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


# Stage 2: Production dependencies only
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force


# Stage 3: Final lean image
FROM node:20-alpine AS production

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Image Size Reduction Summary

| Technique | Typical Saving |
| :--- | :--- |
| Alpine base instead of full OS | 200 – 400 MB |
| Multi-stage build | 100 – 300 MB |
| `--only=production` npm install | 50 – 200 MB |
| Chain RUN commands | 10 – 50 MB |
| `.dockerignore` exclusions | 10 – 100 MB |
| distroless / scratch base | 50 – 200 MB |

---

## Docker Networking

Docker networking controls how containers talk to each other and to the outside world.

### Network Drivers

| Driver | Use Case |
| :--- | :--- |
| `bridge` | Default. Isolated network per container group on a single host |
| `host` | Container shares the host's network stack directly |
| `none` | No networking — fully isolated container |
| `overlay` | Multi-host networking — used with Docker Swarm |
| `macvlan` | Container gets its own MAC/IP on the physical network |

### Default Bridge vs User-Defined Bridge

When you run a container without specifying a network, it goes on the default `bridge` network. On the default bridge, **containers cannot resolve each other by name** — only by IP.

On a **user-defined bridge**, Docker provides automatic DNS — containers resolve each other by their container name.

```bash
# Create a custom bridge network
docker network create my_network

# Create with custom subnet and gateway
docker network create \
  --driver bridge \
  --subnet 192.168.100.0/24 \
  --gateway 192.168.100.1 \
  my_network

# Run containers on the custom network
docker run -d --name web --network my_network nginx
docker run -d --name api --network my_network my-api:v1
docker run -d --name db  --network my_network postgres:16

# 'api' can now reach 'db' simply as db:5432 — Docker DNS handles it
```

### Network Commands

```bash
# List all networks
docker network ls

# Inspect a network
docker network inspect my_network

# Connect a running container to a network
docker network connect my_network my_container

# Disconnect a container from a network
docker network disconnect my_network my_container

# Remove a network
docker network rm my_network
```

### Port Mapping

```bash
# Map host port 8080 to container port 3000
docker run -d -p 8080:3000 my-app:v1

# Bind to localhost only (security best practice — don't expose to all interfaces)
docker run -d -p 127.0.0.1:8080:3000 my-app:v1
```

---

## Docker Volumes & Storage

Containers are **ephemeral** — their writable layer is destroyed when the container is removed. Volumes give you persistent storage that survives container removal.

### Types of Storage

| | Named Volume | Bind Mount | tmpfs |
| :--- | :--- | :--- | :--- |
| Location | Docker-managed (`/var/lib/docker/volumes/`) | Specific host path | Memory only |
| Persists after `rm` | Yes | Yes (host files stay) | No |
| Performance | High | High | Highest |
| Portability | High | Low (host-dependent) | N/A |
| Use Case | DB data, production | Dev, config files | Secrets, temp data |

### Named Volumes (Recommended for Production)

```bash
# Create a named volume
docker volume create my_data

# Use a named volume in a container
docker run -d \
  -v my_data:/var/lib/postgresql/data \
  --name postgres_db \
  postgres:16

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect my_data

# Remove all unused volumes
docker volume prune
```

### Backup and Restore a Volume

```bash
# Backup
docker run --rm \
  -v my_data:/source:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/my_data_backup.tar.gz -C /source .

# Restore
docker run --rm \
  -v my_data:/target \
  -v $(pwd):/backup \
  alpine tar xzf /backup/my_data_backup.tar.gz -C /target
```

### Bind Mounts (Recommended for Development)

```bash
# Mount current directory into container (live reload during development)
docker run -d \
  -v $(pwd):/app \
  -p 3000:3000 \
  node:20-alpine \
  node server.js

# Read-only bind mount (container can read config but not modify it)
docker run -d \
  -v $(pwd)/config:/app/config:ro \
  my-app:v1
```

---

## Docker Compose

Docker Compose lets you define and run multi-container applications. All services, networks, and volumes are declared in one `docker-compose.yml` file.

### Complete docker-compose.yml Reference

```yaml
services:

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: my-frontend:latest
    container_name: frontend
    ports:
      - "80:3000"
    environment:
      - REACT_APP_API_URL=http://api:4000
    depends_on:
      api:
        condition: service_healthy
    networks:
      - frontend_net
    restart: unless-stopped

  # API
  api:
    build:
      context: ./api
      target: production
    image: my-api:latest
    container_name: api
    ports:
      - "127.0.0.1:4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${POSTGRES_DB}
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend_net
      - backend_net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-myapp}
      POSTGRES_USER: ${POSTGRES_USER:-user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend_net
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-user} -d ${POSTGRES_DB:-myapp}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend_net
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:1.25-alpine
    container_name: nginx
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - api
    networks:
      - frontend_net
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  frontend_net:
    driver: bridge
  backend_net:
    driver: bridge
    internal: true   # No external internet access
```

### Core Compose Commands

```bash
# Start all services in background
docker compose up -d

# Build images before starting
docker compose up -d --build

# View logs for all services
docker compose logs

# Follow logs for a specific service
docker compose logs -f api

# Execute command inside a running service
docker compose exec api bash
docker compose exec postgres psql -U appuser myapp

# Stop all services (containers removed, volumes kept)
docker compose down

# Stop and also remove volumes
docker compose down -v

# Scale a service to 5 instances
docker compose up -d --scale worker=5

# Check status of all services
docker compose ps
```

### depends_on and Health Checks

`depends_on` controls startup order. But by default it only waits for the container to start — not for the app inside to be ready.

Use `condition: service_healthy` to make a service wait until the dependency passes its `healthcheck`:

```yaml
depends_on:
  postgres:
    condition: service_healthy  # waits until postgres healthcheck passes
  redis:
    condition: service_started  # waits only for container to start
```

---

## Docker Security

Security is non-negotiable in production containers.

### Non-Root Users

By default, containers run as `root` (UID 0). This is dangerous — if an attacker escapes the container, they have root on the host. Always run as a non-root user.

```dockerfile
FROM node:20-alpine

# Create group and user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup -u 1001

WORKDIR /app

# Copy files with correct ownership
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --only=production
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
```

### Runtime Security Flags

```bash
# Drop all Linux capabilities, add only what's needed
docker run -d \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  my-app:v1

# Read-only root filesystem (container can't write to its own filesystem)
docker run -d \
  --read-only \
  --tmpfs /tmp \
  my-app:v1

# Prevent privilege escalation
docker run -d \
  --security-opt no-new-privileges:true \
  my-app:v1

# Full hardened run example
docker run -d \
  --name secure_app \
  --user 1001:1001 \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --read-only \
  --tmpfs /tmp:size=50m \
  --security-opt no-new-privileges:true \
  --memory="256m" \
  --cpus="0.25" \
  -p 127.0.0.1:3000:3000 \
  my-app:v1
```

### Image Vulnerability Scanning

```bash
# Scan with Docker Scout
docker scout cves my-app:v1
docker scout quickview my-app:v1

# Scan with Trivy (industry standard, free)
trivy image my-app:v1

# Scan only HIGH and CRITICAL vulnerabilities
trivy image --severity HIGH,CRITICAL my-app:v1

# Fail CI pipeline if CRITICAL CVEs found
trivy image --exit-code 1 --severity CRITICAL my-app:v1
```