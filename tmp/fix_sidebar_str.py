path = r"c:\my-stuff\devops-hub\src\components\step-viewer.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                    {activeTopicId === topic.id && subtopics.length > 0 && (
                       <div className="pl-6 flex flex-col space-y-1 mt-1 border-l-2 ml-4 border-muted/50">
                         {subtopics.map((sub, j) => (
                           <button
                             key={j}
                             onClick={() => scrollToHeading(sub.text)}
                             className={`text-xs text-left py-1 px-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors truncate ${sub.level === 3 ? "pl-4 text-[11px]" : ""}`}
                           >
                              {sub.text}
                           </button>
                         ))}
                       </div>
                    )}'''

insert = '''                    {activeTopicId === topic.id && topic.subtopics && topic.subtopics.length > 0 && (
                       <div className="pl-6 flex flex-col space-y-1 mt-1 border-l-2 ml-4 border-muted/50">
                         {topic.subtopics.map((sub, s) => (
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

# Support both windows and linux line endings replacing trigger
target_clean = target.replace('\r\n', '\n')
content_clean = content.replace('\r\n', '\n')

if target_clean in content_clean:
    content_clean = content_clean.replace(target_clean, insert)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content_clean)
    print("Success")
else:
    print("Failed")
