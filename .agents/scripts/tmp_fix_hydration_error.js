const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const targetIdx = lines.findIndex(l => l.includes('const [activeView, setActiveView] = useState'));
if (targetIdx !== -1) {
    const endIdx = lines.findIndex((l, idx) => idx > targetIdx && l.includes('}, [activeView, step.id]);'));
    if (endIdx !== -1) {
        lines.splice(targetIdx, (endIdx + 1) - targetIdx, 
            '  const [activeView, setActiveView] = useState<ActiveView>(getDefaultView);',
            '',
            '  useEffect(() => {',
            '    if (typeof window !== "undefined") {',
            '      const saved = localStorage.getItem(`lastView_${step.id}`);',
            '      if (saved) {',
            '        try { setActiveView(JSON.parse(saved)); } catch (e) {}',
            '      }',
            '    }',
            '  }, [step.id]);',
            '',
            '  useEffect(() => {',
            '    if (typeof window !== "undefined") {',
            '      localStorage.setItem(`lastView_${step.id}`, JSON.stringify(activeView));',
            '    }',
            '  }, [activeView, step.id]);'
        );
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        console.log('Hydration fix splice loaded!');
    } else {
        console.log('Could not find end of activeView hooks!');
    }
} else {
    console.log('Could not find start of activeView state hook!');
}
