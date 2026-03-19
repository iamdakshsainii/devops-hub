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

  console.log(`Roadmap created: ${roadmap.title}`);

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
        content: `![Shipping Container](https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80)\n\n### Why do we need Containers?\nImagine shipping items without standard dimensions across boats, trains, or trucks. Total chaos! \nIn **1956**, standard shipping containers revolutionized trade by creating a single standard box fit everywhere.\n\n**In Software:**\nYour code runs inside a standard **Docker Container**.\n- It bundles the **Code**, **Runtimes**, **Libraries**, and **Configurations** all into one standardized box.\n- It guaranteed to run the exact same way on your Local machine, QA test server, and AWS/Azure Cloud dashboards securely!\n\n---\n#### 🔧 Technical Highlights:\n- **Lightweight**: Shares the Host OS kernel instead of virtualizing whole OS sets (like Virtual Machines).\n- **Sub-Second Bootups**: Starts instantly like a process, instead of booting full Kernels.`
      },
      {
        stepId: dockerStep.id,
        title: "2. Containers vs Virtual Machines",
        order: 2,
        content: `![Containers vs VM](https://images.unsplash.com/photo-1558494949-ef010bfd6dd3?auto=format&fit=crop&w=1200&q=80)\n\n### ⚖️ The core difference\nMany people confuse Containers with Virtual Machines (VMs). Here is the absolute simplest breakdown:\n\n| Feature | Virtual Machines | Docker Containers |\n| :--- | :--- | :--- |\n| **OS Layout** | Heavyweight. Runs full Guest OS layer per VM. | Lightweight. Shares the Host OS directly. |\n| **Sizes** | Packs in 10-20 GBs average space. | Ranges between 5 MB to 500 MB max loads. |\n| **Performance**| Slower boots (minutes). | Lightning Boot (seconds). |\n\n---\n### 🧠 Deep Dive: The Kernel Share\nBecause Containers share the Host OS kernel, they don't overhead overhead standard drivers caches. This is why we can pack **10x more Containers** on a single server than VMs mapped accurately!`
      },
      {
        stepId: dockerStep.id,
        title: "3. Core Docker Operations & Commands",
        order: 3,
        content: `### 🚀 Writing your first Commands\nTo manage containers, we use the standard Docker CLI. Here are the 3 pillars of Docker:\n\n1. **Images**: The read-only templates boards (Like a blueprint).\n2. **Containers**: The running instance of an image layout (Like the building).\n3. **Registry**: Where we download images from (Like a shop e.g. DockerHub).\n\n---\n#### 🛠️ Essential Operations Sheet:\n\`\`\`bash\n# 1. Downloads high load image from Dockerhub\ndocker pull nginx\n\n# 2. Runs the container with local web port forwarding triggers\ndocker run -d -p 8080:80 --name my_web nginx\n\n# 3. Inspects active containers lists\ndocker ps\n\n# 4. Stops container securely\ndocker stop my_web\n\`\`\`\n\n---\n#### 💡 Expert Tips:\nUse \`-d\` (detached mode) to run in background layout without locking your logs streams terminal boards.`
      }
    ]
  });

  // Create Resources for Step 1
  await prisma.roadmapResource.createMany({
    data: [
       { stepId: dockerStep.id, title: "Official Docker Walkthrough", url: "https://docs.docker.com", type: "DOCS", description: "Step-by-step guides from beginners up for index.", order: 1 },
       { stepId: dockerStep.id, title: "Advanced Container Networkings", url: "https://youtube.com", type: "VIDEO", description: "Continuous nodes architectures video streams mapped.", order: 2 }
    ]
  });

  console.log(`Docker Step containing core rich content Inserted flawlessly!`);

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

  await prisma.roadmapTopic.create({
    data: {
      stepId: cicdStep.id,
      title: "1. What is continuous integrations?",
      order: 1,
      content: `![Automation workflow](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)\n\n### 🛡️ Preventing Code Breaks\n**CI (Continuous Integration)** means every time you push code to GitHub:\n1. An automated build triggers.\n2. Formatter & Linters execute tests.\n3. Unit tests check for regressions alerts.\n\nIf ANY test fails, the Automations blocks the merge queue, keeping your production branch 100% bug-free securely mapped natively!\n\n---\n#### ✍️ Standard CI layout:\n\`\`\`yaml\nname: Node CI Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: install node\n        uses: actions/setup-node@v4\n      - run: npm install && npm test\n\`\`\`\n`
    }
  });

  console.log("Seed loads successful!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
