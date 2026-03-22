const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'events', 'events-list.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `<Button variant="secondary" size="sm" className="h-8 px-3">Review</Button>`;
const replacement = `<Button variant="secondary" size="sm" className="h-8 px-3">{event.status === "PENDING" ? "Review" : "Review / Actions"}</Button>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated Review button text.');
} else {
  console.log('Target string not found inside file index.');
}
