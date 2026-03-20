const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/modules/[id]/page.tsx',
  'src/app/admin/roadmaps/new/page.tsx',
  'src/app/admin/resources/resources-list.tsx',
  'src/app/admin/roadmaps/[id]/page.tsx'
];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const target = `<option value="TOOL">Tool</option>`;
  const replacement = `<option value="TOOL">Tool</option>\n                            <option value="NOTES">Notes</option>`;
  
  const targetCompact = `<option value="TOOL">Tool</option></select>`;
  const replacementCompact = `<option value="TOOL">Tool</option><option value="NOTES">Notes</option></select>`;

  if (content.includes(target)) {
     content = content.replace(target, replacement);
     fs.writeFileSync(filePath, content, 'utf8');
     console.log(`Updated ${f}`);
  } else if (content.includes(targetCompact)) {
     content = content.replace(targetCompact, replacementCompact);
     fs.writeFileSync(filePath, content, 'utf8');
     console.log(`Updated compact ${f}`);
  } else {
     console.log(`No Tool option found inside ${f}`);
  }
});
