const fs = require('fs');

const dashFile = 'c:\\my-stuff\\devops-hub\\src\\app\\dashboard\\page.tsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

// 1. Fix calculation setup on step percentage node triggers sustainably
const percentOld = `       id: roadmap.id, title: roadmap.title, icon: roadmap.icon, color: roadmap.color, description: roadmap.description,
       percent: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
       totalSteps, completedSteps, totalTopics, completedTopics, lastActivity`;

const percentNew = `       id: roadmap.id, title: roadmap.title, icon: roadmap.icon, color: roadmap.color, description: roadmap.description,
       percent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
       totalSteps, completedSteps, totalTopics, completedTopics, lastActivity`;

if (dashContent.includes(percentOld)) {
    dashContent = dashContent.replace(percentOld, percentNew);
}

fs.writeFileSync(dashFile, dashContent);
console.log("Dashboard roadmap percentage fixed safely!");

const clientFile = 'c:\\my-stuff\\devops-hub\\src\\components\\dashboard-client.tsx';
let clientContent = fs.readFileSync(clientFile, 'utf8');

// 2. Remove "Topics Done" from stats node loop inside dashboard-client.tsx
const statsOld = `      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Topics Done", count: allStats.topics, icon: <CheckCircle2 className="h-4 w-4" /> },
           { label: "Modules Finished", count: allStats.modules, icon: <Award className="h-4 w-4" /> },
           { label: "Roadmaps Mastered", count: allStats.roadmaps, icon: <Trophy className="h-4 w-4" /> },
           { label: "Points Earned", count: allStats.points, icon: <Zap className="h-4 w-4" /> },
         ].map(stat => (`;

const statsNew = `      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Modules Finished", count: allStats.modules, icon: <Award className="h-4 w-4" /> },
           { label: "Roadmaps Mastered", count: allStats.roadmaps, icon: <Trophy className="h-4 w-4" /> },
           { label: "Points Earned", count: allStats.points, icon: <Zap className="h-4 w-4" /> },
         ].map(stat => (`;

if (clientContent.includes(statsOld)) {
    clientContent = clientContent.replace(statsOld, statsNew);
}

fs.writeFileSync(clientFile, clientContent);
console.log("Topics Done stat card removed cleanly!");
