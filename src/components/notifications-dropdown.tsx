"use client"
import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter();

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.isRead).length)
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000) // update every 30s
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", { method: "POST", body: JSON.stringify({ id }) })
    fetchNotifs()
  }

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) markAsRead(n.id)
    if (n.link) router.push(n.link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" title="View Announcements & Notifications" size="icon" className="relative rounded-full hover:bg-muted/80 hover:text-foreground transition-all duration-300 hover:scale-110">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive flex items-center justify-center"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => markAsRead("ALL")}>
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[350px] overflow-y-auto p-1">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            notifications.map(n => (
              <DropdownMenuItem 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={`flex flex-col items-start p-3 mb-1 space-y-1 cursor-pointer focus:bg-muted/80 ${n.isRead ? 'opacity-70' : 'bg-muted/40'}`}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="font-semibold text-sm line-clamp-1">{n.title}</span>
                  {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <span className="text-[13px] text-muted-foreground line-clamp-2">{n.message}</span>
                <span className="text-[10px] text-muted-foreground/60 tracking-wider font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
