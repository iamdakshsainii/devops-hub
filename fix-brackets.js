const fs = require('fs');
const file = 'c:\\my-stuff\\devops-hub\\src\\components\\step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find where <ResourceCard ... /> loop closes correctly downwards
let targetIndex = -1;
for (let i = 940; i < lines.length; i++) {
  if (lines[i].includes('tags: ""')) {
     targetIndex = i;
     break;
  }
}

if (targetIndex !== -1) {
  // Replace starting from that loop backwards upwards down sheet frames
  const header = lines.slice(0, targetIndex + 3).join('\n');
  const footer = `                    })}
                  </div>
                </div>
                {step.resources.length > 0 && (
                  <aside className="hidden lg:block w-52 shrink-0 border-l border-border/40 pl-5 space-y-4 sticky top-24 h-fit">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-[10px] tracking-wider uppercase">Materials</span>
                    </div>
                    <ul className="space-y-1.5">
                      {step.resources.map((resource) => (
                        <li key={resource.id}>
                          <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 p-1.5 hover:bg-primary/5 hover:text-primary rounded-lg border border-transparent hover:border-primary/10 transition-all group">
                            <span className="mt-0.5 shrink-0">{resourceIcon(resource.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium leading-normal line-clamp-2 break-words group-hover:underline prose-a:no-underline">{resource.title}</p>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
              </div>
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <Map className="h-16 w-16 text-muted-foreground/30 mb-6" />
              <h2 className="text-3xl font-bold mb-3">Select a Topic</h2>
              <Button onClick={() => setSidebarOpen(true)} className="md:hidden">Open Topics</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}`;
  
  fs.writeFileSync(file, header + '\n' + footer, 'utf8');
  console.log("Replaced successfully and closed all tags flawlessly");
} else {
  console.log("Target tags not found");
}
