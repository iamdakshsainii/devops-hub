import fs from 'fs';
import path from 'path';

const files = [
  'c:\\my-stuff\\devops-hub\\src\\app\\tools\\compare\\page.tsx',
  'c:\\my-stuff\\devops-hub\\src\\app\\tools\\compare\\[id]\\page.tsx',
  'c:\\my-stuff\\devops-hub\\src\\app\\api\\tools\\[slug]\\route.ts',
  'c:\\my-stuff\\devops-hub\\src\\app\\api\\tools\\compare\\[id]\\route.ts',
  'c:\\my-stuff\\devops-hub\\src\\app\\api\\tools\\compare\\route.ts',
  'c:\\my-stuff\\devops-hub\\src\\app\\admin\\comparisons\\page.tsx',
  'c:\\my-stuff\\devops-hub\\src\\app\\admin\\comparisons\\[id]\\page.tsx',
  'c:\\my-stuff\\devops-hub\\src\\app\\api\\admin\\comparisons\\[id]\\route.ts',
  'c:\\my-stuff\\devops-hub\\src\\app\\api\\admin\\comparisons\\route.ts'
];

for (const f of files) {
  if (fs.existsSync(f)) {
     let content = fs.readFileSync(f, 'utf8');
     content = content.replace(/prisma\.comparison\./g, 'prisma.toolComparison.');
     fs.writeFileSync(f, content, 'utf8');
     console.log('✅ Updated: ' + path.basename(f));
  } else {
     console.log('❌ Not found: ' + f);
  }
}
