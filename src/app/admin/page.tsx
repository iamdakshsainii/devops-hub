import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, Database, Users, Calendar, AlertCircle,
  Map, ArrowRight, TrendingUp, Clock, Shield, Trash2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  const [
    totalUsers,
    totalModules,
    deletedModules,
    deletedResources,
    deletedEvents,
    deletedRoadmaps,
    deletedCheatsheets,
    deletedBlogPosts,
    pendingModules,
    totalResources,
    pendingResources,
    totalEvents,
    totalRoadmaps,
    pendingAdminRequests,
    usersToday,
    usersThisWeek,
    usersThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.roadmapStep.count({ where: { roadmapId: null, status: { not: "DELETED" } } }),
    prisma.roadmapStep.count({ where: { status: "DELETED" } }),
    prisma.resource.count({ where: { status: "DELETED" } }),
    prisma.event.count({ where: { status: "DELETED" } }),
    prisma.roadmap.count({ where: { status: "DELETED" } }),
    prisma.cheatsheet.count({ where: { status: "DELETED" } }),
    prisma.blogPost.count({ where: { status: "DELETED" } }),
    prisma.roadmapStep.count({ where: { roadmapId: null, status: "PENDING" } }),
    prisma.resource.count({ where: { status: { not: "DELETED" } } }),
    prisma.resource.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { status: { not: "DELETED" } } }),
    prisma.roadmap.count({ where: { status: { not: "DELETED" } } }),
    prisma.adminRequest.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
  ]);

  const totalRecycleBin = deletedModules + deletedResources + deletedEvents + deletedRoadmaps + deletedCheatsheets + deletedBlogPosts;

  const recentUsersList = await prisma.user.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true }
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const label = months[d.getMonth()];
    const count = recentUsersList.filter(u => {
      const uDate = new Date(u.createdAt);
      return uDate.getMonth() === d.getMonth() && uDate.getFullYear() === d.getFullYear();
    }).length;
    return { date: label, users: count };
  });

  const dailyGrowthData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = days[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    const count = recentUsersList.filter(u => {
      const uDate = new Date(u.createdAt);
      return uDate.toISOString().split('T')[0] === dateStr;
    }).length;
    return { date: label, users: count };
  });

  const weeklyGrowthData = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    d.setDate(d.getDate() - (3 - i) * 7);
    const label = `Week ${i + 1}`;
    const count = recentUsersList.filter(u => {
      const uDate = new Date(u.createdAt);
      const start = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
      return uDate >= start && uDate <= d;
    }).length;
    return { date: label, users: count };
  });

  const yearlyGrowthData = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - (2 - i));
    const label = d.getFullYear().toString();
    const count = recentUsersList.filter(u => {
      const uDate = new Date(u.createdAt);
      return uDate.getFullYear() === d.getFullYear();
    }).length;
    return { date: label, users: count };
  });

  const growthData = { daily: dailyGrowthData, weekly: weeklyGrowthData, monthly: monthlyData, yearly: yearlyGrowthData };

  const contentData = [
    { label: "Modules", value: totalModules },
    { label: "Resources", value: totalResources },
    { label: "Events", value: totalEvents },
    { label: "Roadmaps", value: totalRoadmaps },
  ];

  const publishedModules = totalModules - pendingModules;
  const publishedResources = totalResources - pendingResources;

  let dbSizeMB = 0;
  let dbSizePercent = 0;
  if (isSuperAdmin) {
    try {
      const result = await prisma.$queryRaw`SELECT pg_database_size(current_database()) as size;` as any[];
      if (Array.isArray(result) && result[0]?.size) {
        dbSizeMB = Number(result[0].size) / (1024 * 1024);
        dbSizePercent = Math.min((dbSizeMB / 500) * 100, 100);
      }
    } catch (e) {
      console.error("Failed to fetch DB size:", e);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform statistics, pending actions, and recent activity.</p>
      </div>

      {/* Alerts */}
      {(isSuperAdmin && pendingAdminRequests > 0) && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start gap-4">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Action Required</h4>
            <p className="text-sm">You have items waiting for approval.</p>
            <div className="flex flex-wrap gap-3 mt-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

        <Link href="/admin/modules" className="group">
          <Card className="h-full hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules</CardTitle>
              <Database className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{publishedModules}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingModules > 0 && <span className="text-amber-500 font-medium">{pendingModules} pending · </span>}
                {totalModules} total
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

        <Link href="/admin/recycle-bin" className="group">
          <Card className="h-full hover:border-destructive/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recycle Bin</CardTitle>
              <Trash2 className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRecycleBin}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-destructive transition-colors">
                View deleted items <ArrowRight className="h-3 w-3" />
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

      {/* User Growth and Platform Metrics Section */}
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-background to-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sign-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-pink-500">{usersToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Total platform joins today</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-background to-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-blue-500">{usersThisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">Growth last 7 days</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-background to-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-500">{usersThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Overall monthly acquisition</p>
            </CardContent>
          </Card>
        </div>

        {/* Visual Analytics */}
        <AnalyticsCharts growthData={growthData} contentData={contentData} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/modules/new"><Button variant="outline" size="sm" className="gap-2"><Database className="h-3.5 w-3.5" /> New Module</Button></Link>
            <Link href="/admin/roadmaps/new"><Button variant="outline" size="sm" className="gap-2"><Map className="h-3.5 w-3.5" /> New Roadmap</Button></Link>
            <Link href="/admin/events/new"><Button variant="outline" size="sm" className="gap-2"><Calendar className="h-3.5 w-3.5" /> New Event</Button></Link>
            {pendingModules > 0 && <Link href="/admin/modules"><Button size="sm" className="gap-2"><Database className="h-3.5 w-3.5" /> Review {pendingModules} Modules</Button></Link>}
            {pendingResources > 0 && <Link href="/admin/resources"><Button size="sm" className="gap-2"><Database className="h-3.5 w-3.5" /> Review {pendingResources} Resources</Button></Link>}
            {isSuperAdmin && <Link href="/admin/roles"><Button variant="outline" size="sm" className="gap-2"><Shield className="h-3.5 w-3.5" /> Role Management</Button></Link>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
