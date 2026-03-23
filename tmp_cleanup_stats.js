const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\components\\step-modules-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Setup helpers
const setupAnchor = `  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const animatedPercent = useCountUp(mounted ? stats.percentComplete : 0);
  const animatedCompleted = useCountUp(mounted ? stats.completedTopics : 0);`;

const setupReplacement = `  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const displayPercent = stats.totalTopics === 0 ? 100 : stats.percentComplete;

  const animatedPercent = useCountUp(mounted ? displayPercent : 0);
  const animatedCompleted = useCountUp(mounted ? stats.completedTopics : 0);`;

if (content.includes(setupAnchor)) {
    content = content.replace(setupAnchor, setupReplacement);
}

// 2. Adjust boolean flags
const flagsAnchor = `  const isMastered = stats.percentComplete === 100 && stats.totalTopics > 0;
  const isOnFire = stats.percentComplete > 0 && stats.percentComplete < 100;`;

const flagsReplacement = `  const isMastered = stats.totalTopics === 0 || stats.percentComplete === 100;
  const isOnFire = !isMastered && stats.percentComplete > 0;`;

content = content.replace(flagsAnchor, flagsReplacement);

// 3. Update Progress Bar
const barAnchor = `width: mounted ? \`\${stats.percentComplete}%\` : "0%",`;
const barReplacement = `width: mounted ? \`\${displayPercent}%\` : "0%",`;

content = content.replace(barAnchor, barReplacement);

// 4. Update ProgressRing Props
const ringAnchor = `<ProgressRing percent={stats.percentComplete} color={roadmap.color}`;
const ringReplacement = `<ProgressRing percent={displayPercent} color={roadmap.color}`;

content = content.replace(ringAnchor, ringReplacement);

fs.writeFileSync(file, content);
console.log("Empty steps stat triggers added efficiently!");
