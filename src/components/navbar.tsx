"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Search, Terminal, LogOut, UserCircle, Shield, Bookmark,
  Calendar, PlusCircle, FileText, Map, Link as LinkIcon,
  Menu, X as CloseIcon, ArrowRight, ChevronDown, Sparkles
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { NotificationsDropdown } from "./notifications-dropdown"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any>({
    blogs: [], cheatsheets: [], modules: [], roadmaps: [], events: [], resources: []
  })
  const [searching, setSearching] = useState(false)
  const reminderChecked = useRef(false)
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role ?? "")

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmdkOpen(o => !o) }
      if (e.key === "Escape") { setCmdkOpen(false); setMobileMenuOpen(false) }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ blogs: [], cheatsheets: [], modules: [], roadmaps: [], events: [], resources: [] })
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) setSearchResults(await res.json())
      } catch { }
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !reminderChecked.current) {
      reminderChecked.current = true
      fetch("/api/auth/check-reminders", { method: "POST" }).catch(() => { })
    }
  }, [status, session?.user?.id])

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name?: string | null) => {
    if (!name) return "bg-primary"
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-indigo-500", "bg-amber-500", "bg-pink-500"]
    let sum = 0
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
    return colors[sum % colors.length]
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/modules", label: "Learn" },
    { href: "/cheatsheets", label: "Cheatsheet" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/events", label: "Events" },
    { href: "/blog", label: "Blog" },
  ]

  const hasResults = Object.values(searchResults).some((arr: any) => arr?.length > 0)

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-background/90 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
          : "bg-transparent"
        }
        ${isAdmin ? "border-b border-amber-500/10" : ""}
      `}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-[1440px]">
          <div className="flex h-[68px] lg:h-[76px] items-center">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center space-x-2 group mr-2">
              <Terminal className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-black tracking-tighter text-[16px] md:text-lg leading-none hidden sm:block whitespace-nowrap">
                DevOps <span className="text-primary">Network</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    relative px-3.5 py-1.5 rounded-lg text-[13.5px] font-semibold transition-all duration-200
                    ${isActive(href)
                      ? "text-foreground bg-foreground/[0.06]"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
                    }
                  `}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </Link>
              ))}

              {/* Resources Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`
                  flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-[13.5px] font-semibold transition-all duration-200 outline-none
                  ${isActive("/resources")
                    ? "text-foreground bg-foreground/[0.06]"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
                  }
                `}>
                  Resources <ChevronDown className="h-3 w-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 rounded-xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-xl mt-1">
                  {[
                    { href: "/resources", label: "All Resources", color: "text-foreground" },
                    { href: "/resources?type=ARTICLE", label: "Articles", color: "text-blue-500" },
                    { href: "/resources?type=VIDEO", label: "Videos", color: "text-red-500" },
                    { href: "/resources?type=NOTES", label: "Notes", color: "text-green-500" },
                  ].map(({ href, label, color }) => (
                    <DropdownMenuItem key={href} asChild>
                      <Link href={href} className={`text-xs font-semibold cursor-pointer ${color}`}>{label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ── Spacer — Pushes Search/Actions to the right ── */}
            <div className="flex-1" />

            {/* ── Search Bar — Desktop ── */}
            <div className="hidden md:block mr-3 lg:mr-6">
              <button
                onClick={() => setCmdkOpen(true)}
                className="flex items-center gap-3 h-10 pl-4 pr-3 rounded-xl bg-foreground/[0.05] hover:bg-foreground/[0.08] border border-border/40 hover:border-border/60 transition-all duration-200 group flex-1 max-w-[320px] lg:max-w-[480px] xl:max-w-[600px]"
                title="Search (Ctrl+K)"
              >
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                <span className="text-[13.5px] text-muted-foreground flex-1 text-left font-medium">Search...</span>
                <div className="flex items-center gap-1 shrink-0">
                  <kbd className="h-5 px-1.5 rounded-md bg-background/60 border border-border/60 text-[9px] font-black text-muted-foreground/70 font-mono">⌘K</kbd>
                </div>
              </button>
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Mobile search */}
              <button
                onClick={() => setCmdkOpen(true)}
                className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-foreground/[0.06] transition-colors text-foreground/70 hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </button>

              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {status === "loading" ? (
                <div className="h-8 w-16 animate-pulse bg-foreground/10 rounded-lg" />
              ) : session ? (
                <>
                  {/* Admin quick badge */}
                  {isAdmin && (
                    <Link href="/admin" className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20 hover:bg-amber-500/15 transition-all">
                      <Shield className="h-3 w-3" />
                      <span className="hidden lg:inline">Admin</span>
                    </Link>
                  )}

                  {/* Dashboard / Admin link - hidden on very small */}
                  {!isAdmin && (
                    <Link href="/dashboard" className="hidden sm:block">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-bold px-3">Dashboard</Button>
                    </Link>
                  )}

                  {/* Quick Create (admin) */}
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-foreground/[0.06] transition-colors border border-dashed border-border/50 hover:border-primary/40 text-muted-foreground hover:text-primary">
                          <PlusCircle className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-black">Create</DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href="/admin/blog" className="text-xs font-semibold cursor-pointer gap-2"><FileText className="h-3.5 w-3.5 text-blue-500" />New Blog</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin/cheatsheets" className="text-xs font-semibold cursor-pointer gap-2"><Bookmark className="h-3.5 w-3.5 text-green-500" />Cheatsheet</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin/modules/new" className="text-xs font-semibold cursor-pointer gap-2"><Terminal className="h-3.5 w-3.5 text-purple-500" />New Module</Link></DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <NotificationsDropdown />

                  {/* Avatar dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200 shrink-0">
                        {session.user.image ? (
                          <img src={session.user.image} alt="User" className="h-full w-full object-cover" />
                        ) : (
                          <div className={`h-full w-full flex items-center justify-center text-[11px] font-black text-white ${getAvatarColor(session.user.name)}`}>
                            {getInitials(session.user.name)}
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
                      <div className="px-3 py-2.5 border-b border-border/10">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-bold leading-none">{session.user.name}</p>
                          {isAdmin && <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Admin</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{session.user.email}</p>
                      </div>
                      <div className="py-1">
                        <DropdownMenuItem asChild><Link href="/dashboard" className="text-xs font-semibold cursor-pointer">Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/profile" className="text-xs font-semibold cursor-pointer gap-2"><UserCircle className="h-3.5 w-3.5" />Edit Profile</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/bookmarks" className="text-xs font-semibold cursor-pointer gap-2"><Bookmark className="h-3.5 w-3.5 text-primary" />Saves / Remind</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/events/dashboard" className="text-xs font-semibold cursor-pointer gap-2"><Calendar className="h-3.5 w-3.5 text-amber-500" />Manage Events</Link></DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href="/admin" className="text-xs font-semibold cursor-pointer gap-2"><Shield className="h-3.5 w-3.5 text-amber-500" />Moderation Panel</Link></DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} className="text-xs font-bold cursor-pointer text-destructive focus:text-destructive gap-2">
                          <LogOut className="h-3.5 w-3.5" />Sign out
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold px-3 hidden sm:inline-flex">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="h-8 text-xs font-bold px-4 rounded-lg">Join Free</Button>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg bg-foreground/[0.05] hover:bg-foreground/[0.08] border border-border/40 transition-all ml-1"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Spacer so content doesn't hide under fixed nav ── */}
      <div className="h-[68px] lg:h-[76px]" />

      {/* ── CMDK / Search Dialog ── */}
      <Dialog open={cmdkOpen} onOpenChange={(o) => { setCmdkOpen(o); if (!o) setSearchQuery("") }}>
        <DialogContent className="sm:max-w-[580px] p-0 gap-0 rounded-2xl border-border/30 bg-background/98 backdrop-blur-3xl shadow-2xl overflow-hidden outline-none focus:outline-none">
          <DialogTitle className="sr-only">Search</DialogTitle>

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border/10">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              placeholder="Search modules, blogs, roadmaps..."
              className="flex-1 bg-transparent outline-none text-[15px] font-medium placeholder:text-muted-foreground/40"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searching
              ? <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              : <kbd className="h-5 px-1.5 rounded border border-border/60 bg-muted/40 text-[9px] font-black font-mono text-muted-foreground/60">ESC</kbd>
            }
          </div>

          {/* Results */}
          <div className="max-h-[440px] overflow-y-auto p-2">
            {searchQuery.length < 2 ? (
              <div className="flex flex-col items-center py-12 text-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-foreground/[0.04] flex items-center justify-center">
                  <Search className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Type to search across all content</p>
              </div>
            ) : !hasResults && !searching ? (
              <div className="flex flex-col items-center py-12 text-center gap-2">
                <p className="text-sm font-semibold">No results for "{searchQuery}"</p>
                <p className="text-xs text-muted-foreground">Try different keywords</p>
              </div>
            ) : (
              <div className="space-y-3 py-1">
                {[
                  { key: "roadmaps", label: "Learning Paths", icon: Map, color: "text-emerald-500", bg: "bg-emerald-500/10 group-hover:bg-emerald-500/20", href: (r: any) => "/roadmap" },
                  { key: "modules", label: "Modules", icon: Terminal, color: "text-purple-500", bg: "bg-purple-500/10 group-hover:bg-purple-500/20", href: (r: any) => `/modules/${r.id}` },
                  { key: "blogs", label: "Articles", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10 group-hover:bg-blue-500/20", href: (r: any) => `/blog/${r.slug}` },
                  { key: "cheatsheets", label: "Cheatsheets", icon: Bookmark, color: "text-primary", bg: "bg-primary/10 group-hover:bg-primary/20", href: (r: any) => `/cheatsheets/${r.slug}` },
                  { key: "events", label: "Events", icon: Calendar, color: "text-pink-500", bg: "bg-pink-500/10 group-hover:bg-pink-500/20", href: () => "/events" },
                  { key: "resources", label: "Resources", icon: LinkIcon, color: "text-amber-500", bg: "bg-amber-500/10 group-hover:bg-amber-500/20", href: (r: any) => `/resources?id=${r.id}` },
                ].map(({ key, label, icon: Icon, color, bg, href }) =>
                  searchResults[key]?.length > 0 && (
                    <div key={key}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-3 pb-1">{label}</p>
                      {searchResults[key].map((item: any) => (
                        <Link key={item.id} href={href(item)} onClick={() => { setCmdkOpen(false); setSearchQuery("") }}
                          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-all cursor-pointer"
                        >
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${color}`} />
                          </div>
                          <span className="text-[13.5px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{item.title}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MOBILE SLIDE-OUT ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-background/98 backdrop-blur-3xl border-l border-border/30 flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-[68px] border-b border-border/10 shrink-0">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <span className="font-black text-lg tracking-tight">DevOps<span className="text-primary">Network</span></span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-3 pb-2 pt-1">Navigation</p>

              {[
                { href: "/", label: "Home", icon: Terminal },
                { href: "/modules", label: "Learn", icon: Terminal },
                { href: "/roadmap", label: "Roadmap", icon: Map },
                { href: "/cheatsheets", label: "Cheatsheet", icon: Bookmark },
                { href: "/resources", label: "Resources", icon: LinkIcon },
                { href: "/events", label: "Events", icon: Calendar },
                { href: "/blog", label: "Blog", icon: FileText },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-[14px] font-semibold
                    ${isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive(href) && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              ))}

              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-amber-500/8 text-amber-600 font-bold border border-amber-500/15 mt-3 text-[14px]">
                  <Shield className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
            </nav>

            {/* Footer actions */}
            <div className="p-4 border-t border-border/10 space-y-2 shrink-0">
              {!session ? (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-10 font-bold rounded-xl">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full h-10 font-bold rounded-xl">Join Free</Button>
                  </Link>
                </div>
              ) : (
                <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-border/40 text-sm font-bold text-destructive hover:bg-destructive/5 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[10px] text-muted-foreground/50 font-medium">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}