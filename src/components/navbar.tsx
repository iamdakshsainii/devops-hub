"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Terminal, User as UserIcon, Settings, LogOut, UserCircle, Shield, Bookmark, Calendar, PlusCircle, FileText, Wrench, Map, Link as LinkIcon } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { NotificationsDropdown } from "./notifications-dropdown"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const getLinkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
    return `relative py-1 transition-colors hover:text-foreground md:text-xs lg:text-sm tracking-tight ${isActive ? "text-primary font-bold after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full after:shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-foreground/70 font-medium"}`
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any>({ blogs: [], cheatsheets: [], modules: [], tools: [], roadmaps: [], events: [], resources: [] })
  const [searching, setSearching] = useState(false)
  const reminderChecked = useRef(false)

  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrases = [
      "Search anything in 1-click...",
      "Search Blogs & Guides...",
      "Search across platform nodes..."
    ];
    const currentPhrase = phrases[phraseIndex];

    const type = () => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        setAnimatedPlaceholder(currentPhrase.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setAnimatedPlaceholder(currentPhrase.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else if (charIndex === currentPhrase.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (charIndex === 0 && isDeleting) {
        setIsDeleting(false);
        setPhraseIndex(prev => (prev + 1) % phrases.length);
      }
    };

    const speed = isDeleting ? 30 : 60;
    const timer = setTimeout(type, speed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdkOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ blogs: [], cheatsheets: [], modules: [], tools: [], roadmaps: [], events: [], resources: [] });
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) setSearchResults(await res.json());
      } catch (e) { }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name?: string | null) => {
    if (!name) return "bg-primary";
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-indigo-500", "bg-amber-500", "bg-pink-500"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  // Fire reminder check once after the user's session loads — silent, no UI
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !reminderChecked.current) {
      reminderChecked.current = true
      fetch("/api/auth/check-reminders", { method: "POST" }).catch(() => { })
    }
  }, [status, session?.user?.id])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className={`border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all ${session?.user?.role && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ? "border-amber-500/20 shadow-[0_4px_12px_-6px_rgba(245,158,11,0.08)]" : "border-border/40"}`}>
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-6 hover:opacity-80 transition-opacity">
          <Terminal className="h-6 w-6 text-primary" />
          <span className="font-bold inline-block leading-none tracking-tight">DevOps Network</span>
        </Link>

        <div className="flex-1 hidden md:flex items-center justify-between mr-4 space-x-8">
          <nav className="flex items-center space-x-5 text-sm font-medium">
            <Link href="/" className={getLinkClass("/")} title="Homepage">Home</Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className={getLinkClass("/modules") + " flex items-center gap-1 cursor-pointer outline-none"} title="Modules & Tools">
                Learn <PlusCircle className="h-3 w-3 opacity-60 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 bg-background/95 backdrop-blur-md rounded-xl border border-border/40 shadow-lg">
                <DropdownMenuItem asChild>
                  <Link href="/modules" className="flex items-center gap-2 cursor-pointer w-full text-xs font-semibold" title="Detailed Learning modules">
                     <FileText className="h-3.5 w-3.5 text-primary" /> Detailed Modules
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tools" className="flex items-center gap-2 cursor-pointer w-full text-xs font-semibold" title="Examine Trending Tools">
                     <Terminal className="h-3.5 w-3.5 text-amber-500" /> Trending Tools
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/cheatsheets" className={getLinkClass("/cheatsheets")} title="Quick Commands Lookup">Cheatsheet</Link>
            <Link href="/roadmap" className={getLinkClass("/roadmap")} title="Visual Learning Path">Roadmap</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className={getLinkClass("/resources") + " flex items-center gap-1 cursor-pointer outline-none"} title="Shared Links & PDFs">
                Resources <PlusCircle className="h-3 w-3 opacity-60 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 bg-background/95 backdrop-blur-md rounded-xl border border-border/40 shadow-lg">
                <DropdownMenuItem asChild>
                  <Link href="/resources" className="flex items-center gap-2 cursor-pointer w-full text-xs font-semibold" title="All curated items">
                     <FileText className="h-3.5 w-3.5 text-primary" /> All Resources
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources?type=ARTICLE" className="flex items-center gap-2 cursor-pointer w-full text-xs font-semibold" title="Read articles and guides">
                     <FileText className="h-3.5 w-3.5 text-blue-500" /> Articles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources?type=VIDEO" className="flex items-center gap-2 cursor-pointer w-full text-xs font-semibold" title="Watch workshops or videos">
                     <PlusCircle className="h-3.5 w-3.5 text-red-500" /> Videos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources?type=NOTES" className="flex items-center gap-2 cursor-pointer w-full text-xs font-semibold" title="Shared engineering notes">
                     <PlusCircle className="h-3.5 w-3.5 text-green-500" /> Notes
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/events" className={getLinkClass("/events")} title="Webinars and Workshops">Events</Link>
            <Link href="/blog" className={getLinkClass("/blog")} title="Clear your doubts and solve issues faced by every DevOps engineer">Blog</Link>
          </nav>
          <div className="w-full max-w-sm relative group/search">
            {/* Pop Glow Alert */}
            <div className="absolute -top-6 left-2 scale-90 opacity-0 group-hover/search:opacity-100 group-hover/search:scale-100 transition-all duration-300 origin-bottom-left bg-gradient-to-r from-primary to-blue-500 text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-lg z-20 flex items-center gap-1 uppercase tracking-wider">
               <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span> Instant Search
            </div>

            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <div onClick={() => setCmdkOpen(true)} className="flex items-center justify-between w-full bg-muted/40 border border-border/40 rounded-md h-9 pl-9 pr-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/60 transition-colors">
              <span className="flex items-center gap-0.5">
                {animatedPlaceholder}
                <span className="h-3 w-[2px] bg-primary animate-pulse" />
              </span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <Dialog open={cmdkOpen} onOpenChange={setCmdkOpen}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-xl">
              <DialogTitle className="sr-only">Search Command Palette</DialogTitle>
              <div className="flex items-center border-b px-3 h-12">
                <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <input 
                   placeholder="Type to search everything..." 
                   className="flex-1 bg-transparent outline-none border-none text-sm placeholder:text-muted-foreground/60 w-full"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />}
              </div>
              <div className="max-h-[350px] overflow-y-auto p-2 space-y-3">
                {searchQuery.length < 2 ? (
                  <p className="p-4 text-center text-xs text-muted-foreground">Type at least 2 characters to search across blogs, modules, & tools.</p>
                ) : (
                  <>
                    {/* Roadmaps */}
                    {searchResults.roadmaps?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1">Roadmaps</p>
                        {searchResults.roadmaps.map((r: any) => (
                          <Link key={r.id} href={`/roadmap`} onClick={() => setCmdkOpen(false)} className="flex items-center text-xs font-semibold p-2 hover:bg-muted/80 rounded-md transition-colors"><Map className="h-3.5 w-3.5 mr-2 text-emerald-500" /> {r.title}</Link>
                        ))}
                      </div>
                    )}
                    {/* Modules */}
                    {searchResults.modules?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1">Modules</p>
                        {searchResults.modules.map((m: any) => (
                          <Link key={m.id} href={`/modules/${m.id}`} onClick={() => setCmdkOpen(false)} className="flex items-center text-xs font-semibold p-2 hover:bg-muted/80 rounded-md transition-colors"><Terminal className="h-3.5 w-3.5 mr-2 text-purple-500" /> {m.title}</Link>
                        ))}
                      </div>
                    )}
                    {/* Blogs */}
                    {searchResults.blogs?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1">Blogs</p>
                        {searchResults.blogs.map((b: any) => (
                          <Link key={b.id} href={`/blog/${b.slug}`} onClick={() => setCmdkOpen(false)} className="flex items-center text-xs font-semibold p-2 hover:bg-muted/80 rounded-md transition-colors"><FileText className="h-3.5 w-3.5 mr-2 text-blue-500" /> {b.title}</Link>
                        ))}
                      </div>
                    )}
                    {/* Cheatsheets */}
                    {searchResults.cheatsheets?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1">Cheatsheets</p>
                        {searchResults.cheatsheets.map((b: any) => (
                          <Link key={b.id} href={`/cheatsheets/${b.slug}`} onClick={() => setCmdkOpen(false)} className="flex items-center text-xs font-semibold p-2 hover:bg-muted/80 rounded-md transition-colors"><FileText className="h-3.5 w-3.5 mr-2 text-green-500" /> {b.title}</Link>
                        ))}
                      </div>
                    )}
                    {/* Tools */}
                    {searchResults.tools?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1">Tools</p>
                        {searchResults.tools.map((t: any) => (
                          <Link key={t.id} href={`/tools`} onClick={() => setCmdkOpen(false)} className="flex items-center text-xs font-semibold p-2 hover:bg-muted/80 rounded-md transition-colors"><Wrench className="h-3.5 w-3.5 mr-2 text-orange-500" /> {t.name}</Link>
                        ))}
                      </div>
                    )}
                    {/* Events */}
                    {searchResults.events?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1">Events</p>
                        {searchResults.events.map((e: any) => (
                          <Link key={e.id} href={`/events`} onClick={() => setCmdkOpen(false)} className="flex items-center text-xs font-semibold p-2 hover:bg-muted/80 rounded-md transition-colors"><Calendar className="h-3.5 w-3.5 mr-2 text-pink-500" /> {e.title}</Link>
                        ))}
                      </div>
                    )}
                    {/* Resources */}
                    {searchResults.resources?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 mb-1">Resources</p>
                        {searchResults.resources.map((r: any) => (
                          <Link key={r.id} href={`/resources?id=${r.id}`} onClick={() => setCmdkOpen(false)} className="flex items-center text-xs font-semibold p-2 hover:bg-muted/80 rounded-md transition-colors"><LinkIcon className="h-3.5 w-3.5 mr-2 text-indigo-500" /> {r.title}</Link>
                        ))}
                      </div>
                    )}
                    {Object.values(searchResults).every((arr: any) => !arr || arr.length === 0) && !searching && (
                      <p className="p-4 text-center text-xs text-muted-foreground">No matches found for "{searchQuery}"</p>
                    )}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <ThemeToggle />

          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded ml-2" />
          ) : session ? (
            <div className="flex items-center space-x-2 pl-2 border-l ml-2">
              {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ? (
                <Link href="/admin" title="Admin Control Panel">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Admin Panel</Button>
                </Link>
              ) : (
                <Link href="/dashboard" title="View your dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Dashboard</Button>
                </Link>
              )}
               {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 group transition-all">
                       <PlusCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-44 bg-background/90 backdrop-blur-xl rounded-xl border border-border/30 shadow-xl [&>div]:cursor-pointer">
                     <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/80 uppercase pb-1.5 border-b border-border/20 mb-1">Quick Actions</DropdownMenuLabel>
                     <DropdownMenuItem asChild><Link href="/admin/blog" className="flex items-center gap-2 text-xs font-semibold"><FileText className="h-3.5 w-3.5 text-blue-500" /> New Blog</Link></DropdownMenuItem>
                     <DropdownMenuItem asChild><Link href="/admin/cheatsheets" className="flex items-center gap-2 text-xs font-semibold"><FileText className="h-3.5 w-3.5 text-green-500" /> Cheatsheet</Link></DropdownMenuItem>
                     <DropdownMenuItem asChild><Link href="/admin/modules/new" className="flex items-center gap-2 text-xs font-semibold"><Terminal className="h-3.5 w-3.5 text-purple-500" /> New Module</Link></DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               )}
              <NotificationsDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden h-8 w-8 hover:opacity-90">
                    {session.user.image ? (
                      <img src={session.user.image} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <div className={`h-full w-full flex items-center justify-center text-xs font-bold text-white uppercase ${getAvatarColor(session.user.name)}`}>
                        {getInitials(session.user.name)}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-background/95 backdrop-blur-xl rounded-xl border border-border/40 shadow-xl [&>div]:cursor-pointer">
                  <DropdownMenuLabel className="font-normal border-b border-border/10 mb-1 pb-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold leading-none">{session.user.name}</p>
                        {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                          <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">Admin</span>
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>

                  {/* ACCOUNT GROUP */}
                  <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 py-1 mt-1">Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center w-full text-xs font-semibold">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center w-full text-xs font-semibold">
                      <UserCircle className="mr-2 h-3.5 w-3.5" /> Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-border/10" />

                  {/* ADMIN GROUP */}
                  {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                    <>
                      <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 py-1">Moderation</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex items-center w-full text-xs font-semibold">
                          <Shield className="mr-2 h-3.5 w-3.5 text-amber-500" /> Moderation Panel
                        </Link>
                      </DropdownMenuItem>
                      {session.user.role === "SUPER_ADMIN" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/roles" className="cursor-pointer flex items-center w-full text-xs font-bold text-amber-500">
                            <Shield className="mr-2 h-3.5 w-3.5 text-amber-500" /> Role Manager
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="border-border/10" />
                    </>
                  )}

                  {/* ACTIONS GROUP */}
                  <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase px-2 py-1">Workspace</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" className="cursor-pointer flex items-center w-full text-xs font-semibold">
                      <Bookmark className="mr-2 h-3.5 w-3.5 text-primary" /> Saves / Remind
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/events/dashboard" className="cursor-pointer flex items-center w-full text-xs font-semibold">
                      <Calendar className="mr-2 h-3.5 w-3.5 text-amber-500" /> Manage Events
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="border-border/10" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:text-destructive text-sm font-bold flex items-center mt-1"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2 border-l ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
