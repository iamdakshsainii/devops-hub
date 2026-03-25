"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Award, Zap, Flame, Trophy, CheckCircle2, Map, ArrowRight, Shield, Clock, BookOpen, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function DashboardClient({ user, currentRoadmap, allStats, progress }: any) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'week' | 'month' | 'year'>('month');
  const [monthOffset, setMonthOffset] = useState(0); 
  const [rank, setRank] = useState({ title: "Newcomer", next: 200, points: 0 });

  useEffect(() => {
    setMounted(true);
    // Dynamic recalculation for progress ranks
    const points = allStats.points || 0;
    if (points < 200) setRank({ title: "Newcomer", next: 200, points });
    else if (points < 500) setRank({ title: "Explorer", next: 500, points });
    else if (points < 1000) setRank({ title: "Learner", next: 1000, points });
    else if (points < 2500) setRank({ title: "Practitioner", next: 2500, points });
    else if (points < 5000) setRank({ title: "Engineer", next: 5000, points });
    else setRank({ title: "DevOps Elite", next: points + 5000, points });
  }, [allStats.points]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMotivation = (p: number) => {
    if (p === 0) return "Just getting started";
    if (p < 30) return "Building momentum";
    if (p < 55) return "More than halfway there";
    if (p < 85) return "Making great progress!";
    if (p < 100) return "Almost down, push through!";
    return "Roadmap mastered! 🎉";
  };

  const getAchievements = () => {
     const hasTopic = allStats.topics > 0;
     const hasModule = allStats.modules > 0;
     const hasRoadmap = allStats.roadmaps > 0;

     return [
        { id: "1", title: "First Topic Done", icon: <CheckCircle2 className="h-5 w-5" />, unlocked: hasTopic, desc: "Step into DevOps world" },
        { id: "2", title: "First Module", icon: <Award className="h-5 w-5" />, unlocked: hasModule, desc: "Completed your first module" },
        { id: "3", title: "Roadmap Champ", icon: <Trophy className="h-5 w-5" />, unlocked: hasRoadmap, desc: "Mastered full roadmap track" },
        { id: "4", title: "Scale Up", icon: <Flame className="h-5 w-5" />, unlocked: allStats.modules >= 5, desc: "5 modules completed" },
        { id: "5", title: "Scholar", icon: <BookOpen className="h-5 w-5" />, unlocked: allStats.topics >= 30, desc: "30 topics completed" },
        { id: "6", title: "DevOps Elite", icon: <Zap className="h-5 w-5" />, unlocked: allStats.topics >= 100, desc: "100 topics completed" },
     ];
  };

  const achievements = getAchievements();

  const activityMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    if (Array.isArray(progress)) {
        progress.forEach((p: any) => {
           if (!p.createdAt) return;
           const date = new Date(p.createdAt);
           if (isNaN(date.getTime())) return;
           // CRITICAL FIX: Use LOCAL DATE to ensure the user sees their activity on the correct day
           const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
           map[key] = (map[key] || 0) + 1;
        });
    }
    return map;
  }, [progress]);

  const getIntensityColor = (count: number) => {
     if (count === 0) return "bg-muted/5 border-border/10 text-muted-foreground/30 hover:border-border/40 hover:bg-muted/10";
     if (count <= 2) return "bg-primary/20 border-primary/20 text-foreground group-hover:bg-primary/30";
     if (count <= 5) return "bg-primary/50 border-primary/30 text-white group-hover:bg-primary/60";
     if (count <= 10) return "bg-primary/70 border-primary/40 text-white shadow-[0_0_10px_rgba(var(--primary),0.2)]";
     return "bg-primary border-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.4)]";
  };

  // Calculate 7-day activity bucketted Monday to Sunday
  const getWeeklyActivity = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // M, T, W, T, F, S, S
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    
    // Calculate difference to last Monday
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + diffToMonday);
    mondayDate.setHours(0, 0, 0, 0); // Start of Monday

    for (let i = 0; i < 7; i++) {
        const d = new Date(mondayDate);
        d.setDate(mondayDate.getDate() + i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        counts[i] = activityMap[key] || 0;
    }

    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const currentDayIndex = (currentDayOfWeek + 6) % 7; // Map 0 (Sun) to index 6, 1 (Mon) to index 0

    let currentStreak = 0;
    let maxWeekStreak = 0;
    counts.forEach(c => {
      if (c > 0) currentStreak++;
      else { maxWeekStreak = Math.max(maxWeekStreak, currentStreak); currentStreak = 0; }
    });
    maxWeekStreak = Math.max(maxWeekStreak, currentStreak);

    return {
       data: days.map((day, i) => ({ day, count: counts[i], isCurrentDay: i === currentDayIndex })),
       maxWeekStreak
    };
  };

  // 1 Month calendar grid parser
  const getMonthActivity = () => {
     const today = new Date();
     const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
     const year = targetDate.getFullYear();
     const month = targetDate.getMonth();
     
     const firstDay = new Date(year, month, 1);
     const lastDay = new Date(year, month + 1, 0);
     const daysCount = lastDay.getDate();
     const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 

     const days = [];
     for(let i = 0; i < offset; i++) days.push({ date: null, count: 0 });
     for(let i = 1; i <= daysCount; i++) {
        const d = new Date(year, month, i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days.push({ date: d, count: activityMap[key] || 0 });
     }
     
     const monthName = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
     return { days, monthName };
  };

  // 1 Year heatmap list grid parser
  const getYearlyActivity = () => {
    const columns = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const totalDays = 52 * 7; 
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays);
    startDate.setDate(startDate.getDate() + (1 - startDate.getDay())); // Align to Mon
    
    for (let c = 0; c < 52; c++) {
       const days = [];
       for (let d = 0; d < 7; d++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + (c * 7 + d));
          const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
          days.push({ date: currentDate, count: activityMap[key] || 0 });
       }
       columns.push(days);
    }
    return columns;
  };

  const { data: weeklyActivity, maxWeekStreak } = getWeeklyActivity();
  const { days: monthActivity, monthName } = getMonthActivity();
  const yearActivity = getYearlyActivity();

  const maxActivity = Math.max(...weeklyActivity.map(w => w.count));
  const totalCompletedInWeek = weeklyActivity.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-8">
      

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Topics Mastery", count: allStats.topics, icon: <BookOpen className="h-4 w-4" /> },
           { label: "Modules Finished", count: allStats.modules, icon: <Award className="h-4 w-4" /> },
           { label: "Roadmaps Done", count: allStats.roadmaps, icon: <Trophy className="h-4 w-4" /> },
           { label: "Network Points", count: allStats.points, icon: <Zap className="h-4 w-4" /> },
         ].map((stat, idx) => (
            <Card key={stat.label} className="bg-card/40 backdrop-blur-xl border border-border/10 overflow-hidden group hover:border-primary/30 transition-all hover:scale-[1.03] hover:shadow-lg">
               <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
                  <p className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest">{stat.label}</p>
                  <div className="text-primary group-hover:scale-110 transition-transform">{stat.icon}</div>
               </CardHeader>
               <CardContent className="p-4 pt-0">
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black group-hover:text-primary transition-colors">{stat.count}</p>
                    <span className="text-[10px] font-bold text-muted-foreground/40">/{idx === 3 ? "∞" : "100+"}</span>
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>

      {/* Ramping UP Header */}
      <Card className="p-4 bg-primary/5 border-primary/20 backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl -z-10 group-hover:bg-primary/20 transition-all" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                       <Zap className="h-5 w-5 fill-current" />
                   </div>
                   <div>
                       <h3 className="font-black text-sm uppercase tracking-tight">{rank.title} <span className="text-primary/60 text-[10px]">Lvl {Math.floor(rank.points / 100) + 1}</span></h3>
                       <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Rank Progress · {rank.next - rank.points} PTS TO NEXT RANK</p>
                   </div>
               </div>
               <div className="flex-1 w-full max-w-md space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-muted-foreground px-1">
                        <span>Progress</span>
                        <span>{rank.points} / {rank.next} XP</span>
                    </div>
                    <div className="h-2.5 w-full bg-muted/40 rounded-full border border-border/10 p-0.5 shadow-inner">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary),0.3)]" style={{ width: `${Math.min((rank.points / rank.next) * 100, 100)}%` }} />
                    </div>
               </div>
          </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Current Roadmap */}
            {currentRoadmap ? (
               <Card className="rounded-2xl border shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-background/50">
                   <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -z-10" style={{ backgroundColor: `${currentRoadmap.color}15` }} />
                   
                   <CardHeader className="pb-2">
                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                           <Flame className="h-3.5 w-3.5 text-orange-500" /> Currently Learning
                       </div>
                       <div className="flex items-center gap-3 mt-1">
                            <span className="text-3xl">{currentRoadmap.icon}</span>
                            <CardTitle className="text-xl md:text-2xl font-black">{currentRoadmap.title}</CardTitle>
                       </div>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <div className="flex justify-between items-end">
                           <div>
                               <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">{getMotivation(currentRoadmap.percent)}</p>
                               <p className="text-2xl font-black text-foreground">{currentRoadmap.percent}%</p>
                           </div>
                           <p className="text-xs text-muted-foreground font-medium">{currentRoadmap.completedSteps} of {currentRoadmap.totalSteps} steps completed</p>
                       </div>

                       <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${currentRoadmap.percent}%`, backgroundColor: currentRoadmap.color }} />
                       </div>

                       <div className="pt-2 flex">
                            <Link href={`/roadmap/${currentRoadmap.id}`} className="w-full">
                                <Button className="w-full rounded-xl flex items-center justify-center gap-2 group" style={{ backgroundColor: currentRoadmap.color, color: "#fff" }}>
                                    Continue Learning <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                       </div>
                   </CardContent>
               </Card>
            ) : (
               <Card className="rounded-2xl border border-dashed text-center p-8 bg-muted/5">
                   <Map className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                   <p className="text-muted-foreground text-sm font-medium">Start a roadmap track to display progress here!</p>
               </Card>
            )}

            {/* Weekly Activity / Heatmaps */}
            <Card className="rounded-2xl border bg-card/50 backdrop-blur shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/10 bg-muted/5">
                     <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            <h3 className="font-black text-foreground text-sm uppercase tracking-tight">Active Progress History</h3>
                         </div>
                         <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest pl-6">
                              {view === 'week' ? 'Real-time weekly pulse' : view === 'month' ? `Viewing ${monthName}` : 'Yearly contribution heatmap'}
                         </p>
                     </div>
                     <div className="flex items-center gap-2">
                        {view === 'month' && (
                           <div className="flex items-center bg-muted/30 rounded-lg p-0.5 border border-border/20 mr-2 shadow-inner">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-background" onClick={() => setMonthOffset(o => o - 1)}>
                                 <ChevronLeft className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold" onClick={() => setMonthOffset(0)}>Current</Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-background" onClick={() => setMonthOffset(o => o + 1)}>
                                 <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                           </div>
                        )}
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 rounded-xl px-3 border-primary/20 text-primary font-black uppercase text-[10px] gap-2 tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all">
                                 {view} view <MoreVertical className="h-3 w-3" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="p-1 rounded-xl bg-background/95 backdrop-blur-3xl border-border/40 shadow-2xl z-50">
                              <DropdownMenuItem onClick={() => setView('week')} className="rounded-lg text-xs font-bold uppercase cursor-pointer">Week Pulse</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setView('month')} className="rounded-lg text-xs font-bold uppercase cursor-pointer">Monthly Grid</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setView('year')} className="rounded-lg text-xs font-bold uppercase cursor-pointer">Yearly Heatmap</DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </div>

                 {/* Views Wrapper Layout */}
                 <div className="p-5 space-y-4">
                     {/* Summary Header above widgets securely */}
                     <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                         <span className="text-primary">{totalCompletedInWeek}</span> topics completed {view === 'week' ? 'this week' : view === 'month' ? 'this month' : 'this year'}
                         <span className="text-muted-foreground/30">|</span> 
                         <span className="text-orange-500 flex items-center gap-0.5"><Flame className="h-3.5 w-3.5" />{maxWeekStreak}d best week streak</span>
                     </div>

                     {view === 'week' && (
                         <div className="flex items-end justify-between h-40 pt-4 px-2 gap-3 relative">
                              {weeklyActivity.map((day, ix) => {
                                   const isAllZero = maxActivity === 0;
                                   const heightPercent = isAllZero ? 8 : Math.round((day.count / maxActivity) * 100);
                                   const isActive = day.count > 0;
                                   
                                   return (
                                        <div key={`${day.day}-${ix}`} className="flex-1 flex flex-col items-center h-full justify-end gap-1.5 group">
                                             {day.count > 0 ? (
                                                  <span className="text-[10px] font-bold text-primary transition-opacity group-hover:scale-110 duration-200">
                                                       {day.count}
                                                  </span>
                                             ) : ( <span className="text-[10px] invisible">0</span> )}

                                             <div className="w-full flex-1 flex items-end justify-center">
                                                  <div 
                                                       className={`w-4 rounded-full transition-all duration-700 ease-out fill-origin-bottom ${
                                                            isAllZero ? 'bg-muted/40 h-1.5' : isActive ? 'bg-gradient-to-t from-primary to-primary/70 shadow-[0_0_8px_rgba(var(--primary),0.2)]' : 'bg-transparent border border-dashed border-border/60 h-1'
                                                       }`}
                                                       style={{ height: !isAllZero && (isActive || !isActive) ? (mounted ? `${Math.max(heightPercent, heightPercent > 0 ? 12 : 1)}%` : "0%") : undefined }}
                                                  />
                                             </div>

                                             <div className="flex flex-col items-center gap-1 relative mt-1">
                                                  <span className={`text-xs font-semibold leading-none ${day.isCurrentDay ? 'text-primary font-bold' : isActive ? 'text-foreground' : 'text-muted-foreground/50'}`}>{day.day}</span>
                                                  {day.isCurrentDay && <div className="w-1 h-1 rounded-full bg-primary absolute -bottom-2 left-1/2 -translate-x-1/2 animate-pulse" />}
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                     )}

                     {view === 'month' && (
                         <div className="p-3 bg-muted/10 rounded-xl border">
                             <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-2">
                                 {["M","T","W","T","F","S","S"].map((d,i) => <span key={i}>{d}</span>)}
                             </div>
                             <div className="grid grid-cols-7 gap-1">
                                 {monthActivity.map((cell, index) => {
                                      const intenseColor = getIntensityColor(cell.count);
                                      return (
                                           <div 
                                                key={index} 
                                                className={`aspect-square rounded-md transition-all flex items-center justify-center relative group border ${cell.date ? intenseColor : 'opacity-0 pointer-events-none'}`}
                                           >
                                                {cell.date && (
                                                     <>
                                                          <span className={`text-[10px] font-black drop-shadow-sm transition-all group-hover:scale-125 ${cell.count > 0 ? "text-white" : "text-muted-foreground/30"}`}>
                                                               {cell.date.getDate()}
                                                          </span>
                                                          <div className="absolute opacity-0 group-hover:opacity-100 transition-all -top-7 left-1/2 -translate-x-1/2 z-10 bg-popover border text-popover-foreground text-[10px] p-1 rounded shadow-md pointer-events-none whitespace-nowrap">
                                                               {cell.count > 0 ? `${cell.count} topics done` : 'No activity'}
                                                          </div>
                                                     </>
                                                )}
                                           </div>
                                      );
                                 })}
                             </div>
                         </div>
                     )}

                     {view === 'year' && (
                         <div className="overflow-x-auto pb-2 scrollbar-thin">
                             <div className="min-w-[700px] flex gap-2 pt-4">
                                 {/* Left Headers */}
                                 <div className="flex flex-col justify-between text-[10px] font-bold text-muted-foreground/60 h-[84px] pr-2 items-end pt-1">
                                      <span>Mon</span><span>Wed</span><span>Fri</span>
                                 </div>
                                 
                                 {/* Grid matrix properly bound layout */}
                                 <div className="flex-1 flex gap-1">
                                      {yearActivity.map((week, wIndex) => (
                                           <div key={wIndex} className="flex flex-col gap-1 w-2.5">
                                                {week.map((day, dIndex) => {
                                                     const intenseColor = getIntensityColor(day.count);
                                                     return (
                                                          <div 
                                                               key={dIndex} 
                                                               className={`w-2.5 h-2.5 rounded-sm transition-all border group relative ${intenseColor}`}
                                                          >
                                                               <div className="absolute opacity-0 group-hover:opacity-100 transition-all -top-7 left-1/2 -translate-x-1/2 z-10 bg-popover border text-popover-foreground text-[10px] p-1 rounded shadow-md pointer-events-none whitespace-nowrap">
                                                                    {day.date.toLocaleDateString(undefined, {month:'short', day:'numeric'})}: {day.count} topic{day.count!==1?'s':''}
                                                               </div>
                                                          </div>
                                                     );
                                                })}
                                           </div>
                                      ))}
                                 </div>
                             </div>
                         </div>
                     )}

                     <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                          <Link href="/dashboard/achievements" className="flex-1">
                               <Button variant="outline" className="w-full text-xs rounded-xl flex items-center justify-center gap-1 group bg-background shadow-xs hover:bg-muted/30 transition-all hover:scale-[1.02]">
                                    View All Badges <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                          </Link>
                          {view === 'year' && (
                              <div className="ml-4 flex items-center gap-1">
                                  <span>Less</span>
                                  <div className="h-2 w-2 rounded-sm bg-muted/20 border" />
                                  <div className="h-2 w-2 rounded-sm bg-primary/10 border" />
                                  <div className="h-2 w-2 rounded-sm bg-primary/40 border" />
                                  <div className="h-2 w-2 rounded-sm bg-primary/70 border" />
                                  <div className="h-2 w-2 rounded-sm bg-primary border" />
                                  <span>More</span>
                              </div>
                          )}
                     </div>
                 </div>
            </Card>
         </div>

         {/* Achievements */}
         <div className="space-y-6">
            <Card className="rounded-2xl border bg-card/10 backdrop-blur p-5 space-y-4">
                 <div className="flex items-center gap-2 border-b pb-3">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground text-base">Badges & Achievements</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                      {achievements.slice(0, 4).map(ach => (
                           <div 
                              key={ach.id} 
                              className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${ach.unlocked ? "bg-primary/5 border-primary/20" : "opacity-40 grayscale bg-muted/20 border-border/10"}`}
                           >
                              <div className={`p-2 rounded-full border ${ach.unlocked ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border"}`}>
                                   {ach.icon}
                              </div>
                              <p className="text-[11px] font-bold leading-tight">{ach.title}</p>
                              <p className="text-[9px] text-muted-foreground">{ach.desc}</p>
                           </div>
                      ))}
                 </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
