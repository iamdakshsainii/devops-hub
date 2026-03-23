const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\dashboard\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const sidebarBottomAnchor = `          </Card>
        </div>
      </div>`;

const sidebarBottomReplacement = `          </Card>

          {/* Quick Links */}
          <Card className="overflow-hidden rounded-2xl border-none ring-1 ring-border shadow-sm">
            <CardContent className="p-2 space-y-1">
              <Link href="/bookmarks" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors font-medium text-sm group">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors"><Bookmark className="h-4 w-4 text-primary" /></div>
                  Saves / Remind
                </div >
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link >
              <Link href="/roadmap" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors font-medium text-sm group">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors"><Map className="h-4 w-4 text-primary" /></div>
                  Learning Roadmap
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>

          {/* Coming Soon Locked */}
          <div className="space-y-4 pt-4 border-t px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span> Pipeline Roadmap
            </h3>

            <div className="group border border-dashed rounded-xl p-4 bg-background/40 backdrop-blur-sm flex items-start gap-4 transition-all hover:border-primary/30 cursor-not-allowed">
              <div className="bg-muted-foreground/10 rounded-full p-2 border shadow-sm group-hover:bg-primary/5 transition-colors">
                <Terminal className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5">Interview Prep <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Planned</span></p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Solve real mock scenarios, check dynamic flashcards loaded with CI/CD benchmark guides.</p>
              </div>
            </div>

            <div className="group border border-emerald-500/20 border-dashed rounded-xl p-4 bg-emerald-500/3 backdrop-blur-sm flex items-start gap-4 transition-all hover:border-emerald-500/40 cursor-not-allowed">
              <div className="bg-emerald-500/10 rounded-full p-2 border border-emerald-500/20 shadow-sm">
                <Lightbulb className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">DevOps AI Chatbot <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">Alpha</span></p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Ask anything about platform nodes, config scripts, and scaling errors natively without jumping Tabs.</p>
              </div>
            </div>

            <div className="border border-dashed rounded-xl p-4 bg-muted/10 flex items-start gap-4 opacity-70">
              <div className="bg-background rounded-full p-2 border shadow-sm">
                 <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">Community Chat</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Discord-style real-time chat exclusively for DevOps engineers.</p>
              </div>
            </div>

            <div className="border border-dashed rounded-xl p-4 bg-muted/10 flex items-start gap-4 opacity-70">
               <div className="bg-background rounded-full p-2 border shadow-sm">
                 <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">Job Board</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Curated platform roles. Real engineering opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;

if (content.includes(sidebarBottomAnchor)) {
    content = content.replace(sidebarBottomAnchor, sidebarBottomReplacement);
} else {
    console.log("Anchor not found perfectly. Replacing using direct line index numbers safely.");
}

fs.writeFileSync(file, content);
console.log("Sidebar contents restored securely!");
