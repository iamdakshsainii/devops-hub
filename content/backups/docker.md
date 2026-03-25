# Docker

## Introduction

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

### Docker Desktop

**Docker Desktop** is the recommended install for **macOS and Windows**. It bundles:

- Docker CLI
- Docker Daemon
- Docker Compose
- A lightweight Linux VM (needed because containers require a Linux kernel, which macOS/Windows don't have natively)

On **Linux**, you install Docker Engine directly — no VM needed.

### Installing on macOS

```bash
brew install --cask docker

```

After installing, open Docker Desktop and wait for the whale icon to show "Docker is running".

### Installing on Windows

```powershell
winget install Docker.DockerDesktop

wsl --install
```

### Installing on Linux (Ubuntu / Debian)

```bash
sudo apt remove docker docker-engine docker.io containerd runc

sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker

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
sudo systemctl status docker

sudo systemctl restart docker

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
docker history nginx

docker images nginx

docker image inspect nginx --format '{{json .RootFS.Layers}}'
```

### Image Naming Convention

```bash

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
docker run -d -p 8080:80 --name my_web nginx

docker run -d \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --name api \
  my-app:v1

docker run -d \
  --memory="512m" \
  --cpus="0.5" \
  --name limited_app \
  my-app:v1

docker run -it --rm ubuntu bash

docker run --rm alpine echo "Hello from Alpine"

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
docker stop my_web

docker stop --time 30 my_web

docker kill my_web

docker stop $(docker ps -q)
```

### docker exec — Run Commands Inside a Running Container

```bash
docker exec -it my_web bash

docker exec my_web cat /etc/nginx/nginx.conf

docker exec -u root -it my_web bash

docker exec -w /app -it my_web ls -la
```

### Listing and Inspecting Containers

```bash
docker ps

docker ps -a

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

docker ps -a --filter "status=exited"

docker logs my_web

docker logs -f my_web

docker logs --tail 100 my_web

docker logs -t my_web

docker inspect my_web

docker inspect --format '{{.NetworkSettings.IPAddress}}' my_web

docker stats

docker top my_web

docker cp my_web:/etc/nginx/nginx.conf ./nginx.conf

docker cp ./nginx.conf my_web:/etc/nginx/nginx.conf
```

### Image Commands

```bash
docker images

docker pull node:20-alpine

docker rmi nginx

docker image prune

docker image prune -a

docker tag my-app:latest myrepo/my-app:v1.0.0

docker push myrepo/my-app:v1.0.0

docker save -o nginx.tar nginx:latest

docker load -i nginx.tar
```

### System Commands

```bash
docker info

docker system df

docker container prune

docker network prune

docker system prune

docker system prune -a --volumes
```

---

A `Dockerfile` is a text file with sequential instructions Docker reads to build an image layer by layer. Each instruction creates a new layer.

### Complete Dockerfile Instruction Reference

```dockerfile
FROM node:20-alpine

ARG APP_VERSION=1.0.0

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY package*.json ./
COPY src/ ./src/
COPY . .

COPY --from=builder /app/dist ./dist

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

RUN npm ci --only=production

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["node"]

CMD ["server.js"]
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
FROM node:20-alpine
WORKDIR /app
COPY . .               # Any file change busts the cache here
RUN npm ci             # Reinstalls everything every time

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
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force


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

### What is Docker Networking?

![Image](https://res.cloudinary.com/dyc1j1h62/image/upload/v1774330524/uploads/ela1nnwxmfoq12xgmzvl.png)

When you run multiple containers — like a web app, an API, and a database — they are isolated by default. They cannot talk to each other on their own. Docker Networking solves this by connecting containers through virtual networks so they can communicate securely.

---

### Network Drivers

![Image](https://res.cloudinary.com/dyc1j1h62/image/upload/v1774330496/uploads/onh837opowpbuwgitw2j.png)

Different situations need different types of networks. Docker provides drivers for each use case.

| Driver | Use Case |
| :--- | :--- |
| `bridge` | Default. Containers on the same host talk through a virtual bridge |
| `host` | Container uses host's network directly — no port mapping needed |
| `none` | No network access at all — fully isolated |
| `overlay` | Connects containers across multiple hosts — used in Docker Swarm |
| `macvlan` | Container gets its own IP on the physical network like a real device |

---

### Default Bridge vs User-Defined Bridge

**Problem** — When two containers are on the default bridge network, they cannot reach each other by name. You would need to hardcode IPs which keep changing every restart.

**Solution** — Create a user-defined bridge network. Docker automatically adds DNS to it, so containers can reach each other just by their container name like `http://api:3000` or `postgres://db:5432`.

```bash
# Create a simple custom network
docker network create my_network

# Create a network with fixed subnet and gateway (useful when you need fixed IPs)
docker network create \
  --driver bridge \
  --subnet 192.168.100.0/24 \     # Define the IP range for this network
  --gateway 192.168.100.1 \       # Define the gateway IP
  my_network
```

---

### Connecting Containers to a Network

**Problem** — You have a frontend, backend, and database running as separate containers. They need to talk to each other but should not be exposed to the public internet directly.

**Solution** — Put all of them on the same user-defined network. They will talk to each other by name internally, and only the frontend is exposed to outside via port mapping.

```bash
# All three containers join the same network
docker run -d --name web --network my_network nginx        # frontend
docker run -d --name api --network my_network my-api:v1   # backend
docker run -d --name db  --network my_network postgres:16  # database

# Now 'api' can connect to 'db' using hostname 'db'
# And 'web' can call 'api' using hostname 'api'
# No IPs needed
```

---

### Network Commands

```bash
docker network ls                                    # List all networks on this host
docker network inspect my_network                    # See containers, IPs, config of a network
docker network connect my_network my_container       # Attach a running container to a network
docker network disconnect my_network my_container    # Detach a container from a network
docker network rm my_network                         # Delete a network (no containers should be using it)
```

---

### Port Mapping

**Problem** — Containers are isolated. Even if your app runs on port 3000 inside the container, the outside world cannot access it until you explicitly map it.

**Solution** — Use `-p host_port:container_port` to open a door between your host machine and the container.

```bash
docker run -d -p 8080:3000 my-app:v1              # Anyone on the network can hit localhost:8080
docker run -d -p 127.0.0.1:8080:3000 my-app:v1   # Only accessible from this machine, not outside
```

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
docker volume create my_data

docker run -d \
  -v my_data:/var/lib/postgresql/data \
  --name postgres_db \
  postgres:16

docker volume ls

docker volume inspect my_data

docker volume prune
```

### Backup and Restore a Volume

```bash
docker run --rm \
  -v my_data:/source:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/my_data_backup.tar.gz -C /source .

docker run --rm \
  -v my_data:/target \
  -v $(pwd):/backup \
  alpine tar xzf /backup/my_data_backup.tar.gz -C /target
```

### Bind Mounts (Recommended for Development)

```bash
docker run -d \
  -v $(pwd):/app \
  -p 3000:3000 \
  node:20-alpine \
  node server.js

docker run -d \
  -v $(pwd)/config:/app/config:ro \
  my-app:v1
```

---

Docker Compose lets you define and run multi-container applications. All services, networks, and volumes are declared in one `docker-compose.yml` file.

### Complete docker-compose.yml Reference

```yaml
services:

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

  redis:
    image: redis:7-alpine
    container_name: redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend_net
    restart: unless-stopped

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
docker compose up -d

docker compose up -d --build

docker compose logs

docker compose logs -f api

docker compose exec api bash
docker compose exec postgres psql -U appuser myapp

docker compose down

docker compose down -v

docker compose up -d --scale worker=5

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

Security is non-negotiable in production containers.

### Non-Root Users

By default, containers run as `root` (UID 0). This is dangerous — if an attacker escapes the container, they have root on the host. Always run as a non-root user.

```dockerfile
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

### Runtime Security Flags

```bash
docker run -d \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  my-app:v1

docker run -d \
  --read-only \
  --tmpfs /tmp \
  my-app:v1

docker run -d \
  --security-opt no-new-privileges:true \
  my-app:v1

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
docker scout cves my-app:v1
docker scout quickview my-app:v1

trivy image my-app:v1

trivy image --severity HIGH,CRITICAL my-app:v1

trivy image --exit-code 1 --severity CRITICAL my-app:v1
```

