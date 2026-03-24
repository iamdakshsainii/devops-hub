import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, FileText, Settings, Trash2, Edit3, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { UserEventsList } from "./user-events-list";

export const dynamic = "force-dynamic";

export default async function UserEventsDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const myEvents = await prisma.event.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookmarks: true } } }
  });

  const totalSaves = myEvents.reduce((acc, curr) => acc + curr._count.bookmarks, 0);
  const pendingCount = myEvents.filter(e => e.status === "PENDING").length;
  const publishedCount = myEvents.filter(e => e.status === "PUBLISHED").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage, edit, and track the performance of your submitted events.</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-xl border border-border/10 rounded-2xl shadow-md hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 relative group overflow-hidden">
           {/* Backlight flare hover animationwardsWARDS. */}
           <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl pointer-events-none bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hosted</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myEvents.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border border-border/10 rounded-2xl shadow-md hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 relative group overflow-hidden">
           {/* Backlight flare hover animationwardsWARDS. */}
           <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl pointer-events-none bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Saves</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSaves}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border border-border/10 rounded-2xl shadow-md hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 relative group overflow-hidden">
           {/* Backlight flare hover animationwardsWARDS. */}
           <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl pointer-events-none bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Live On Platform</CardTitle>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border border-border/10 rounded-2xl shadow-md hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 relative group overflow-hidden">
           {/* Backlight flare hover animationwardsWARDS. */}
           <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl pointer-events-none bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
             <Settings className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Submissions</h2>
          <Link href="/events/new">
            <Button size="sm" className="gap-2">+ Host New Event</Button>
          </Link>
        </div>
        
        {/* Pass events to client component list handler with edit modals triggers */}
        <UserEventsList events={myEvents} />
      </div>
    </div>
  );
}
