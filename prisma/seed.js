const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create admin user
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@devopshub.com" },
    update: {},
    create: {
      email: "admin@devopshub.com",
      fullName: "DevOps Admin",
      passwordHash: hash,
      role: "ADMIN",
      bio: "Platform administrator.",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // 2. Create DevOps Roadmap
  const roadmap = await prisma.roadmap.create({
    data: {
      title: "DevOps Engineering Roadmap 2026",
      description: "A comprehensive, step-by-step guide to mastering DevOps, Cloud Native systems, and Infrastructure Engineering.",
      icon: "🚀",
      color: "#3B82F6",
      status: "PUBLISHED",
      order: 0,
      steps: {
        create: [
          {
            title: "Linux & Networking Fundamentals",
            description: "Master the OS and networking that power every server.",
            icon: "🐧", order: 0,
            topics: { create: [
              { title: "Introduction to Linux", order: 0, content: `<h2>Why Linux Matters in DevOps</h2><p>Linux powers <strong>over 96% of the world's top servers</strong>, making it the foundation of modern DevOps.</p><h3>Key Concepts</h3><ul><li><strong>File System Hierarchy</strong> — <code>/etc</code>, <code>/var</code>, <code>/home</code></li><li><strong>File Permissions</strong> — <code>chmod</code>, <code>chown</code>, <code>umask</code></li><li><strong>Process Management</strong> — <code>ps</code>, <code>top</code>, <code>htop</code>, <code>kill</code></li></ul><h3>Getting Started</h3><p>Start with Ubuntu Server 24.04 LTS. Install it in a VM or use WSL2.</p><pre><code>sudo apt update && sudo apt upgrade -y\nuname -a   # Check kernel version\ndf -h      # Disk usage</code></pre>` },
              { title: "Essential Shell Commands", order: 1, content: `<h2>Shell Commands Every DevOps Engineer Must Know</h2><p>The terminal is your primary interface in DevOps.</p><h3>Navigation & Files</h3><pre><code>cd /var/log          # Navigate\nls -la               # List details\nfind / -name "*.log" # Search files\ngrep -r "error" .    # Search content\ntail -f /var/log/syslog  # Live logs</code></pre><h3>Text Processing</h3><pre><code>cat file.txt | grep "pattern" | awk '{print $2}' | sort | uniq -c\nsed -i 's/old/new/g' file.txt\njq '.items[].name' data.json</code></pre>` },
              { title: "Networking Basics", order: 2, content: `<h2>Networking for DevOps</h2><p>Understanding networking is critical for debugging, security, and infrastructure design.</p><h3>The OSI Model</h3><ul><li><strong>Layer 7</strong> — HTTP, HTTPS, DNS, SSH</li><li><strong>Layer 4</strong> — TCP, UDP, ports</li><li><strong>Layer 3</strong> — IP addresses, routing, subnets</li></ul><h3>Essential Tools</h3><pre><code>ping 8.8.8.8\ntraceroute google.com\ndig example.com\ncurl -v https://api.com\nnmap -sV 192.168.1.0/24</code></pre>` },
            ]},
            resources: { create: [
              { title: "Linux Journey", url: "https://linuxjourney.com", type: "ARTICLE", description: "Free interactive Linux tutorial", order: 0 },
              { title: "Networking Crash Course (YouTube)", url: "https://www.youtube.com/watch?v=IPvYjXCsTg8", type: "VIDEO", description: "Complete networking for DevOps", order: 1 },
              { title: "The Linux Command Line (Free Book)", url: "https://linuxcommand.org/tlcl.php", type: "PDF", description: "500-page free Linux book", order: 2 },
            ]},
          },
          {
            title: "Version Control with Git",
            description: "Master Git workflows, branching, and collaboration patterns.",
            icon: "📂", order: 1,
            topics: { create: [
              { title: "Git Fundamentals", order: 0, content: `<h2>Git — The Foundation of DevOps</h2><p>Every CI/CD pipeline starts with a Git commit.</p><h3>Core Workflow</h3><pre><code>git init\ngit add .\ngit commit -m "feat: initial"\ngit push origin main</code></pre><h3>Branching Strategy</h3><ul><li><code>main</code> — Production code</li><li><code>develop</code> — Integration branch</li><li><code>feature/*</code> — New features</li><li><code>hotfix/*</code> — Emergency fixes</li></ul>` },
              { title: "Advanced Git & PRs", order: 1, content: `<h2>Advanced Git Techniques</h2><h3>Interactive Rebase</h3><pre><code>git rebase -i HEAD~5\ngit cherry-pick abc123</code></pre><h3>PR Best Practices</h3><ul><li>Keep PRs small (under 400 lines)</li><li>Use Conventional Commits</li><li>Request relevant reviewers</li></ul>` },
            ]},
            resources: { create: [
              { title: "Pro Git Book", url: "https://git-scm.com/book/en/v2", type: "PDF", description: "The definitive Git guide", order: 0 },
              { title: "Learn Git Branching", url: "https://learngitbranching.js.org", type: "TOOL", description: "Visual interactive Git tutorial", order: 1 },
            ]},
          },
          {
            title: "Docker & Containers",
            description: "Learn containerization from basics to production-grade builds.",
            icon: "🐳", order: 2,
            topics: { create: [
              { title: "What is Docker?", order: 0, content: `<h2>Containers — The DevOps Game Changer</h2><p>Docker packages your app with <strong>all dependencies</strong> into a portable unit.</p><h3>Why Containers?</h3><ul><li><strong>Consistency</strong> — Works everywhere</li><li><strong>Isolation</strong> — Separate environments</li><li><strong>Speed</strong> — Start in milliseconds</li><li><strong>Efficiency</strong> — Share host OS kernel</li></ul>` },
              { title: "Dockerfile & Images", order: 1, content: `<h2>Building Docker Images</h2><h3>Multi-Stage Build</h3><pre><code>FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/.next ./.next\nCOPY --from=builder /app/node_modules ./node_modules\nEXPOSE 3000\nCMD ["npm", "start"]</code></pre><h3>Best Practices</h3><ul><li>Use <code>alpine</code> base images</li><li>Multi-stage builds</li><li>Don't run as root</li></ul>` },
              { title: "Docker Compose", order: 2, content: `<h2>Multi-Container Apps</h2><pre><code>services:\n  app:\n    build: .\n    ports: ["3000:3000"]\n    depends_on: [db]\n  db:\n    image: postgres:16-alpine\n    volumes: ["pgdata:/var/lib/postgresql/data"]\n  redis:\n    image: redis:7-alpine\nvolumes:\n  pgdata:</code></pre><h3>Commands</h3><pre><code>docker compose up -d\ndocker compose logs -f\ndocker compose down -v</code></pre>` },
            ]},
            resources: { create: [
              { title: "Docker Docs", url: "https://docs.docker.com/get-started/", type: "ARTICLE", description: "Official Docker docs", order: 0 },
              { title: "Docker Crash Course (Nana)", url: "https://www.youtube.com/watch?v=pg19Z8LL06w", type: "VIDEO", description: "3-hour Docker tutorial", order: 1 },
              { title: "Play with Docker", url: "https://labs.play-with-docker.com", type: "TOOL", description: "Free Docker playground", order: 2 },
            ]},
          },
          {
            title: "CI/CD Pipelines",
            description: "Automate testing, building, and deploying with continuous delivery.",
            icon: "⚡", order: 3,
            topics: { create: [
              { title: "CI/CD Concepts", order: 0, content: `<h2>What is CI/CD?</h2><p><strong>CI</strong> automatically builds and tests on every commit. <strong>CD</strong> deploys passing builds to production.</p><h3>The Pipeline</h3><ol><li><strong>Code</strong> → Push to Git</li><li><strong>Build</strong> → Compile & bundle</li><li><strong>Test</strong> → Unit, integration, E2E</li><li><strong>Security Scan</strong> → SAST, audit</li><li><strong>Deploy</strong> → Blue/green rollout</li></ol>` },
              { title: "GitHub Actions", order: 1, content: `<h2>GitHub Actions CI/CD</h2><pre><code>name: CI\non:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test\n      - run: npm run build</code></pre>` },
            ]},
            resources: { create: [
              { title: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "ARTICLE", description: "Official GitHub Actions docs", order: 0 },
            ]},
          },
          {
            title: "Kubernetes & Orchestration",
            description: "Container orchestration at scale — deployments, services, scaling.",
            icon: "☸️", order: 4,
            topics: { create: [
              { title: "Kubernetes Architecture", order: 0, content: `<h2>Why Kubernetes?</h2><p>K8s is the industry standard for containers at scale.</p><h3>Core Components</h3><ul><li><strong>Control Plane</strong> — API Server, Scheduler, etcd</li><li><strong>Worker Nodes</strong> — kubelet, kube-proxy</li><li><strong>Pods</strong> — Smallest unit</li><li><strong>Services</strong> — Stable endpoints</li><li><strong>Deployments</strong> — Desired state + rolling updates</li></ul><pre><code>kubectl get pods -A\nkubectl get svc\nkubectl describe pod my-pod\nkubectl logs -f my-pod</code></pre>` },
              { title: "Deploying Apps to K8s", order: 1, content: `<h2>Your First K8s Deployment</h2><pre><code>apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    spec:\n      containers:\n      - name: app\n        image: myapp:v1.2.0\n        ports:\n        - containerPort: 3000</code></pre><pre><code>kubectl apply -f deployment.yaml\nkubectl rollout status deployment/web-app\nkubectl scale deployment web-app --replicas=5</code></pre>` },
            ]},
            resources: { create: [
              { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/", type: "ARTICLE", description: "Official K8s docs", order: 0 },
              { title: "K8s Course (Nana)", url: "https://www.youtube.com/watch?v=X48VuDVv0do", type: "VIDEO", description: "4-hour K8s tutorial", order: 1 },
              { title: "Killercoda Labs", url: "https://killercoda.com/playgrounds/scenario/kubernetes", type: "TOOL", description: "Free K8s playground", order: 2 },
            ]},
          },
          {
            title: "Infrastructure as Code",
            description: "Define and manage cloud infra using code with Terraform.",
            icon: "🏗️", order: 5,
            topics: { create: [
              { title: "Terraform Basics", order: 0, content: `<h2>Infrastructure as Code with Terraform</h2><p>Define cloud infrastructure in <code>.tf</code> files, version in Git, apply reproducibly.</p><h3>Example: AWS EC2</h3><pre><code>provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t3.micro"\n  tags = { Name = "web-server" }\n}</code></pre><h3>Workflow</h3><pre><code>terraform init\nterraform plan\nterraform apply\nterraform destroy</code></pre>` },
            ]},
            resources: { create: [
              { title: "Terraform Docs", url: "https://developer.hashicorp.com/terraform/docs", type: "ARTICLE", description: "Official HashiCorp docs", order: 0 },
              { title: "Terraform Crash Course", url: "https://www.youtube.com/watch?v=SLB_c_ayRMo", type: "VIDEO", description: "2-hour Terraform tutorial", order: 1 },
            ]},
          },
        ],
      },
    },
  });

  console.log("✅ Roadmap created:", roadmap.title, `(${roadmap.id})`);
  console.log("🎉 Seeding complete! Start with: npm run dev");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
