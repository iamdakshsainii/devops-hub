const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const targetIdx = lines.findIndex(l => l.includes('const toggleComplete = async (itemId: string, itemType: string) =>'));
if (targetIdx !== -1) {
    const endIdx = lines.findIndex((l, idx) => idx > targetIdx && l.includes(': 0;'));
    if (endIdx !== -1) {
        lines.splice(targetIdx, (endIdx + 1) - targetIdx, 
            '  const toggleComplete = async (itemId: string, itemType: string) => {',
            '    const isCompleted = completedItems.includes(itemId);',
            '    const newItems = isCompleted ',
            '      ? completedItems.filter(id => id !== itemId) ',
            '      : [...completedItems, itemId];',
            '      ',
            '    setCompletedItems(newItems);',
            '    localStorage.setItem(`completed_module_${step.id}`, JSON.stringify(newItems));',
            '',
            '    try {',
            '      await fetch(\'/api/progress\', {',
            '        method: \'POST\',',
            '        headers: { \'Content-Type\': \'application/json\' },',
            '        body: JSON.stringify({ itemId, itemType, completed: !isCompleted })',
            '      });',
            '    } catch (e) {}',
            '',
            '    const completedTopicsCount = step.topics.filter(t => newItems.includes(t.id)).length;',
            '    if (!isCompleted && completedTopicsCount === getTotalItemsCount()) {',
            '      import(\'canvas-confetti\').then(confetti => confetti.default());',
            '    }',
            '  };',
            '',
            '  const completedTopicsCount = step.topics.filter(t => completedItems.includes(t.id)).length;',
            '  const completionPercentage = getTotalItemsCount() > 0 ',
            '    ? Math.round((completedTopicsCount / getTotalItemsCount()) * 100) ',
            '    : 0;'
        );
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        console.log('Percentage recount Splice successful!');
    } else {
        console.log('Could not find end of completionPercentage statement!');
    }
} else {
    console.log('Could not find start of toggleComplete hook!');
}
