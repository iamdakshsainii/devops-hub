const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'events', 'events-list.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `<Dialog>\r\n                        <DialogTrigger asChild>\r\n                           <Button variant="secondary" size="sm" className="h-8 px-3">\r\n                              {event.status === "PENDING" ? "Review" : "Review / Actions"}\r\n                           </Button>\r\n                        </DialogTrigger>`;

// Standardize layout and use regex split
const parts = content.split('<Dialog>');
if (parts.length > 2) {
  // It is the SECOND Dialog on each card item row loop!
  let newContent = content.replace(/<Dialog>([\s\S]*?)<\/Dialog>/g, (match, p1) => {
    if (match.includes('Review / Actions') || match.includes('review-note')) {
        return `{event.authorId === currentUserId ? (
                         <Link href={\`/events/dashboard/edit/\${event.id}\`}>
                            <Button variant="secondary" size="sm" className="h-8 px-3">Edit Details</Button>
                         </Link>
                      ) : (
                        ${match}
                      )}`;
    }
    return match;
  });

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully wrapped using regex.');
} else {
  console.log('No matches found for Dialogue wrapper trigger.');
}
