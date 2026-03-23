const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');

async function main() {
  console.log("Fetching steps with attached modules...");
  
  const steps = await prisma.roadmapStep.findMany({
    where: {
      attachedModules: {
        some: {} // has at least 1 module
      }
    },
    include: {
      topics: true,
      resources: true
    }
  });

  if (steps.length === 0) {
    console.log("No migrated steps found with attached modules. Exiting.");
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log("\n--- STEPS MIGRATED (To Be Cleaned) ---");
  let totalTopics = 0;
  let totalResources = 0;

  steps.forEach(step => {
    if (step.topics.length > 0 || step.resources.length > 0) {
      console.log(`Step: "${step.title}" (${step.id})`);
      if (step.topics.length > 0) {
        console.log(`  - Topics to delete: ${step.topics.length}`);
        totalTopics += step.topics.length;
      }
      if (step.resources.length > 0) {
        console.log(`  - Resources to delete: ${step.resources.length}`);
        totalResources += step.resources.length;
      }
    }
  });

  if (totalTopics === 0 && totalResources === 0) {
    console.log("No leftover direct topics/resources on any migrated steps. Exiting.");
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log(`\nTOTALS: ${totalTopics} Topics, ${totalResources} Resources across steps.`);
  console.log("Proceeding will PERMANENTLY delete these items.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nConfirm deletion? Type "yes" to proceed: ', async (answer) => {
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log("Operation cancelled. Exiting.");
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log("\nDeleting records...");
    let deletedTopics = 0;
    let deletedResources = 0;

    for (const step of steps) {
      if (step.topics.length > 0) {
         const res = await prisma.roadmapTopic.deleteMany({ where: { stepId: step.id } });
         deletedTopics += res.count;
      }
      if (step.resources.length > 0) {
         const res = await prisma.roadmapResource.deleteMany({ where: { stepId: step.id } });
         deletedResources += res.count;
      }
    }

    console.log("--- CLEANUP SUMMARY ---");
    console.log(`Successfully deleted ${deletedTopics} direct topics.`);
    console.log(`Successfully deleted ${deletedResources} direct resources.`);
    console.log("Steps are fully migrated!");

    rl.close();
    await prisma.$disconnect();
  });
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
