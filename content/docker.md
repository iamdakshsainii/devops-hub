# Docker - The Complete Guide

A structured, in-depth reference from first principles to production-grade practices.
Suitable for DevOps engineers, platform teams, and developers working with containerized workloads.

---

## 1. What is Docker & Containerization?

Docker is an open-source platform that packages applications and all their dependencies into
standardized units called **containers**. Containers run consistently across any environment —
developer laptops, CI servers, and cloud infrastructure — eliminating the classic
"it works on my machine" problem.

Docker was released in **2013** by Solomon Hykes at dotCloud. It is built on top of existing
Linux kernel primitives — **namespaces** and **cgroups** — and wraps them in a developer-friendly
CLI and image format.

![Docker High-Level Overview](https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=80)

---

### Virtual Machines vs Containers

Both VMs and containers solve the same problem — environment isolation — but through
fundamentally different mechanisms.

![Virtual Machines vs Containers Architecture](https://upload.wikimedia.org/wikipedia/commons/0/09/Docker-linux-interfaces.svg)

Each VM bundles a full Guest OS. Containers share the Host OS kernel directly using
**Linux namespaces** for isolation and **cgroups** for resource limits.

#### Side-by-Side Comparison

| Feature | Virtual Machines | Docker Containers |
| :--- | :--- | :--- |
| **OS Layer** | Full Guest OS per VM | Shares Host OS kernel |
| **Image Size** | 3 GB – 20 GB | 5 MB – 500 MB |
| **Boot Time** | 1 – 5 minutes | Under 1 second |
| **Memory Overhead** | 512 MB – 4 GB per VM | 10 MB – 200 MB per container |
| **Isolation Level** | Full OS boundary | Process-level (namespace) |
| **Portability** | Hypervisor-dependent | Runs on any OCI-compatible runtime |
| **Density** | 3 – 10 per server | 10 – 100+ per server |
| **Security Boundary** | Strong (separate kernel) | Moderate (shared kernel) |

#### When to Use What

- **Use VMs** when you need to run a different OS (Windows on Linux host), require full kernel-level
  isolation for compliance, or are managing long-lived infrastructure like database servers.
- **Use Containers** when deploying microservices, web APIs, CI/CD pipelines, or any workload
  that needs to be portable, fast-booting, and resource-efficient.

#### How Linux Namespaces Power Containers

Namespaces isolate what a process can **see**:

| Namespace | Isolates |
| :--- | :--- |
| `pid` | Process IDs — container sees its own PID 1 |
| `net` | Network interfaces, IP addresses, routing tables |
| `mnt` | Filesystem mount points |
| `uts` | Hostname and domain name |
| `ipc` | Inter-process communication (shared memory, semaphores) |
| `user` | User and group IDs |

cgroups control what a process can **use** — CPU shares, memory limits, disk I/O bandwidth.

```bash
# Inspect the namespaces of a running container process
ls -la /proc/$(docker inspect --format '{{.State.Pid}}' my_container)/ns
```

---

### The Container Ecosystem

Docker is one piece of a larger ecosystem of standards and tools.

![Container Ecosystem Overview](https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Kubernetes_architecture_diagram.svg/1200px-Kubernetes_architecture_diagram.svg.png)

#### OCI — The Open Container Initiative

The **OCI** (Open Container Initiative) defines open standards so containers are not
vendor-locked to Docker. It specifies:

- **OCI Image Spec** — format of a container image (layers, manifests, config)
- **OCI Runtime Spec** — how a runtime creates and runs containers from an image

Docker images are OCI-compliant. This means a Docker image can run on Kubernetes, Podman,
containerd, or any OCI-compatible runtime without modification.

#### Key Tooling by Layer

| Layer | Tools |
| :--- | :--- |
| **Developer Tools** | Docker CLI, Docker Compose, BuildKit |
| **Container Runtime** | containerd, runc (OCI), crun |
| **Orchestration** | Kubernetes (K8s), Docker Swarm, Nomad |
| **Image Registries** | Docker Hub, AWS ECR, GHCR |
| **Security** | Notary/DCT, Trivy, Snyk, AppArmor |
| **Service Mesh** | Istio, Linkerd, Envoy, Consul |

---

## 2. Installing & Core Components

### Docker Desktop

Docker Desktop is the recommended installation for **macOS and Windows** development.
It bundles the Docker CLI, Docker Daemon, Docker Compose, and a lightweight Linux VM
(used because containers require a Linux kernel).

![Docker Desktop](https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=1200&q=80)

#### Installation

**macOS (Apple Silicon / Intel):**

```bash
# Using Homebrew
brew install --cask docker

# Or download the .dmg from:
# https://docs.docker.com/desktop/install/mac-install/
```

**Windows:**

```powershell
# Using Winget
winget install Docker.DockerDesktop

# Or download the installer from:
# https://docs.docker.com/desktop/install/windows-install/
# Requires WSL 2 backend (recommended) or Hyper-V
```

**Linux (Ubuntu/Debian):**

```bash
# Remove older versions if present
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (avoid sudo on every command)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker run hello-world
```

---

### Docker Daemon

The **Docker Daemon** (`dockerd`) is the background service that manages all Docker objects —
images, containers, networks, and volumes. It listens on a Unix socket (`/var/run/docker.sock`)
by default and responds to Docker CLI commands.

![Docker Architecture - Client Daemon](https://docs.docker.com/assets/images/architecture.svg)

#### Daemon Configuration

The daemon is configured via `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {"base": "172.17.0.0/16", "size": 24}
  ],
  "insecure-registries": [],
  "registry-mirrors": ["https://mirror.example.com"],
  "storage-driver": "overlay2",
  "live-restore": true
}
```

```bash
# Reload daemon config without restarting
sudo systemctl reload docker

# Restart daemon
sudo systemctl restart docker

# Check daemon status
sudo systemctl status docker

# View daemon logs
journalctl -u docker.service -f
```

#### Key Daemon Flags

| Flag | Default | Purpose |
| :--- | :--- | :--- |
| `--log-driver` | `json-file` | Container log driver |
| `--storage-driver` | `overlay2` | Filesystem storage backend |
| `--live-restore` | `false` | Keep containers running during daemon restart |
| `--max-concurrent-downloads` | `3` | Parallel layer downloads |
| `--data-root` | `/var/lib/docker` | Docker's data directory |

---

### Images vs Containers

Understanding the difference between images and containers is fundamental to Docker.

![Docker Image and Container Relationship](https://raw.githubusercontent.com/docker/docs/main/content/get-started/images/docker-architecture.webp)

One image can spawn many independent containers. Each container gets a thin writable
layer on top of the shared read-only image layers.

```bash
# Inspect the layers of an image
docker image inspect nginx --format '{{json .RootFS.Layers}}' | python3 -m json.tool

# View image history (layers + sizes)
docker history nginx

# Check image size
docker images nginx
```

#### Image Naming Convention

```bash
# Format: [REGISTRY]/[NAMESPACE]/[IMAGE]:[TAG]

# Examples:
nginx                          # → docker.io/library/nginx:latest
node:20-alpine                 # → docker.io/library/node:20-alpine
myuser/my-app:v1.2.3           # → docker.io/myuser/my-app:v1.2.3
ghcr.io/org/service:sha-abc123 # → GitHub Container Registry
123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest  # → AWS ECR
```

---

## 3. Standard Operations & CLI Syntax

### Container Lifecycle

![Docker Container Lifecycle](https://raw.githubusercontent.com/wsargent/docker-cheat-sheet/master/images/docker_cheatsheet_r3v2.png)

#### `docker run` — Full Syntax

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

```bash
# Run nginx in detached mode, map port 8080 on host to 80 in container
docker run -d -p 8080:80 --name my_web nginx

# Run with environment variables
docker run -d \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DB_URL=postgres://user:pass@host:5432/db \
  --name api \
  my-app:v1

# Run with resource limits
docker run -d \
  --memory="512m" \
  --cpus="0.5" \
  --name limited_app \
  my-app:v1

# Run with volume mount
docker run -d \
  -v /host/data:/app/data \
  --name data_app \
  my-app:v1

# Run interactively with a shell (for debugging)
docker run -it --rm ubuntu bash

# Run and automatically remove container when it exits
docker run --rm alpine echo "Hello from Alpine"

# Run with a custom network
docker run -d \
  --network my_network \
  --name service_a \
  my-service:v1

# Run with restart policy
docker run -d \
  --restart unless-stopped \
  --name always_on \
  nginx

# Override the default command
docker run -it node:20-alpine node -e "console.log('hello')"
```

#### Restart Policies

| Policy | Behavior |
| :--- | :--- |
| `no` (default) | Never restart |
| `on-failure` | Restart only on non-zero exit code |
| `on-failure:5` | Restart on failure, max 5 attempts |
| `always` | Always restart (including after daemon restart) |
| `unless-stopped` | Always restart except if manually stopped |

#### `docker stop` / `docker kill`

```bash
# Graceful stop — sends SIGTERM, waits 10s, then SIGKILL
docker stop my_web

# Custom grace period (30 seconds)
docker stop --time 30 my_web

# Immediate kill — sends SIGKILL directly
docker kill my_web

# Send a specific signal
docker kill --signal SIGHUP my_web

# Stop all running containers
docker stop $(docker ps -q)
```

#### `docker exec` — Running Commands in a Running Container

```bash
# Open an interactive bash shell
docker exec -it my_web bash

# Run a single command and exit
docker exec my_web cat /etc/nginx/nginx.conf

# Run as a specific user
docker exec -u root -it my_web bash

# Set environment variable for the exec session
docker exec -e DEBUG=true -it my_web node debug.js

# Run in a specific working directory
docker exec -w /app -it my_web ls -la
```

---

### Listing Commands & Inspection Sets

#### Container Commands

```bash
# List running containers
docker ps

# List all containers (running + stopped)
docker ps -a

# Compact output — only container IDs
docker ps -q

# Custom format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Filter by status
docker ps -a --filter "status=exited"

# Filter by name
docker ps --filter "name=web"

# View container logs
docker logs my_web

# Follow logs (stream in real-time)
docker logs -f my_web

# Show last N lines only
docker logs --tail 100 my_web

# Show logs with timestamps
docker logs -t my_web

# Since a specific time
docker logs --since 2024-01-01T00:00:00 my_web

# Inspect full container metadata as JSON
docker inspect my_web

# Extract specific field
docker inspect --format '{{.NetworkSettings.IPAddress}}' my_web
docker inspect --format '{{.State.Status}}' my_web

# Live resource usage stats
docker stats

# Stats snapshot (no stream)
docker stats --no-stream

# Processes running inside a container
docker top my_web

# Changes made to container's filesystem
docker diff my_web

# Copy file from container to host
docker cp my_web:/etc/nginx/nginx.conf ./nginx.conf

# Copy file from host to container
docker cp ./nginx.conf my_web:/etc/nginx/nginx.conf
```

#### Image Commands

```bash
# List all local images
docker images
docker image ls

# Filter images by name
docker images nginx

# Show all images including intermediates
docker images -a

# Image details
docker image inspect nginx

# Image history and layers
docker history nginx

# Remove a specific image
docker rmi nginx
docker image rm nginx:latest

# Force remove (even if containers exist using it)
docker rmi -f nginx

# Remove all dangling images (untagged)
docker image prune

# Remove all unused images
docker image prune -a

# Pull a specific image
docker pull node:20-alpine

# Search Docker Hub
docker search nginx --filter stars=100 --limit 5

# Tag an image
docker tag my-app:latest myrepo/my-app:v1.0.0

# Push to registry
docker push myrepo/my-app:v1.0.0

# Save image to a tar archive
docker save -o nginx.tar nginx:latest

# Load image from tar archive
docker load -i nginx.tar
```

#### System Commands

```bash
# Full system info
docker info

# Disk usage breakdown
docker system df
docker system df -v

# Remove all stopped containers
docker container prune

# Remove all unused networks
docker network prune

# Remove everything unused (containers, images, networks, cache)
docker system prune

# Remove EVERYTHING including unused images
docker system prune -a --volumes

# Docker version
docker version
```

---

## 4. Crafting Custom Dockerfiles

A `Dockerfile` is a text file containing sequential instructions that Docker reads to
build an image, layer by layer.

![Dockerfile Build Process](https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=1200&q=80)

### Instruction Reference

#### Complete Dockerfile Instruction Reference

```dockerfile
# ─────────────────────────────────────────────────
# FROM — Base image declaration (must be first instruction)
# ─────────────────────────────────────────────────
FROM node:20-alpine
# Use a specific digest for reproducible builds
FROM node:20-alpine@sha256:abc123...
# Named build stage (for multi-stage builds)
FROM node:20-alpine AS builder


# ─────────────────────────────────────────────────
# ARG — Build-time variables (available only during build)
# ─────────────────────────────────────────────────
ARG APP_VERSION=1.0.0
ARG BUILD_DATE


# ─────────────────────────────────────────────────
# ENV — Runtime environment variables (persisted in image)
# ─────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3000
ENV APP_HOME=/app


# ─────────────────────────────────────────────────
# WORKDIR — Set working directory for subsequent instructions
# Creates directory if it doesn't exist
# ─────────────────────────────────────────────────
WORKDIR /app


# ─────────────────────────────────────────────────
# COPY — Copy files from build context to image
# ─────────────────────────────────────────────────
COPY package*.json ./          # Copy specific files
COPY src/ ./src/               # Copy a directory
COPY . .                       # Copy everything (filtered by .dockerignore)
# Copy from a named build stage
COPY --from=builder /app/dist ./dist
# Set ownership while copying
COPY --chown=node:node . .


# ─────────────────────────────────────────────────
# RUN — Execute commands during image build
# Each RUN creates a new layer — chain commands to reduce layers
# ─────────────────────────────────────────────────
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

RUN npm ci --only=production


# ─────────────────────────────────────────────────
# EXPOSE — Document which port the app listens on
# Does NOT publish the port — informational only
# ─────────────────────────────────────────────────
EXPOSE 3000


# ─────────────────────────────────────────────────
# USER — Switch to a non-root user for security
# ─────────────────────────────────────────────────
USER node


# ─────────────────────────────────────────────────
# HEALTHCHECK — Tell Docker how to test container health
# ─────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1


# ─────────────────────────────────────────────────
# ENTRYPOINT — The executable that runs when container starts
# ─────────────────────────────────────────────────
ENTRYPOINT ["node"]


# ─────────────────────────────────────────────────
# CMD — Default arguments passed to ENTRYPOINT
# ─────────────────────────────────────────────────
CMD ["server.js"]
# Combined: runs → node server.js
```

#### ENTRYPOINT vs CMD

| ENTRYPOINT | CMD | Result |
| :--- | :--- | :--- |
| Not set | `["node","server.js"]` | `node server.js` |
| `["node"]` | `["server.js"]` | `node server.js` |
| `["node"]` | `["--version"]` | `node --version` |
| `["docker-entrypoint.sh"]` | `["postgres"]` | `docker-entrypoint.sh postgres` |

Always use **exec form** (`["node", "server.js"]`) for `CMD` and `ENTRYPOINT` so your
process receives OS signals (SIGTERM on `docker stop`) instead of the shell.

#### `.dockerignore`

```bash
# .dockerignore
node_modules/
.git/
.gitignore
*.log
*.md
.env
.env.*
dist/
coverage/
.DS_Store
Dockerfile
docker-compose*.yml
```

---

### Layer Optimization

![Docker Layer Caching](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80)

Docker caches each layer. **Layers are invalidated top-down** — if one layer changes,
all layers below it are rebuilt. Always copy dependency files before source code.

```dockerfile
# WRONG — invalidates npm install on every code change
FROM node:20-alpine
WORKDIR /app
COPY . .                    # Any file change busts the cache here
RUN npm ci                  # Reinstalls everything every time

# CORRECT — npm install only reruns when package.json changes
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./       # Only changes when deps change
RUN npm ci                  # Cached unless package.json changed
COPY . .                    # Code changes don't affect the npm layer
CMD ["node", "server.js"]
```

#### Choosing the Right Base Image

| Base Image | Size | Use Case |
| :--- | :--- | :--- |
| `ubuntu:22.04` | ~80 MB | Full OS, debugging tools |
| `debian:slim` | ~30 MB | Smaller Debian without extras |
| `alpine:3.19` | ~5 MB | Minimal — musl libc |
| `node:20` | ~360 MB | Full Debian-based Node.js |
| `node:20-slim` | ~70 MB | Debian without build tools |
| `node:20-alpine` | ~50 MB | Alpine-based Node.js (recommended) |
| `gcr.io/distroless/nodejs20` | ~30 MB | No shell — maximum security |
| `scratch` | 0 MB | Empty — for Go/Rust static binaries only |

---

## 5. Docker Networking & Volume Persistence

### Networking

Docker networking controls how containers communicate with each other and the outside world.

![Docker Networking Overview](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80)

#### Network Drivers

| Driver | Scope | Use Case |
| :--- | :--- | :--- |
| `bridge` | Single host | Default. Isolated network per container group |
| `host` | Single host | Container shares host network stack directly |
| `none` | Single host | No networking — fully isolated container |
| `overlay` | Multi-host | Docker Swarm / distributed networking |
| `macvlan` | Single host | Container gets its own MAC/IP on physical network |

#### User-Defined Bridge Networks (Recommended)

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

# Containers on user-defined networks resolve each other by name
# 'web' can reach 'db' simply as 'db:5432' — Docker provides internal DNS
```

#### Network Commands

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

# Port mapping — host port 8080 maps to container port 3000
docker run -d -p 8080:3000 my-app:v1

# Bind to specific host interface (security best practice)
docker run -d -p 127.0.0.1:8080:3000 my-app:v1
```

---

### Volume Mounting

Containers are **ephemeral** by default — their writable layer is destroyed when the
container is removed. Volumes provide persistent storage that outlives the container.

![Docker Volume Types](https://docs.docker.com/storage/images/types-of-mounts.png)

#### Named Volumes (Recommended for Production)

```bash
# Create a named volume
docker volume create my_data

# Use a named volume in a container
docker run -d \
  -v my_data:/var/lib/postgresql/data \
  --name postgres_db \
  postgres:16

# Backup a volume
docker run --rm \
  -v my_data:/source:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/my_data_backup.tar.gz -C /source .

# Restore a volume
docker run --rm \
  -v my_data:/target \
  -v $(pwd):/backup \
  alpine tar xzf /backup/my_data_backup.tar.gz -C /target

# Remove all unused volumes
docker volume prune
```

#### Bind Mounts (Recommended for Development)

```bash
# Bind mount current directory into container
docker run -d \
  -v $(pwd):/app \
  -p 3000:3000 \
  node:20-alpine \
  node server.js

# Read-only bind mount
docker run -d \
  -v $(pwd)/config:/app/config:ro \
  my-app:v1
```

#### Volume Comparison

| | Named Volume | Bind Mount | tmpfs |
| :--- | :--- | :--- | :--- |
| **Location** | Docker-managed | Specific host path | Memory |
| **Persists after rm** | Yes | Yes (host files) | No |
| **Performance** | High | High | Highest |
| **Portability** | High | Low (host-dependent) | N/A |
| **Use case** | DB data, production | Dev, config files | Secrets, temp |

---

## 6. Docker Compose Multi-Container Sets

Docker Compose is a tool for defining and running multi-container applications.
All services, networks, and volumes are declared in a single `docker-compose.yml` file.

![Docker Compose](https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80)

### Complete `docker-compose.yml` Reference

```yaml
# docker-compose.yml
# Compose Spec (no version field required in modern Compose)

services:

  # ── Frontend Service ────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    image: my-frontend:latest
    container_name: frontend
    ports:
      - "80:3000"
    environment:
      - REACT_APP_API_URL=http://api:4000
    env_file:
      - .env.frontend
    depends_on:
      api:
        condition: service_healthy
    networks:
      - frontend_net
    restart: unless-stopped

  # ── API Service ─────────────────────────────────────────────
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

  # ── PostgreSQL Database ──────────────────────────────────────
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

  # ── Redis Cache ──────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend_net
    restart: unless-stopped

  # ── Nginx Reverse Proxy ──────────────────────────────────────
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

#### Core Compose Commands

```bash
# Start all services (build if needed, run in background)
docker compose up -d

# Build images before starting
docker compose up -d --build

# View logs for a specific service
docker compose logs -f api

# Execute command in a running service
docker compose exec api bash
docker compose exec postgres psql -U appuser myapp

# Stop all services (containers removed, volumes kept)
docker compose down

# Stop and remove volumes
docker compose down -v

# Scale a service to 5 instances
docker compose up -d --scale worker=5
```

---

## 7. Enterprise Security & Image Reduction

Security is non-negotiable in production container workloads.

![Container Security](https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80)

### Non-Root Users

By default, Docker containers run as `root` (UID 0). Always run as a non-root user.

```dockerfile
# Alpine-based images
FROM node:20-alpine

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup -u 1001

WORKDIR /app

COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --only=production
COPY --chown=appuser:appgroup . .

USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Runtime Security Flags

```bash
# Drop all Linux capabilities, add only what's needed
docker run -d \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  my-app:v1

# Read-only root filesystem
docker run -d \
  --read-only \
  --tmpfs /tmp \
  my-app:v1

# Prevent privilege escalation
docker run -d \
  --security-opt no-new-privileges:true \
  my-app:v1

# Full hardened run command
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

#### Security Scanning

```bash
# Scan with Docker Scout
docker scout cves my-app:v1
docker scout quickview my-app:v1

# Scan with Trivy (industry standard)
trivy image my-app:v1
trivy image --severity HIGH,CRITICAL my-app:v1
trivy image --exit-code 1 --severity CRITICAL my-app:v1  # Fail CI on critical CVEs
```

---

### Multi-Stage Builds

Multi-stage builds produce lean, secure production images by separating the build
environment from the runtime environment.

![Multi-Stage Docker Build](https://www.docker.com/wp-content/uploads/2021/11/docker-containerized-and-vm-transparent-bg.png)

```dockerfile
# Stage 1: Install ALL dependencies and build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm run test


# Stage 2: Production dependencies only
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force


# Stage 3: Lean production image
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

#### Multi-Stage Go Binary (Zero Base Image)

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Build a statically linked binary — no dependencies needed at runtime
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o server ./cmd/server


# Final stage: scratch (zero base — just the binary)
FROM scratch AS production

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /server

EXPOSE 8080
ENTRYPOINT ["/server"]
# Final image: ~8 MB vs ~350 MB for golang:1.22
```

#### Image Size Reduction Summary

| Technique | Typical Saving |
| :--- | :--- |
| Alpine base instead of full OS | 200–400 MB |
| Multi-stage build | 100–300 MB |
| `--only=production` npm install | 50–200 MB |
| Chain RUN commands | 10–50 MB |
| `.dockerignore` exclusions | 10–100 MB |
| distroless / scratch base | 50–200 MB |

---

*End of Docker - The Complete Guide*