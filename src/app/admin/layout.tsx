import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, FileText, Database, Calendar, Users, Map, ShieldCheck, Library, Archive } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8 min-h-[calc(100vh-4rem)]">
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="flex items-center gap-2 text-primary font-bold text-lg px-2">
          <Shield className="h-5 w-5" />
          Admin Panel
        </div>
        
        <nav className="flex flex-col space-y-1">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link href="/admin/modules" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Library className="h-4 w-4 text-primary" /> Modules Manager
          </Link>
          <Link href="/admin/roadmaps" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <Map className="h-4 w-4" /> Roadmaps / Templates
          </Link>
          <Link href="/admin/resources" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Database className="h-4 w-4" /> Resources
          </Link>
          <Link href="/admin/events" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Calendar className="h-4 w-4" /> Events
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Users className="h-4 w-4" /> Users
          </Link>
          <Link href="/admin/requests" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Shield className="h-4 w-4 text-amber-500" /> Requests & Inbox
          </Link>
          <Link href="/admin/recycle-bin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Archive className="h-4 w-4 text-emerald-500" /> Recycle Bin
          </Link>

          {/* SUPER_ADMIN Only */}
          {isSuperAdmin && (
            <>
              <div className="h-px bg-border my-2" />
              <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Super Admin</p>
              <Link href="/admin/roles" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors text-primary">
                <ShieldCheck className="h-4 w-4" /> Role Management
              </Link>
            </>
          )}
        </nav>
      </aside>
      <main className="flex-1 bg-card border rounded-xl shadow-sm p-6 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
