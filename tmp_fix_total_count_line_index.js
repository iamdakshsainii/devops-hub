const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const targetIdx = lines.findIndex(l => l.includes('const getTotalItemsCount = useCallback'));
if (targetIdx !== -1) {
    const endIdx = lines.findIndex((l, idx) => idx > targetIdx && l.includes('}, [step.topics]);'));
    if (endIdx !== -1) {
        lines.splice(targetIdx, (endIdx + 1) - targetIdx, 
            '  const getTotalItemsCount = useCallback(() => {',
            '    return step.topics.length;',
            '  }, [step.topics]);'
        );
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        console.log('Splice safe execution success!');
    } else {
        console.log('Could not find end of function!');
    }
} else {
    console.log('Could not find start of function!');
}
