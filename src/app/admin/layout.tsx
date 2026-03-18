import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, FileText, Database, Calendar, Users } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

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
          <Link href="/admin/notes" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <FileText className="h-4 w-4" /> Notes Queue
          </Link>
          <Link href="/admin/resources" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <Database className="h-4 w-4" /> Resources Queue
          </Link>
          <Link href="/admin/events" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Calendar className="h-4 w-4" /> Events
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
             <Users className="h-4 w-4" /> Users
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-card border rounded-xl shadow-sm p-6 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
