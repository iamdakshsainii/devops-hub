const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'events', 'events-list.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetBlock = `<Dialog>
                        <DialogTrigger asChild>
                           <Button variant="secondary" size="sm" className="h-8 px-3">
                              {event.status === "PENDING" ? "Review" : "Review / Actions"}
                           </Button>
                        </DialogTrigger>`;

if (content.includes(targetBlock)) {
  const replacement = `{event.authorId === currentUserId ? (
                         <Link href={\`/events/dashboard/edit/\${event.id}\`}>
                            <Button variant="secondary" size="sm" className="h-8 px-3">Edit Details</Button>
                         </Link>
                      ) : (
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="secondary" size="sm" className="h-8 px-3">
                              {event.status === "PENDING" ? "Review" : "Review / Actions"}
                           </Button>
                        </DialogTrigger>`;
  
  content = content.replace(targetBlock, replacement);

  // Close with Wrapper
  content = content.replace(`</Dialog>\r\n\r\n                       <Button variant="outline" size="sm"`, `</Dialog>\r\n                      )}\r\n\r\n                       <Button variant="outline" size="sm"`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully wrapped Dialog conditional.');
} else {
  console.log('Target block not found index.');
}
