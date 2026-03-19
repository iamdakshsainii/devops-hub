import re

path = r"c:\my-stuff\devops-hub\src\components\step-viewer.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''\{activeTopicId === topic\.id && subtopics\.length > 0 && \(\s*<div className="pl-6 flex flex-col space-y-1 mt-1 border-l-2 ml-4 border-muted/50">[\s\S]*?</div>\s*\}\)'''

insert = r'''{activeTopicId === topic.id && topic.subtopics && topic.subtopics.length > 0 && (
                       <div className="pl-6 flex flex-col space-y-1 mt-1 border-l-2 ml-4 border-muted/50">
                         {topic.subtopics.map((sub, j) => (
                           <button
                             key={sub.id}
                             onClick={() => {
                                const el = document.getElementById(`subtopic-${sub.id}`);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                             }}
                             className="text-xs text-left py-1 px-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors truncate"
                           >
                              {sub.title}
                           </button>
                         ))}
                       </div>
                    )}'''

content_new = re.sub(pattern, insert, content)

if content_new != content:
    with open(path, 'w', encoding='utf-8') as f:
         f.write(content_new)
    print("Success")
else:
    print("Failed")
