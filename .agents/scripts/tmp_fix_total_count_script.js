const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const getTotalItemsCount = useCallback(() => {
    let count = 0;
    for (const t of step.topics) {
      if (t.subtopics && t.subtopics.length > 0) count += t.subtopics.length;
      else if (t.content) count += 1;
    }
    return count;
  }, [step.topics]);`;

const replacement = `  const getTotalItemsCount = useCallback(() => {
    return step.topics.length;
  }, [step.topics]);`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Safe script update getTotalItemsCount executed!');
} else {
  console.log('Target count string not found exactly!');
}
