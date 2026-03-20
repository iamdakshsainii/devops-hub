const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const roadmapId = "devops-arch-001";

const stepInputs = [
  {
    title: "Foundations (Start Here – Non-Negotiable)",
    icon: "🧱",
    description: "Before touching DevOps tools, build your base:",
    topics: [
      { title: "🖥️ Operating Systems", content: "Learn Linux (very important)\n\nCommands: `ls`, `cd`, `grep`, `chmod`, `ps`, `top`\n\nFile system, permissions, processes\n\n👉 Practice on: Ubuntu (install or use VM)" },
      { title: "🌐 Networking Basics", content: "What is IP, DNS, HTTP/HTTPS\n\nPorts (80, 443, 22)\n\nLoad balancing basics" },
      { title: "💻 Programming / Scripting", content: "Pick ONE:\n- Python (recommended)\n- Bash scripting\n\nFocus on:\n- Automation scripts\n- File handling\n- API calls" }
    ]
  },
  {
    title: "Version Control (Git)",
    icon: "⚙️",
    description: "Master modern version control with GitHub / GitLab.",
    topics: [
      { title: "Git Basics", content: "Learn:\n- Git basics: clone, commit, push, pull\n- Branching & merging\n- Pull requests\n\nUse: GitHub / GitLab" }
    ]
  },
  {
    title: "Build & Package Management",
    icon: "🏗️",
    description: "Understand how apps are built and dependencies are managed.",
    topics: [
      { title: "Package Managers", content: "Learn how apps are built:\n- Maven / Gradle (Java)\n- npm / yarn (Node.js)" }
    ]
  },
  {
    title: "Containers (Core DevOps Skill)",
    icon: "🐳",
    description: "Learn what containerization is using Docker.",
    topics: [
      { title: "Docker Practical", content: "Practice:\n- Build your own Docker images\n- Run containers\n- Dockerfile structure" }
    ]
  },
  {
    title: "Container Orchestration",
    icon: "☸️",
    description: "Scale containers like an expert with Kubernetes.",
    topics: [
      { title: "Kubernetes Concepts", content: "Learn Kubernetes (VERY important)\n\nConcepts:\n- Pods\n- Services\n- Deployments\n- ConfigMaps & Secrets" }
    ]
  },
  {
    title: "CI/CD (Automation Pipeline)",
    icon: "🔁",
    description: "This is the heart of DevOps, automate the pipeline.",
    topics: [
      { title: "Continuous Integration", content: "Tools:\n- Jenkins (most popular)\n- GitHub Actions (easier for beginners)\n\nLearn:\n- Pipelines\n- Automated build, test, deploy" }
    ]
  },
  {
    title: "Cloud Platforms (Pick One First)",
    icon: "☁️",
    description: "Start with AWS (most in-demand).",
    topics: [
      { title: "AWS Core", content: "Learn:\n- EC2 (servers)\n- S3 (storage)\n- IAM (permissions)\n- VPC (networking basics)" }
    ]
  },
  {
    title: "Infrastructure as Code (IaC)",
    icon: "🏗️",
    description: "Automate infrastructure builds accurately.",
    topics: [
      { title: "Terraform", content: "Tools:\n- Terraform (must learn)\n- AWS CloudFormation (optional)" }
    ]
  },
  {
    title: "Monitoring & Logging",
    icon: "📊",
    description: "Know how systems are tracked with dashboards.",
    topics: [
      { title: "Grafana & Prometheus", content: "Tools:\n- Prometheus (metrics)\n- Grafana (dashboards)\n- ELK Stack (logs)" }
    ]
  },
  {
    title: "Security Basics (DevSecOps Intro)",
    icon: "🔐",
    description: "Safeguard continuous workflows easily.",
    topics: [
      { title: "Defensive Posture", content: "- SSH keys\n- Secrets management\n- Basic cloud security" }
    ]
  },
  {
    title: "Projects (MOST IMPORTANT)",
    icon: "🧪",
    description: "Don’t skip this. Projects = job.",
    topics: [
      { title: "Beginner Project", content: "Deploy a simple website using:\n- Docker + GitHub Actions" },
      { title: "Intermediate Project", content: "CI/CD pipeline:\n- Code → Build → Test → Deploy on AWS EC2" },
      { title: "Advanced Project", content: "Microservices app:\n- Docker + Kubernetes + CI/CD + Monitoring" }
    ]
  },
  {
    title: "Timeline & Advice",
    icon: "🧠",
    description: "Key advice to ensure realistic progress.",
    topics: [
      { title: "Timeline Summary", content: "- Basics: 2–4 weeks\n- Git + Docker: 2–3 weeks\n- Kubernetes: 3–4 weeks\n- CI/CD + Cloud: 4–6 weeks\n\nTotal: ~3–5 months (with consistency)" },
      { title: "Mistakes to Avoid", content: "- ❌ Don’t just watch tutorials\n- ✅ Build + break things + fix them\n- ❌ Don’t learn 10 tools\n- ✅ Learn fewer tools deeply\n- ❌ Don’t skip Linux" }
    ]
  }
];

async function main() {
  console.log("Updating Ultimate Roadmap steps...");

  // 1. Delete existing steps
  await prisma.roadmapStep.deleteMany({
    where: { roadmapId: roadmapId }
  });

  // 2. Update roadmap core title/description
  await prisma.roadmap.update({
    where: { id: roadmapId },
    data: {
      title: "🚀 DevOps Roadmap (Beginner → Job Ready)",
      description: "Dive into a complete beginner-friendly roadmap spanning local Linux foundations, version control, build streams, pipeline automation and cloud deployments securely."
    }
  });

  // 3. Create new steps iteratively to preserve indices
  for (let i = 0; i < stepInputs.length; i++) {
    const s = stepInputs[i];
    await prisma.roadmapStep.create({
      data: {
        roadmapId: roadmapId,
        title: s.title,
        icon: s.icon,
        description: s.description,
        order: i,
        topics: {
          create: s.topics.map((t, ti) => ({
            title: t.title,
            content: t.content,
            order: ti
          }))
        }
      }
    });
  }

  console.log("Ultimate Roadmap updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
