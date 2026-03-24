with open("src/components/step-viewer.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Target sidebar node header wrapper
target_button = """                  <button 
                    onClick={() => setIsResourcesExpanded(!isResourcesExpanded)}
                    className="flex w-full items-center justify-between text-sm font-black uppercase tracking-wider text-muted-foreground/80 mb-3 px-2 hover:text-foreground transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Recommended
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${isResourcesExpanded ? "rotate-0" : "-rotate-90"}`} />
                  </button>"""

replacement_button = """                  <div className="mb-4">
                    <button 
                      onClick={() => setIsResourcesExpanded(!isResourcesExpanded)}
                      className="flex w-full items-center justify-between text-sm font-black uppercase tracking-wider text-muted-foreground/80 px-2 hover:text-foreground transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Recommended
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${isResourcesExpanded ? "rotate-0" : "-rotate-90"}`} />
                    </button>
                    <p className="text-[11px] text-muted-foreground/60 mt-1 px-2 font-medium tracking-wide">Handpicked videos, docs & articles.</p>
                  </div>"""

if target_button in content:
    content = content.replace(target_button, replacement_button)
    print("Injected sidebar subtitle successfully inwards boundswards offsets.")
else:
    print("Target button header string not matches. Trying simple trim.")

with open("src/components/step-viewer.tsx", "w", encoding="utf-8") as f:
    f.write(content)
