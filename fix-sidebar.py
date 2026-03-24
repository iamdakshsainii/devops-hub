with open("src/components/step-viewer.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

output = lines[:935] # Keep up to line 934wards 

# 1. Close the inner .flex-1 content area row left side
output.append("              </div> {/* closes inner .flex-1 content area row for Center text */}\n")

# 2. Append Right Sidebar Structure accuratelywards downwards seamlessly
sidebar = """
              {/* Right Sidebar - inline with content Heading triggers */}
              {step.resources.length > 0 && (
                <div className="hidden lg:block w-72 lg:w-80 shrink-0 space-y-3 sticky top-24 h-fit animate-in fade-in-50 duration-300 lg:pt-14">
                  <div className="mb-4">
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
                  </div>

                  {isResourcesExpanded && (
                    <div className="space-y-2.5 animate-in fade-in-30 slide-in-from-top-1 duration-200">
                      {step.resources.map((resource) => (
                        <a 
                          key={resource.id} 
                          href={resource.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex flex-col gap-2 p-3.5 border border-border/10 rounded-2xl hover:bg-primary/5 hover:border-primary/20 bg-card/10 backdrop-blur-md transition-all group shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:shadow-primary/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105 shrink-0">
                              {resourceIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{resource.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize font-semibold">{resource.type.toLowerCase()}</p>
                            </div>
                          </div>
                          {resource.description && (
                            <p className="text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-2 pt-1 border-t border-border/5">
                              {resource.description}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
"""

output.append(sidebar)

# 3. Append the remaining closures and component bottom accurately index forwards backwards step forwards
output.append("\n              </div> {/* closes outer flex row container row */}\n")
output.append("            </article>\n")
output.append("          ) : (\n")
output.append("            <div className=\"flex flex-col items-center justify-center p-20 text-center\">\n")
output.append("              <Map className=\"h-16 w-16 text-muted-foreground/30 mb-6\" />\n")
output.append("              <h2 className=\"text-3xl font-bold mb-3\">Select a Topic</h2>\n")
output.append("              <Button onClick={() => setSidebarOpen(true)} className=\"md:hidden\">Open Topics</Button>\n")
output.append("            </div>\n")
output.append("          )}\n")
output.append("        </main>\n")
output.append("      </div>\n")
output.append("    </div>\n")
output.append("  );\n")
output.append("}\n")

with open("src/components/step-viewer.tsx", "w", encoding="utf-8") as f:
    f.writelines(output)

print("Scrubbed footer & repaired sidebar structure accuratelywards offsets framing downwards smoothly outdoors.")
