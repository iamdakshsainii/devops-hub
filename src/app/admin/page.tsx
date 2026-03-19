import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, Database, Users, Calendar, AlertCircle,
  Map, ArrowRight, TrendingUp, Clock, Shield
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  const [
    totalUsers,
    totalNotes,
    pendingNotes,
    totalResources,
    pendingResources,
    totalEvents,
    totalRoadmaps,
    pendingAdminRequests,
    recentUsers,
    recentNotes,
    recentResources,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.note.count(),
    prisma.note.count({ where: { status: "PENDING" } }),
    prisma.resource.count(),
    prisma.resource.count({ where: { status: "PENDING" } }),
    prisma.event.count(),
    prisma.roadmap.count(),
    prisma.adminRequest.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { fullName: true, email: true, createdAt: true, role: true } }),
    prisma.note.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { title: true, status: true, createdAt: true, author: { select: { fullName: true } } } }),
    prisma.resource.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { title: true, status: true, createdAt: true, author: { select: { fullName: true } } } }),
  ]);

  const publishedNotes = totalNotes - pendingNotes;
  const publishedResources = totalResources - pendingResources;

  let dbSizeMB = 0;
  let dbSizePercent = 0;
  if (isSuperAdmin) {
    try {
      // Neon free tier logic: ~500MB max per project usually
      const result = await prisma.$queryRaw`SELECT pg_database_size(current_database()) as size;` as any[];
      if (Array.isArray(result) && result[0]?.size) {
        dbSizeMB = Number(result[0].size) / (1024 * 1024);
        dbSizePercent = Math.min((dbSizeMB / 500) * 100, 100);
      }
    } catch (e) {
      console.error("Failed to fetch DB size:", e);
    }
  }

  // Data for the bar chart (CSS-based, no library)
  const chartData = [
    { label: "Notes", value: totalNotes, color: "#3B82F6" },
    { label: "Resources", value: totalResources, color: "#10B981" },
    { label: "Events", value: totalEvents, color: "#F59E0B" },
    { label: "Roadmaps", value: totalRoadmaps, color: "#8B5CF6" },
    { label: "Users", value: totalUsers, color: "#EC4899" },
  ];
  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform statistics, pending actions, and recent activity.</p>
      </div>

      {/* Alerts */}
      {(pendingNotes > 0 || pendingResources > 0 || (isSuperAdmin && pendingAdminRequests > 0)) && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start gap-4">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Action Required</h4>
            <p className="text-sm">You have items waiting for approval.</p>
            <div className="flex flex-wrap gap-3 mt-3">
              {pendingNotes > 0 && (
                <Link href="/admin/notes">
                  <Button variant="outline" size="sm" className="bg-background text-foreground h-8 gap-1">
                    <FileText className="h-3 w-3" /> {pendingNotes} Notes Pending
                  </Button>
                </Link>
              )}
              {pendingResources > 0 && (
                <Link href="/admin/resources">
                  <Button variant="outline" size="sm" className="bg-background text-foreground h-8 gap-1">
                    <Database className="h-3 w-3" /> {pendingResources} Resources Pending
                  </Button>
                </Link>
              )}
              {isSuperAdmin && pendingAdminRequests > 0 && (
                <Link href="/admin/roles">
                  <Button variant="outline" size="sm" className="bg-background text-foreground h-8 gap-1 border-amber-500/30 text-amber-600">
                    <Shield className="h-3 w-3" /> {pendingAdminRequests} Admin Requests
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clickable Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Link href="/admin/users" className="group">
          <Card className="h-full hover:border-pink-500/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-pink-500 transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/notes" className="group">
          <Card className="h-full hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{publishedNotes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingNotes > 0 && <span className="text-amber-500 font-medium">{pendingNotes} pending · </span>}
                {totalNotes} total
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/resources" className="group">
          <Card className="h-full hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <Database className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{publishedResources}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingResources > 0 && <span className="text-amber-500 font-medium">{pendingResources} pending · </span>}
                {totalResources} total
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/events" className="group">
          <Card className="h-full hover:border-amber-500/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                Manage <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/roadmaps" className="group">
          <Card className="h-full hover:border-violet-500/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roadmaps</CardTitle>
              <Map className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRoadmaps}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-violet-500 transition-colors">
                Manage <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>
        
        {isSuperAdmin && (
          <a href="https://console.neon.tech/" target="_blank" rel="noopener noreferrer" className="group">
            <Card className="h-full hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative">
              <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: "#10B981", width: `${dbSizePercent}%` }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-emerald-500/10 to-transparent">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Neon DB</CardTitle>
                <Database className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold flex items-end gap-1">
                   {dbSizeMB.toFixed(1)} <span className="text-lg font-medium text-muted-foreground mb-1">MB</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                  {dbSizePercent.toFixed(1)}% of 500MB Free Tier
                </p>
              </CardContent>
            </Card>
          </a>
        )}
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Content Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground font-mono">{item.value}</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.max((item.value / maxVal) * 100, 2)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {/* New users */}
              {recentUsers.map((user, i) => (
                <div key={`u-${i}`} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5 text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.fullName || user.email}</p>
                    <p className="text-xs text-muted-foreground">Joined</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(user.createdAt)}</span>
                </div>
              ))}

              {/* Recent notes */}
              {recentNotes.map((note, i) => (
                <div key={`n-${i}`} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {note.author?.fullName || "Unknown"} ·{" "}
                      <span className={note.status === "PENDING" ? "text-amber-500 font-medium" : "text-emerald-500"}>
                        {note.status}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(note.createdAt)}</span>
                </div>
              ))}

              {/* Recent resources */}
              {recentResources.map((res, i) => (
                <div key={`r-${i}`} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Database className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{res.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {res.author?.fullName || "Unknown"} ·{" "}
                      <span className={res.status === "PENDING" ? "text-amber-500 font-medium" : "text-emerald-500"}>
                        {res.status}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(res.createdAt)}</span>
                </div>
              ))}

              {recentUsers.length === 0 && recentNotes.length === 0 && recentResources.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/roadmaps/new"><Button variant="outline" size="sm" className="gap-2"><Map className="h-3.5 w-3.5" /> New Roadmap</Button></Link>
            <Link href="/admin/events/new"><Button variant="outline" size="sm" className="gap-2"><Calendar className="h-3.5 w-3.5" /> New Event</Button></Link>
            {pendingNotes > 0 && <Link href="/admin/notes"><Button size="sm" className="gap-2"><FileText className="h-3.5 w-3.5" /> Review {pendingNotes} Notes</Button></Link>}
            {pendingResources > 0 && <Link href="/admin/resources"><Button size="sm" className="gap-2"><Database className="h-3.5 w-3.5" /> Review {pendingResources} Resources</Button></Link>}
            {isSuperAdmin && <Link href="/admin/roles"><Button variant="outline" size="sm" className="gap-2"><Shield className="h-3.5 w-3.5" /> Role Management</Button></Link>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
