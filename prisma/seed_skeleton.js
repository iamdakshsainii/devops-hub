const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting full roadmap skeleton seeds...");

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

  const steps = [
    {
      order: 1,
      title: "1. Linux & Terminal Fundamentals",
      description: "Master the command line, kernel basics, and server setups.",
      icon: "🐧",
      topics: [
        { title: "Linux Basics & Navigation", subtopics: ["Root File System", "Standard Streams", "File Navigation"] },
        { title: "User & Permissions Management", subtopics: ["Sudoers file", "Chmod/Chown", "Groups & ID"] }
      ]
    },
    {
      order: 2,
      title: "2. Git & Version Controls (GitOps)",
      description: "Track code changes and collaborate via distributed repos streams.",
      icon: "🌿",
      topics: [
        { title: "Git Basics", subtopics: ["Add, Commit, Push", "Branch Management"] },
        { title: "Advanced Workflows", subtopics: ["Rebase vs Merge", "Stashing & Cherry-pick"] }
      ]
    },
    {
      order: 3,
      title: "3. Containerization (Docker)",
      description: "Learn to wrap apps in lightweight portable bundles.",
      icon: "🐳",
      topics: [
        { title: "Introduction to Images", subtopics: ["The Dockerfile", "Layer Caching", "Volumes & Persist"] }
      ]
    },
    {
      order: 4,
      title: "4. Orchestrations (Kubernetes)",
      description: "Govern cluster nodes and auto-scale distributed bundles.",
      icon: "☸️",
      topics: [
        { title: "K8s Architectures", subtopics: ["Control Plane nodes", "Worker Node setups"] },
        { title: "Workloads & Pods", subtopics: ["Deployments", "Services", "ConfigMaps & Secrets"] }
      ]
    },
    {
      order: 5,
      title: "5. Continuous Integrations (CI/CD)",
      description: "Automate code testing, builds, and automatic deployments.",
      icon: "⚙️",
      topics: [
        { title: "Pipelines Automation", subtopics: ["GitHub Actions Workflows", "Artifacts Management"] }
      ]
    },
    {
      order: 6,
      title: "6. Infrastructures as Code (IaC)",
      description: "Provision hardware grids entirely via code files.",
      icon: "🏗️",
      topics: [
        { title: "Terraform Providers", subtopics: ["States Management", "Modules reusability"] }
      ]
    }
  ];

  console.log("Inserting steps...");

  for (const stepData of steps) {
    const step = await prisma.roadmapStep.create({
      data: {
        roadmapId: roadmap.id,
        title: stepData.title,
        description: stepData.description,
        icon: stepData.icon,
        order: stepData.order,
        status: "PUBLISHED"
      }
    });

    for (const topData of stepData.topics) {
      const topic = await prisma.roadmapTopic.create({
        data: {
          stepId: step.id,
          title: topData.title,
          order: 1,
          content: `Content for ${topData.title}. Edit to add deep notes with images later.`
        }
      });

      // Create Subtopics using the structured table relation offsets!
      const subtopicInserts = topData.subtopics.map((sub, sIdx) => ({
         topicId: topic.id,
         title: sub,
         content: `Detailed documentation layout about **${sub}**. Add illustrations templates later.`,
         order: sIdx + 1
      }));

      await prisma.roadmapSubTopic.createMany({
         data: subtopicInserts
      });
    }
  }

  console.log("Full Roadmap Skeleton Inserted with Structured Subtopics relation frames!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
