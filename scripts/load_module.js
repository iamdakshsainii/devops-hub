/**
 * npm run load:module -- --roadmap <roadmapId> --title "Module Title" --icon "🐳"
 *
 * Reads all .md files from /content folder and imports them as topics+subtopics into a
 * single RoadmapStep (module). Great for pasting big ChatGPT notes per module.
 *
 * Markdown format:
 *   ## Topic Title         → creates a Topic
 *   ### Subtopic Title     → creates a Subtopic under the last Topic
 *   Everything below       → becomes the content (markdown, images work)
 */

require('dotenv').config();
console.log("Script starting...");
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseMarkdownToTopics(content) {
  const lines = content.split('\n');
  let currentTopic = null;
  const topics = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      currentTopic = {
        title: trimmed.replace(/^## /, '').trim(),
        content: '',
        subtopics: [], // keep empty initialization so the down-stream SQL doesn't crash on undefined map loops
      };
      topics.push(currentTopic);
    } else if (currentTopic) {
      currentTopic.content += line + '\n';
    }
  }

  return topics;
}

async function main() {
  const args = process.argv.slice(2);
  const getRaw = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const roadmapId = getRaw('--roadmap') || 'devops-arch-001';
  const moduleTitle = getRaw('--title') || 'New Module';
  const moduleIcon = getRaw('--icon') || '📦';
  const moduleOrder = parseInt(getRaw('--order') || '99');

  const contentDir = path.join(__dirname, '../content');
  const specificFile = getRaw('--file');
  let files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md') && f !== 'HOW_TO_ADD_CONTENT.md' && f !== 'MODULE_SYNTAX_GUIDE.md');
  if (specificFile) {
    files = [specificFile];
  }

  if (files.length === 0) {
    console.log('❌ No .md files found in /content folder.');
    return;
  }

  // Find or create roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { id: roadmapId },
    update: {},
    create: {
      id: roadmapId,
      title: 'The Ultimate DevOps Architect Roadmap',
      description: 'A complete guide through the DevOps stack.',
      icon: '🗺️',
      color: '#3B82F6',
      status: 'PUBLISHED',
    }
  });

  console.log(`✅ Roadmap: ${roadmap.title}`);

  // Create the module (RoadmapStep)
  const step = await prisma.roadmapStep.create({
    data: {
      roadmapId: roadmap.id,
      title: moduleTitle,
      description: `Deep dive into ${moduleTitle}.`,
      icon: moduleIcon,
      order: moduleOrder,
      status: 'PUBLISHED',
    }
  });

  console.log(`✅ Created module: ${step.title} (ID: ${step.id})`);

  // Process each file
  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const topics = parseMarkdownToTopics(content);

    console.log(`  📄 ${file} → ${topics.length} topics found`);

    for (let ti = 0; ti < topics.length; ti++) {
      const t = topics[ti];
      const topic = await prisma.roadmapTopic.create({
        data: {
          stepId: step.id,
          title: t.title,
          content: t.content.trim() || null,
          order: ti,
        }
      });

      for (let si = 0; si < t.subtopics.length; si++) {
        const s = t.subtopics[si];
        if (s.title) {
          await prisma.roadmapSubTopic.create({
            data: {
              topicId: topic.id,
              title: s.title,
              content: s.content.trim(),
              order: si,
            }
          });
        }
      }

      console.log(`    ↳ Topic: "${t.title}" (${t.subtopics.length} subtopics)`);
    }

    // Move to processed
    const processedDir = path.join(contentDir, 'processed');
    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir);
    fs.renameSync(filePath, path.join(processedDir, file));
    console.log(`  ✅ Processed and moved: ${file}`);
  }

  console.log('\n🎉 Done! Module loaded to database.');
  console.log(`   View at: /roadmap/${roadmapId}/${step.id}`);
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
