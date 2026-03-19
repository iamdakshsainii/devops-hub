"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Terminal, User as UserIcon, Settings, LogOut, UserCircle, Shield } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { NotificationsDropdown } from "./notifications-dropdown"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center flex-wrap px-4 sm:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-6 hover:opacity-80 transition-opacity">
          <Terminal className="h-6 w-6 text-primary" />
          <span className="font-bold inline-block leading-none tracking-tight">
            DevOps Hub
          </span>
        </Link>
        
        <div className="flex-1 hidden md:flex items-center justify-between mr-4 space-x-6">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/modules" className="transition-colors hover:text-foreground/80 text-foreground/60">Modules</Link>
            <Link href="/roadmap" className="transition-colors hover:text-foreground/80 text-foreground/60">Roadmap</Link>
            <Link href="/resources" className="transition-colors hover:text-foreground/80 text-foreground/60">Resources</Link>
            <Link href="/events" className="transition-colors hover:text-foreground/80 text-foreground/60">Events</Link>
          </nav>
          <div className="w-full max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Notes, Resources, Events..." 
              className="pl-9 bg-muted/40 h-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <ThemeToggle />
          
          {status === "loading" ? (
             <div className="h-9 w-20 animate-pulse bg-muted rounded ml-2"></div>
          ) : session ? (
             <div className="flex items-center space-x-2 pl-2 border-l ml-2">
                {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Admin</Button>
                  </Link>
                )}
               <NotificationsDropdown />
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                      {session.user.image ? (
                        <img src={session.user.image} alt="User" className="h-8 w-8 object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuLabel className="font-normal border-b mb-1 pb-2">
                     <div className="flex flex-col space-y-1">
                       <p className="text-sm font-medium leading-none">{session.user.name}</p>
                       <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                     </div>
                   </DropdownMenuLabel>
                   <DropdownMenuItem asChild>
                     <Link href="/dashboard" className="cursor-pointer w-full">Dashboard</Link>
                   </DropdownMenuItem>
                    {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                      <DropdownMenuItem className="cursor-pointer" asChild>
                       <Link href="/admin" className="flex items-center w-full"><Shield className="mr-2 h-4 w-4" /> Moderation Panel</Link>
                     </DropdownMenuItem>
                   )}
                  
                  {session.user.role === "SUPER_ADMIN" && (
                    <DropdownMenuItem className="cursor-pointer font-bold text-amber-500 hover:text-amber-600 focus:text-amber-600 focus:bg-amber-500/10" asChild>
                      <Link href="/admin/roles" className="flex items-center w-full"><Shield className="mr-2 h-4 w-4" /> Role Manager</Link>
                    </DropdownMenuItem>
                  )}
                   <DropdownMenuItem asChild>
                     <Link href="/profile" className="cursor-pointer flex items-center w-full">
                       <UserCircle className="mr-2 h-4 w-4" /> Profile Stats
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link href="/profile" className="cursor-pointer flex items-center w-full">
                       <Settings className="mr-2 h-4 w-4" /> Edit Profile
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
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
