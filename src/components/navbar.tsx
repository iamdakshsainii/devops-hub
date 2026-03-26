"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Terminal, User as UserIcon, Settings, LogOut, UserCircle, Shield, Bookmark, Calendar, PlusCircle, FileText, Wrench, Map, Link as LinkIcon, Menu, X as CloseIcon, ArrowRight } from "lucide-react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const getLinkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
    return `relative py-1 transition-colors hover:text-foreground md:text-xs lg:text-sm tracking-tight ${isActive ? "text-primary font-bold after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full after:shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-foreground/70 font-medium"}`
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any>({ blogs: [], cheatsheets: [], modules: [], roadmaps: [], events: [], resources: [] })
  const [searching, setSearching] = useState(false)
  const reminderChecked = useRef(false)

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
      setSearchResults({ blogs: [], cheatsheets: [], modules: [], roadmaps: [], events: [], resources: [] });
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
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-2 md:mr-6 hover:opacity-80 transition-opacity shrink-0">
          <Terminal className="h-6 w-6 text-primary" />
          <span className="font-extrabold inline-block leading-none tracking-tighter text-[15px] md:text-lg">DevOps Network</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="flex-1 hidden md:flex items-center justify-between ml-8 mr-4 space-x-6">
          <nav className="flex items-center space-x-7 text-[15px] font-semibold">
            <Link href="/" className={getLinkClass("/")} title="Homepage">Home</Link>
            
            <Link href="/modules" className={getLinkClass("/modules")} title="Detailed Learning Modules">Learn</Link>

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
          <div className="flex-1 max-w-lg relative group/search">
            <Search className="absolute left-3 top-2.5 h-[18px] w-[18px] text-muted-foreground group-hover/search:text-primary transition-colors z-10" />
            <div onClick={() => setCmdkOpen(true)} title="Search across building blocks, modules, & roadmaps (Ctrl+K)" className="flex items-center justify-between w-full bg-muted/40 border border-border/40 rounded-xl h-10 pl-10 pr-3.5 text-[14px] font-medium text-muted-foreground cursor-pointer hover:bg-muted/60 hover:text-foreground hover:border-border transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <span className="flex items-center gap-1.5">
                Search everything...
              </span>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-black opacity-80 sm:flex shadow-sm">
                   <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          <Dialog open={cmdkOpen} onOpenChange={setCmdkOpen}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background/95 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[1.5rem] overflow-hidden ring-1 ring-foreground/5 dark:ring-white/5 outline-none focus:outline-none">
              <DialogTitle className="sr-only">Search Command Palette</DialogTitle>
              <div className="flex items-center border-b border-border/20 px-4 h-16 bg-background/50">
                <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                <input 
                   autoFocus
                   placeholder="What do you want to learn today?" 
                   className="flex-1 bg-transparent outline-none border-none text-[15px] md:text-[17px] font-medium placeholder:text-muted-foreground/50 w-full"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && <div className="h-4 w-4 animate-spin border-[3px] border-primary border-t-transparent flex-shrink-0 rounded-full ml-3" />}
                <div className="hidden sm:flex items-center ml-3 px-2 py-0.5 rounded-md bg-muted/50 border text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-widest">
                  ESC
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-3 space-y-4 pb-4">
                {searchQuery.length < 2 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                     <Search className="h-10 w-10 text-muted-foreground mb-4" />
                     <p className="text-sm text-muted-foreground font-medium w-3/4 mx-auto">Type at least 2 characters to instantly search across modules, roadmaps, blogs, cheatsheets, and events.</p>
                  </div>
                ) : (
                  <>
                    {/* Roadmaps */}
                    {searchResults.roadmaps?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-3 py-1.5 tracking-wider">Learning Paths</p>
                        {searchResults.roadmaps.map((r: any) => (
                          <Link key={r.id} href={`/roadmap`} onClick={() => setCmdkOpen(false)} className="group flex items-center p-2.5 hover:bg-emerald-500/10 outline-none rounded-xl transition-all cursor-pointer">
                             <div className="bg-emerald-500/10 p-2 rounded-lg mr-3 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                               <Map className="h-4 w-4 text-emerald-500 shadow-sm" />
                             </div>
                             <span className="text-[13.5px] font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{r.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Modules */}
                    {searchResults.modules?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-3 py-1.5 tracking-wider">Modules</p>
                        {searchResults.modules.map((m: any) => (
                          <Link key={m.id} href={`/modules/${m.id}`} onClick={() => setCmdkOpen(false)} className="group flex items-center p-2.5 hover:bg-purple-500/10 outline-none rounded-xl transition-all cursor-pointer">
                             <div className="bg-purple-500/10 p-2 rounded-lg mr-3 group-hover:bg-purple-500/20 transition-colors shrink-0">
                               <Terminal className="h-4 w-4 text-purple-500 shadow-sm" />
                             </div>
                             <span className="text-[13.5px] font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">{m.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Blogs */}
                    {searchResults.blogs?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-3 py-1.5 tracking-wider">Articles</p>
                        {searchResults.blogs.map((b: any) => (
                          <Link key={b.id} href={`/blog/${b.slug}`} onClick={() => setCmdkOpen(false)} className="group flex items-center p-2.5 hover:bg-blue-500/10 outline-none rounded-xl transition-all cursor-pointer">
                             <div className="bg-blue-500/10 p-2 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors shrink-0">
                               <FileText className="h-4 w-4 text-blue-500 shadow-sm" />
                             </div>
                             <span className="text-[13.5px] font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">{b.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Cheatsheets */}
                    {searchResults.cheatsheets?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-3 py-1.5 tracking-wider">Cheatsheets</p>
                        {searchResults.cheatsheets.map((b: any) => (
                          <Link key={b.id} href={`/cheatsheets/${b.slug}`} onClick={() => setCmdkOpen(false)} className="group flex items-center p-2.5 hover:bg-primary/10 outline-none rounded-xl transition-all cursor-pointer">
                             <div className="bg-primary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors shrink-0">
                               <Bookmark className="h-4 w-4 text-primary shadow-sm" />
                             </div>
                             <span className="text-[13.5px] font-semibold text-foreground group-hover:text-primary">{b.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Events */}
                    {searchResults.events?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-3 py-1.5 tracking-wider">Live Events</p>
                        {searchResults.events.map((e: any) => (
                          <Link key={e.id} href={`/events`} onClick={() => setCmdkOpen(false)} className="group flex items-center p-2.5 hover:bg-pink-500/10 outline-none rounded-xl transition-all cursor-pointer">
                             <div className="bg-pink-500/10 p-2 rounded-lg mr-3 group-hover:bg-pink-500/20 transition-colors shrink-0">
                               <Calendar className="h-4 w-4 text-pink-500 shadow-sm" />
                             </div>
                             <span className="text-[13.5px] font-semibold text-foreground group-hover:text-pink-600 dark:group-hover:text-pink-400">{e.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Resources */}
                    {searchResults.resources?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase px-3 py-1.5 tracking-wider">Shared Links</p>
                        {searchResults.resources.map((r: any) => (
                          <Link key={r.id} href={`/resources?id=${r.id}`} onClick={() => setCmdkOpen(false)} className="group flex items-center p-2.5 hover:bg-amber-500/10 outline-none rounded-xl transition-all cursor-pointer">
                             <div className="bg-amber-500/10 p-2 rounded-lg mr-3 group-hover:bg-amber-500/20 transition-colors shrink-0">
                               <LinkIcon className="h-4 w-4 text-amber-500 shadow-sm" />
                             </div>
                             <span className="text-[13.5px] font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">{r.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* No Matches */}
                    {Object.values(searchResults).every((arr: any) => !arr || arr.length === 0) && !searching && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                         <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
                         <p className="text-[15px] text-foreground font-semibold tracking-tight">No results found for "{searchQuery}"</p>
                         <p className="text-[13px] text-muted-foreground mt-1">Check spelling or try more general keywords.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2 md:space-x-2.5 ml-auto">
          {/* Responsive Search Switcher */}
          <button 
            onClick={() => setCmdkOpen(true)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40 hover:bg-muted/60 transition-all text-foreground/80"
            title="Global Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Mini-Admin Shield - Exposed Handle for Quick Moderation */}
          {["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role) && (
            <Link href="/admin" className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 transition-all hover:bg-amber-500/15" title="Moderation Panel">
               <Shield className="h-4 w-4" />
            </Link>
          )}

          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded ml-2" />
          ) : session ? (
            <div className="flex items-center space-x-2 pl-2 border-l ml-2">
              {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ? (
                <Link href="/admin" title="Log into Management Dashboard">
                  <Button variant="ghost" size="sm" className="hidden xs:inline-flex hover:bg-amber-500/10 hover:text-amber-500 border border-transparent hover:border-amber-500/20 text-xs font-bold transition-all px-2 md:px-3 h-8 md:h-9">
                    <Shield className="h-3.5 w-3.5 md:hidden" />
                    <span className="hidden md:inline">Admin Panel</span>
                    <span className="md:hidden ml-1">Admin</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard" title="Learner Dashboard">
                  <Button variant="ghost" size="sm" className="hidden xs:inline-flex text-xs font-bold h-8 md:h-9">Dashboard</Button>
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
                  <Button variant="ghost" title="Your Account & Profile" size="icon" className="rounded-full overflow-hidden h-8 w-8 hover:scale-110 hover:ring-2 hover:ring-primary/30 transition-all duration-300">
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
            </div>
          )}

          {/* Mobile Hamburger Trigger - Relocated to Right Hub */}
          <button 
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors border border-primary/20 ml-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDE-OUT MENU - RIGHT FOCAL PLANE ── */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="fixed right-0 top-0 h-screen w-[280px] p-0 border-l border-border/40 bg-background/95 backdrop-blur-3xl shadow-2xl overflow-hidden ring-1 ring-white/5 outline-none focus:outline-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300 translate-x-0 translate-y-0 sm:translate-x-0 sm:translate-y-0 sm:right-0 sm:top-0">
           <DialogTitle className="sr-only">Mobile Navigation Menu</DialogTitle>
           <div className="flex flex-col h-full w-full">
             <div className="p-5 border-b border-border/10 flex items-center justify-between bg-muted/20">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                  <Terminal className="h-5 w-5 text-primary" />
                  <span className="font-black text-sm tracking-tighter leading-none text-foreground">DevOps Network</span>
                </Link>
             </div>

             <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                {/* Achievement Highlight in Menu */}
                <div className="mb-4 px-1">
                   <Link href="/blog?pinned=true" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 shadow-[0_2px_10px_rgba(245,158,11,0.1)] transition-all active:scale-[0.98]">
                      <Bookmark className="h-4 w-4" />
                      <div className="flex flex-col leading-tight">
                         <span className="text-[11px] font-black uppercase tracking-wider">Perspectives</span>
                         <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest mt-0.5">Industry Blueprint</span>
                      </div>
                   </Link>
                </div>

                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 px-4 py-2">Mission Control</p>
                
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${pathname === "/" ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20" : "text-foreground/70 font-semibold hover:bg-muted/50 hover:text-foreground"}`}>
                   <UserIcon className="h-4 w-4" /> <span className="text-[14px]">Home</span>
                </Link>
                <Link href="/modules" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${pathname.startsWith("/modules") ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20" : "text-foreground/70 font-semibold hover:bg-muted/50 hover:text-foreground"}`}>
                   <Terminal className="h-4 w-4" /> <span className="text-[14px]">Learn</span>
                </Link>
                <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${pathname.startsWith("/roadmap") ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20" : "text-foreground/70 font-semibold hover:bg-muted/50 hover:text-foreground"}`}>
                   <Map className="h-4 w-4" /> <span className="text-[14px]">Roadmap</span>
                </Link>
                <Link href="/cheatsheets" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${pathname.startsWith("/cheatsheets") ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20" : "text-foreground/70 font-semibold hover:bg-muted/50 hover:text-foreground"}`}>
                   <Bookmark className="h-4 w-4" /> <span className="text-[14px]">Cheatsheet</span>
                </Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${pathname.startsWith("/blog") ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20" : "text-foreground/70 font-semibold hover:bg-muted/50 hover:text-foreground"}`}>
                   <FileText className="h-4 w-4" /> <span className="text-[14px]">Blog</span>
                </Link>

                {["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role) && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all bg-amber-500/5 text-amber-600 font-bold border border-amber-500/10 hover:bg-amber-500/10 mt-2">
                     <Shield className="h-4 w-4" /> <span className="text-[13px]">Admin Dashboard</span>
                  </Link>
                )}
             </nav>

             <div className="p-5 border-t border-border/10 bg-muted/20 mt-auto">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">Community Hub</p>
                <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between w-full p-4 rounded-xl bg-background border border-border/40 text-xs font-bold hover:border-primary/40 transition-all text-foreground shadow-sm">
                   <span>Webinars & Workshops</span>
                   <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </Link>
             </div>
           </div>
        </DialogContent>
      </Dialog>
    </nav>
  )
}
