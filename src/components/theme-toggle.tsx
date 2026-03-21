"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark" || (resolvedTheme === undefined && theme === "dark");

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative group hover:bg-muted" onClick={() => setTheme(isDark ? "light" : "dark")}>
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out text-amber-500 group-hover:animate-pulse ${isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute inset-0 m-auto h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out text-slate-700 dark:text-slate-100 group-hover:animate-pulse ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0 opacity-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
