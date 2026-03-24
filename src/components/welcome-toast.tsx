"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { Sparkles, Hand, FileText } from "lucide-react"

export function WelcomeToast() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Logic 1: Brand new visitor handling
    const hasVisited = localStorage.getItem("devops_network_visited")
    if (!hasVisited) {
      setTimeout(() => {
        toast("Welcome to DevOps Network!", {
          description: "Explore modules, read the wiki, and level up your infrastructure game.",
          icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
          duration: 6000,
        })
        localStorage.setItem("devops_network_visited", "true")
      }, 1500)
      return
    }

    // Logic 2: Authenticated login welcome
    if (status === "authenticated" && session?.user) {
      const welcomedKey = `welcomed_${session.user.id}`
      const hasBeenWelcomedThisSession = sessionStorage.getItem(welcomedKey)

      if (!hasBeenWelcomedThisSession) {
        setTimeout(() => {
          toast(`Welcome back, ${session.user.name?.split(" ")[0] || "Engineer"}!`, {
            description: "Your session is securely synced. Ready to build?",
            icon: <Hand className="h-4 w-4 text-emerald-500" />,
            duration: 5000,
          })
          sessionStorage.setItem(welcomedKey, "true")
        }, 1000)
      }
    }

    // Logic 3: Cheatsheets first-time guide
    if (pathname === "/cheatsheets") {
      const cheatsheetVisitedKey = "visited_cheatsheets"
      const hasVisitedCheatsheets = localStorage.getItem(cheatsheetVisitedKey)
      
      if (!hasVisitedCheatsheets) {
        setTimeout(() => {
          toast("Explore Cheatsheets! 🚀", {
            description: "High-density quick references for dense toolkits, configurations, and core lifecycles setups.",
            icon: <FileText className="h-4 w-4 text-primary" />,
            duration: 6000,
          })
          localStorage.setItem(cheatsheetVisitedKey, "true")
        }, 1200)
      }
    }
  }, [session, status, pathname])

  return null
}
