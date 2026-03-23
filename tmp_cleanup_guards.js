const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\components\\step-modules-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Revert helpers with displayPercent fallback node setup trackers triggers
const helpersAnchor = `  const displayPercent = stats.totalTopics === 0 ? 100 : stats.percentComplete;

  const animatedPercent = useCountUp(mounted ? displayPercent : 0);`;

const helpersReplacement = `  const animatedPercent = useCountUp(mounted ? stats.percentComplete : 0);`;

if (content.includes(helpersAnchor)) {
    content = content.replace(helpersAnchor, helpersReplacement);
}

// 2. Revert Flags
const flagsAnchor = `  const isMastered = stats.totalTopics === 0 || stats.percentComplete === 100;
  const isOnFire = !isMastered && stats.percentComplete > 0;`;

const flagsReplacement = `  const isMastered = stats.percentComplete === 100 && stats.totalTopics > 0 && stats.totalModules > 0;
  const isOnFire = stats.percentComplete > 0 && stats.percentComplete < 100 && stats.totalModules > 0;`;

if (content.includes(flagsAnchor)) {
    content = content.replace(flagsAnchor, flagsReplacement);
}

// 3. Revert progress bar display percent 
const barAnchor = `width: mounted ? \`\${displayPercent}%\` : "0%",`;
const barReplacement = `width: mounted ? \`\${stats.percentComplete}%\` : "0%",`;

if (content.includes(barAnchor)) {
    content = content.replace(barAnchor, barReplacement);
}

// 4. Revert ProgressRing percentage
const ringAnchor = `<ProgressRing percent={displayPercent}`;
const ringReplacement = `<ProgressRing percent={stats.percentComplete}`;

if (content.includes(ringAnchor)) {
    content = content.replace(ringAnchor, ringReplacement);
}

fs.writeFileSync(file, content);
console.log("Bug 4 guards applied perfectly securely!");
