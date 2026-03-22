const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/modules/[id]/page.tsx',
  'src/app/admin/roadmaps/new/page.tsx',
  'src/app/admin/resources/resources-list.tsx',
  'src/app/admin/roadmaps/[id]/page.tsx',
  'src/app/admin/resources/new/page.tsx',
  'src/app/admin/resources/[id]/page.tsx'
];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const target = `<option value="DOCS">Docs</option>`;
  const replacement = `<option value="PLAYLIST">Playlist</option>`;

  if (content.includes(target)) {
     content = content.replace(target, replacement);
     fs.writeFileSync(filePath, content, 'utf8');
     console.log(`Updated ${f}`);
  } else {
     console.log(`No Docs option found inside ${f}`);
  }
});
