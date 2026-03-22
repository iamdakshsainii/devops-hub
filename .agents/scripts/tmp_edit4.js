const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'events', 'events-list.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `<div className="flex gap-1.5 align-middle items-center">`;
const parts = content.split(anchor);

if (parts.length > 1) {
  // Loop through ALL card chunks!
  for (let i = 1; i < parts.length; i++) {
     let chunk = parts[i];
     // Inside this chunk, we have <Dialog>...</Dialog>
     // Replace <Dialog> and </Dialog> WITH Wrapper inside this chunk ONLY!
     chunk = chunk.replace('<Dialog>', `{event.authorId === currentUserId ? (
                         <Link href={\`/events/dashboard/edit/\${event.id}\`}>
                            <Button variant="secondary" size="sm" className="h-8 px-3">Edit Details</Button>
                         </Link>
                      ) : (
                       <Dialog>`);
     
     chunk = chunk.replace('</Dialog>', '</Dialog>\r\n                      )}');
     parts[i] = chunk;
  }

  const newContent = parts.join(anchor);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully wrapped Dialogs on all cards headers.');
} else {
  console.log('Anchor tag split not found index.');
}
