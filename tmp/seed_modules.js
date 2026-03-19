const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting deep module seeds...");

  // 1. Create a Master Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { id: "devops-arch-001" },
    update: {},
    create: {
      id: "devops-arch-001",
      title: "The Ultimate DevOps Architect Roadmap",
      description: "A highly deep, illustrative guide from basic Linux nodes up to Distributed Microservices architectures.",
      icon: "🗺️",
      color: "#F59E0B",
      status: "PUBLISHED"
    }
  });

  console.log(`Roadmap created:`, roadmap);

  // 2. Create Step 1
  const dockerStep = await prisma.roadmapStep.create({
    data: {
      roadmapId: roadmap.id,
      title: "Containerization Mastery (Docker)",
      description: "Learn how to wrap applications into secure, lightweight, scalable bundles called Containers.",
      icon: "🐳",
      order: 1,
      status: "PUBLISHED"
    }
  });

  // Create Topics for Step 1
  await prisma.roadmapTopic.createMany({
    data: [
      {
        stepId: dockerStep.id,
        title: "1. The Shipping Container Analogy",
        order: 1,
        content: `![Shipping Container](https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80)

## Why Containers Exist

Before containers, deploying software was painful. A developer would write code on their Windows laptop, and it would silently break on the Linux production server because of mismatched library versions, missing dependencies, or different environment variables. The famous phrase was: **"It works on my machine."**

Containers solve this permanently.

---

## The Real-World Analogy

In **1956**, Malcom McLean standardized the shipping container — a steel box with fixed dimensions that could move between ships, trains, and trucks without repacking. Before this, cargo was loaded piece by piece (called "break-bulk"), causing delays and massive losses.

**Docker did exactly the same thing for software.**

| Shipping World | Software World |
| :--- | :--- |
| Steel Container | Docker Container |
| Goods inside the box | Your App + Libraries + Config |
| Ship / Train / Truck | Local Machine / QA Server / AWS Cloud |
| Standard dimensions | Standard container runtime (OCI spec) |

---

## What a Docker Container Actually Bundles

A single container packages all of the following:

- **Application Code** — your Node.js, Python, Java app, etc.
- **Runtime** — the exact version of Node 20, Python 3.11, etc.
- **System Libraries** — glibc, openssl, and other OS-level packages your app needs
- **Environment Variables** — PORT, DATABASE_URL, API keys (injected at runtime)
- **Configuration Files** — nginx.conf, .env defaults, etc.

Everything is bundled into a single portable image file.

---

## How It Runs: The Key Technical Insight

Containers do **not** virtualize hardware. They share the Host OS kernel directly using two Linux kernel features:

### 1. Namespaces
Namespaces isolate what a process can *see*. Each container gets its own:
- **PID namespace** — process IDs are isolated (container sees PID 1, host sees a different PID)
- **NET namespace** — its own virtual network interface and IP
- **MNT namespace** — its own filesystem mount points
- **UTS namespace** — its own hostname

### 2. Control Groups (cgroups)
cgroups control what a process can *use*:
- CPU limits (e.g., max 0.5 cores)
- Memory limits (e.g., max 512 MB RAM)
- Disk I/O throttling

Together, namespaces + cgroups = **a container**. Docker is just a friendly tool that sets these up for you automatically.

---

## Key Benefits

- **Portability** — build once, run anywhere (dev laptop → CI server → cloud)
- **Consistency** — same environment every time, no "works on my machine"
- **Speed** — starts in milliseconds (shares host kernel, no boot sequence)
- **Density** — run 10–50 containers on a server where only 3–5 VMs would fit
- **Isolation** — if one container crashes, others are unaffected

---

## Quick Visual: Container vs No Container

\`\`\`
WITHOUT CONTAINERS:
Dev Machine  →  QA Server  →  Prod Server
(Node 18)       (Node 16)      (Node 20)
    ❌ Breaks       ❌ Breaks

WITH CONTAINERS:
Dev Machine  →  QA Server  →  Prod Server
[Container]     [Container]    [Container]
(Node 18 inside)(Node 18 inside)(Node 18 inside)
    ✅ Works        ✅ Works        ✅ Works
\`\`\``
      },
      {
        stepId: dockerStep.id,
        title: "2. Containers vs Virtual Machines",
        order: 2,
        content: `![Containers vs VM](https://images.unsplash.com/photo-1558494949-ef010bfd6dd3?auto=format&fit=crop&w=1200&q=80)

## The Core Difference

Both VMs and containers provide isolation. But they achieve it in completely different ways, with very different trade-offs.

---

## Architecture Diagrams

### Virtual Machine Architecture
\`\`\`
+---------------------------+
|   App A   |   App B       |
+-----------+---------------+
| Guest OS  | Guest OS      |   ← Each VM carries a full OS (3–20 GB each)
+-----------+---------------+
|       Hypervisor          |   ← VMware, VirtualBox, KVM, Hyper-V
+---------------------------+
|       Host OS             |
+---------------------------+
|       Hardware            |
+---------------------------+
\`\`\`

### Container Architecture
\`\`\`
+-------+-------+-------+
| App A | App B | App C |
+-------+-------+-------+
| Libs  | Libs  | Libs  |   ← Only app + libs bundled per container
+-------+-------+-------+
|     Container Runtime  |   ← Docker, containerd, podman
+------------------------+
|       Host OS (Kernel) |   ← Shared directly — no guest OS!
+------------------------+
|       Hardware         |
+------------------------+
\`\`\`

---

## Side-by-Side Comparison

| Feature | Virtual Machines | Docker Containers |
| :--- | :--- | :--- |
| **OS Layer** | Full Guest OS per VM | Shares Host OS kernel |
| **Image Size** | 3 GB – 20 GB | 5 MB – 500 MB |
| **Boot Time** | 1–5 minutes | Under 1 second |
| **Memory Usage** | 512 MB – 4 GB per VM | 10 MB – 200 MB per container |
| **Isolation Level** | Strong (full OS boundary) | Process-level (namespace isolation) |
| **Portability** | Moderate (hypervisor-dependent) | High (runs on any Docker runtime) |
| **Density** | 3–10 per server | 10–100+ per server |
| **Use Case** | Running different OS types | Microservices, apps, CI/CD |

---

## When to Use What

**Use VMs when:**
- You need to run Windows on a Linux host (or vice versa)
- You need full OS-level isolation for compliance/security
- You're provisioning long-lived infrastructure (database servers, AD controllers)

**Use Containers when:**
- You're deploying microservices or web applications
- You need fast CI/CD pipelines (spin up, test, destroy)
- You want to maximize resource efficiency on cloud servers
- Your app needs to be portable across dev/staging/prod environments

---

## The Kernel Share — Why It Matters

A VM's Guest OS contains:
- Kernel (~100 MB)
- Init system (systemd)
- Device drivers
- System daemons (cron, udev, etc.)

None of this runs in a container. Containers call the **host kernel directly** using standard Linux syscalls. This is why:

1. A container image can be as small as 5 MB (e.g., \`alpine\` base image)
2. You can run 50 containers on a machine that could only run 5 VMs
3. Containers start instantly — there is nothing to boot

**Important caveat:** Because containers share the host kernel, a Linux container cannot run on Windows without a Linux VM underneath (which is exactly what Docker Desktop does on Mac/Windows — it runs a lightweight Linux VM and puts containers inside it).

---

## Practical Example: Resource Comparison

Running a Node.js API:

\`\`\`
VM approach:
  - Ubuntu 22.04 VM: 2 GB RAM, 20 GB disk, 45s boot
  - Node.js app inside: 150 MB RAM

Container approach:
  - node:20-alpine image: 180 MB disk
  - Container RAM: ~150 MB
  - Boot time: < 1 second
\`\`\`

On a 16 GB RAM server:
- VMs: ~6 instances
- Containers: ~80 instances`
      },
      {
        stepId: dockerStep.id,
        title: "3. Core Docker Operations & Commands",
        order: 3,
        content: `## Docker's Three Core Concepts

Before running any commands, understand the three objects Docker works with:

### 1. Image
- A **read-only, layered template** for creating containers
- Built from a \`Dockerfile\`
- Stored in a registry (Docker Hub, ECR, GCR)
- Think of it as a **class** in OOP — it defines the blueprint

### 2. Container
- A **running instance of an image**
- Has its own isolated filesystem, network, and processes
- Can be started, stopped, paused, and deleted
- Think of it as an **object** created from the class (image)

### 3. Registry
- A **storage and distribution server** for Docker images
- Docker Hub is the default public registry
- AWS ECR, GitHub Container Registry are popular private registries

---

## The Docker Lifecycle

\`\`\`
Dockerfile
    │
    ▼
docker build   →   Image   →   docker push   →   Registry
                     │
                     ▼
               docker run   →   Container
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
               docker stop    docker logs    docker exec
\`\`\`

---

## Essential Commands — Full Reference

### Image Management

\`\`\`bash
# Pull an image from Docker Hub
docker pull nginx                        # pulls nginx:latest
docker pull nginx:1.25-alpine            # pulls specific version

# List all local images
docker images
docker image ls

# Remove an image
docker rmi nginx
docker image rm nginx:1.25-alpine

# Build an image from a Dockerfile in current directory
docker build -t my-app:v1 .

# Tag an existing image
docker tag my-app:v1 myrepo/my-app:v1

# Push image to a registry
docker push myrepo/my-app:v1
\`\`\`

### Container Management

\`\`\`bash
# Run a container (basic)
docker run nginx

# Run in detached mode (background)
docker run -d nginx

# Run with port mapping (host:container)
docker run -d -p 8080:80 nginx
# Now access via http://localhost:8080

# Run with a name
docker run -d -p 8080:80 --name my_web nginx

# Run with environment variables
docker run -d -e NODE_ENV=production -e PORT=3000 my-app:v1

# Run with volume mount (persist data)
docker run -d -v /host/path:/container/path nginx

# Run interactively (get a shell)
docker run -it ubuntu bash

# Run and auto-remove when stopped
docker run --rm ubuntu echo "hello"
\`\`\`

### Container Lifecycle

\`\`\`bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container gracefully (SIGTERM, then SIGKILL after 10s)
docker stop my_web

# Start a stopped container
docker start my_web

# Restart a container
docker restart my_web

# Kill a container immediately (SIGKILL)
docker kill my_web

# Remove a stopped container
docker rm my_web

# Remove a running container forcefully
docker rm -f my_web

# Stop and remove all containers
docker stop $(docker ps -q) && docker rm $(docker ps -aq)
\`\`\`

### Debugging & Inspection

\`\`\`bash
# View container logs
docker logs my_web

# Follow logs in real-time
docker logs -f my_web

# Show last 100 lines
docker logs --tail 100 my_web

# Execute a command inside a running container
docker exec -it my_web bash

# Inspect container metadata (JSON)
docker inspect my_web

# View resource usage (CPU, Memory)
docker stats

# View processes inside a container
docker top my_web

# Copy files between host and container
docker cp my_web:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./nginx.conf my_web:/etc/nginx/nginx.conf
\`\`\`

### System Cleanup

\`\`\`bash
# Remove all stopped containers, unused images, networks, build cache
docker system prune

# Remove everything including unused images
docker system prune -a

# Check disk usage
docker system df
\`\`\`

---

## Writing a Dockerfile

A \`Dockerfile\` defines how your image is built — layer by layer.

\`\`\`dockerfile
# Base image — start from official Node.js 20 on Alpine Linux (tiny, ~5 MB)
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of application code
COPY . .

# Expose the port the app listens on (documentation only)
EXPOSE 3000

# Default command to run when container starts
CMD ["node", "server.js"]
\`\`\`

### Build and run it:

\`\`\`bash
docker build -t my-node-app:v1 .
docker run -d -p 3000:3000 --name api my-node-app:v1
\`\`\`

---

## Layer Caching — Why Order Matters

Docker builds images layer by layer. Each instruction (\`FROM\`, \`RUN\`, \`COPY\`) creates a new layer. Layers are **cached** — if nothing changed, Docker reuses the cached layer instead of rebuilding.

**Bad order (slow builds):**
\`\`\`dockerfile
COPY . .              # Changes every time code changes
RUN npm install       # Reinstalls all packages every time!
\`\`\`

**Good order (fast builds):**
\`\`\`dockerfile
COPY package*.json ./ # Only changes when deps change
RUN npm install       # Only reruns when package.json changes
COPY . .              # Code changes don't affect the npm cache layer
\`\`\`

---

## Key Flags Reference

| Flag | Full Form | Purpose |
| :--- | :--- | :--- |
| \`-d\` | \`--detach\` | Run container in background |
| \`-p\` | \`--publish\` | Map host port to container port |
| \`-e\` | \`--env\` | Set environment variable |
| \`-v\` | \`--volume\` | Mount a volume |
| \`-it\` | \`--interactive --tty\` | Interactive terminal session |
| \`--name\` | — | Assign a name to the container |
| \`--rm\` | — | Auto-remove container when it exits |
| \`--network\` | — | Connect to a specific Docker network |`
      }
    ]
  });

  // Create Resources for Step 1
  await prisma.roadmapResource.createMany({
    data: [
      { stepId: dockerStep.id, title: "Official Docker Walkthrough", url: "https://docs.docker.com", type: "DOCS", description: "Step-by-step guides from beginners up for index.", order: 1 },
      { stepId: dockerStep.id, title: "Advanced Container Networking", url: "https://youtube.com", type: "VIDEO", description: "Continuous nodes architectures video streams mapped.", order: 2 }
    ]
  });

  console.log("Docker Step with detailed notes inserted!");

  // 3. Create Step 2
  const cicdStep = await prisma.roadmapStep.create({
    data: {
      roadmapId: roadmap.id,
      title: "Advanced CI/CD Pipelines (GitHub Actions)",
      description: "Automate code testing, builds, and automatic deployments flawlessly upon Git push triggers.",
      icon: "⚙️",
      order: 2,
      status: "PUBLISHED"
    }
  });

  await prisma.roadmapTopic.createMany({
    data: [
      {
        stepId: cicdStep.id,
        title: "1. What is Continuous Integration?",
        order: 1,
        content: `![Automation workflow](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

## The Problem CI Solves

In traditional software teams, developers worked in isolation for days or weeks, then tried to merge their code. This caused **"integration hell"** — a painful phase where everyone's code conflicted and broke everything at once.

**Continuous Integration (CI)** solves this by merging and validating code changes **continuously** — multiple times per day.

---

## What Happens on Every Push

When you push code to GitHub, the CI pipeline automatically runs:

\`\`\`
Developer pushes code
        │
        ▼
GitHub detects push event
        │
        ▼
CI Runner (Ubuntu VM) is provisioned
        │
        ▼
┌───────────────────────────┐
│  1. Checkout code         │
│  2. Install dependencies  │
│  3. Run linter (ESLint)   │
│  4. Run unit tests        │
│  5. Run integration tests │
│  6. Build artifacts       │
└───────────────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
 PASS       FAIL
   │         │
Merge      Block merge
allowed    + notify developer
\`\`\`

---

## CI vs CD — The Full Picture

These are often said together (CI/CD) but are separate concepts:

| Term | Full Form | What it Does |
| :--- | :--- | :--- |
| **CI** | Continuous Integration | Automatically build and test on every push |
| **CD** | Continuous Delivery | Automatically prepare a tested, deployable artifact |
| **CD** | Continuous Deployment | Automatically deploy to production after tests pass |

Most teams do CI + Continuous Delivery. Full Continuous Deployment (auto-deploy to prod) requires very high test confidence.

---

## GitHub Actions — Core Concepts

GitHub Actions is GitHub's built-in CI/CD platform. It runs inside \`.github/workflows/\` YAML files in your repo.

### Key Terminology

| Term | Meaning |
| :--- | :--- |
| **Workflow** | A YAML file defining the entire automation |
| **Event** | The trigger that starts the workflow (push, PR, schedule) |
| **Job** | A group of steps that run on one runner |
| **Step** | A single command or action within a job |
| **Action** | A reusable plugin (e.g., \`actions/checkout\`, \`actions/setup-node\`) |
| **Runner** | The machine that executes the job (GitHub-hosted or self-hosted) |

---

## Anatomy of a Workflow File

\`\`\`yaml
name: Node.js CI Pipeline          # Name shown in GitHub Actions UI

on:                                 # Events that trigger this workflow
  push:
    branches: [main, develop]       # Only on pushes to these branches
  pull_request:
    branches: [main]                # And on PRs targeting main

jobs:                               # Define one or more jobs
  build-and-test:                   # Job ID (can be anything)
    runs-on: ubuntu-latest          # Runner OS

    steps:
      - name: Checkout code
        uses: actions/checkout@v4   # Clone the repo into the runner

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'              # Cache node_modules for faster runs

      - name: Install dependencies
        run: npm ci                 # Clean install (faster, deterministic)

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm test

      - name: Build application
        run: npm run build
\`\`\`

---

## Common Trigger Events

\`\`\`yaml
on:
  push:                        # On any push
  push:
    branches: [main]           # Only on push to main
  pull_request:                # On PR open/update/sync
  schedule:
    - cron: '0 0 * * *'        # Daily at midnight UTC
  workflow_dispatch:           # Manual trigger via GitHub UI
  release:
    types: [published]         # When a GitHub Release is published
\`\`\`

---

## Using Secrets in Workflows

Never hardcode credentials. Store them in **GitHub Secrets** (Settings → Secrets → Actions) and reference them as environment variables:

\`\`\`yaml
steps:
  - name: Deploy to AWS
    env:
      AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
    run: |
      aws s3 sync ./dist s3://my-bucket --delete
\`\`\`

---

## Running Jobs in Parallel vs Sequential

### Parallel (default — jobs run simultaneously):
\`\`\`yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
\`\`\`

### Sequential (use \`needs\` to chain jobs):
\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: test              # Only runs if 'test' job passes
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
\`\`\`

---

## Caching Dependencies (Speed Optimization)

Re-downloading \`node_modules\` on every run wastes time. Use caching:

\`\`\`yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-node-

- name: Install dependencies
  run: npm ci
\`\`\`

The cache key is based on the \`package-lock.json\` hash — so it invalidates automatically whenever dependencies change.

---

## Build Matrix — Test Across Multiple Versions

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]   # Run tests on all three Node versions

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node - version }}
      - run: npm ci && npm test
\`\`\`

This creates 3 parallel jobs automatically — one per Node version.

---

## Real-World CI Pipeline: Docker Build + Push to ECR

\`\`\`yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image
        env:
          ECR_REGISTRY: \${{ steps.login - ecr.outputs.registry }}
          IMAGE_TAG: \${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/my-app:$IMAGE_TAG .
          docker push $ECR_REGISTRY/my-app:$IMAGE_TAG
\`\`\``
      },
      {
        stepId: cicdStep.id,
        title: "2. Continuous Delivery & Deployment Strategies",
        order: 2,
        content: `## Continuous Delivery vs Continuous Deployment

Both terms are abbreviated as CD but mean different things:

| | Continuous Delivery | Continuous Deployment |
| :--- | :--- | :--- |
| **Definition** | Code is always in a deployable state; deploy is triggered manually | Every passing build is deployed to production automatically |
| **Human approval** | Yes — someone clicks "Deploy" | No — fully automated |
| **Risk** | Lower (human gate) | Higher (requires excellent test coverage) |
| **Speed** | Fast | Fastest |
| **Best for** | Most production apps | High-confidence teams with strong test suites |

---

## Deployment Strategies

Choosing how to deploy is critical. Deploying incorrectly causes downtime and user impact.

---

### 1. Rolling Deployment

Replace old instances with new ones gradually, one at a time.

\`\`\`
Before:  [v1] [v1] [v1] [v1]
Step 1:  [v2] [v1] [v1] [v1]
Step 2:  [v2] [v2] [v1] [v1]
Step 3:  [v2] [v2] [v2] [v1]
After:   [v2] [v2] [v2] [v2]
\`\`\`

- **Pros:** No downtime, gradual rollout
- **Cons:** Both versions run simultaneously during rollout (schema changes are dangerous)
- **Used by:** Kubernetes default rolling update strategy

---

### 2. Blue/Green Deployment

Run two identical environments. Switch traffic all at once.

\`\`\`
Blue (current prod — v1):   ←── 100% traffic
Green (new version — v2):   ←── 0% traffic (being tested)

Switch DNS/Load Balancer:

Blue (old — v1):            ←── 0% traffic (kept as rollback)
Green (new — v2):           ←── 100% traffic
\`\`\`

- **Pros:** Instant rollback (flip traffic back to Blue)
- **Cons:** Requires double the infrastructure during deployment
- **Used by:** AWS CodeDeploy, many production systems

---

### 3. Canary Deployment

Route a small percentage of traffic to the new version first.

\`\`\`
Phase 1: v1 = 95%, v2 = 5%    (monitoring for errors)
Phase 2: v1 = 70%, v2 = 30%
Phase 3: v1 = 0%,  v2 = 100%
\`\`\`

- **Pros:** Real user traffic tests the new version, low blast radius
- **Cons:** Complex traffic splitting setup (needs service mesh or ALB weighted routing)
- **Used by:** Netflix, AWS (weighted target groups), Kubernetes with Argo Rollouts

---

## GitHub Actions: Full CD Pipeline Example

\`\`\`yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  # --- Stage 1: Test ---
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  # --- Stage 2: Build Docker Image ---
  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image_tag: \${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4

      - name: Set image metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: type=sha

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}

  # --- Stage 3: Deploy to Production ---
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production          # Requires manual approval in GitHub UI
    steps:
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-def.json
          service: my-service
          cluster: my-cluster
          wait-for-service-stability: true
\`\`\`

---

## Environment Protection Rules

In GitHub, you can add protection rules to environments (Settings → Environments):

- **Required reviewers** — a human must approve before deploy runs
- **Wait timer** — add a delay between job completion and deploy start
- **Deployment branches** — only allow deploys from specific branches (e.g., \`main\`)

This turns Continuous Delivery into a proper **gated release process**.

---

## Rollback Strategy

Always plan for rollback before deploying.

### Option 1: Redeploy the previous image tag
\`\`\`bash
# Store the previous image tag, then redeploy it
aws ecs update-service \
  --cluster my-cluster \
  --service my-service \
  --task-definition my-app:PREVIOUS_REVISION
\`\`\`

### Option 2: Git revert + re-run pipeline
\`\`\`bash
git revert HEAD --no-edit
git push origin main
# Pipeline runs automatically and deploys reverted code
\`\`\`

### Option 3: Blue/Green instant rollback
\`\`\`bash
# Flip load balancer back to Blue environment
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions Type=forward,TargetGroupArn=$BLUE_TG_ARN
\`\`\`

---

## Self-Hosted Runners

GitHub-hosted runners are free but have limits. For large teams or private VPCs, use self-hosted runners.

\`\`\`yaml
jobs:
  deploy:
    runs-on: self-hosted      # Uses your own registered runner
    steps:
      - run: ./deploy.sh
\`\`\`

Register a self-hosted runner on any Linux machine:
\`\`\`bash
# Download and configure the runner agent
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO \
             --token YOUR_TOKEN
./run.sh
\`\`\``
      }
    ]
  });

  // Create Resources for Step 2
  await prisma.roadmapResource.createMany({
    data: [
      { stepId: cicdStep.id, title: "GitHub Actions Official Docs", url: "https://docs.github.com/en/actions", type: "DOCS", description: "Complete reference for GitHub Actions syntax, triggers, and marketplace.", order: 1 },
      { stepId: cicdStep.id, title: "CI/CD with GitHub Actions – Full Course", url: "https://youtube.com", type: "VIDEO", description: "End-to-end pipeline from code push to production deployment.", order: 2 }
    ]
  });

  console.log("CI/CD Step with detailed notes inserted!");
  console.log("All seeds completed successfully!");
}

main()
  .catch((e) => { 
     console.error("== PRISMA ERROR ==");
     console.error(e); 
     process.exit(1); 
  })
  .finally(async () => { await prisma.$disconnect(); });