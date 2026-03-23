import { 
  Award, CheckCircle2, Trophy, Flame, Zap, BookOpen, 
  Calendar, Sunrise, Moon, Soup, Activity, Timer, 
  Terminal, GitCommit, Container, GitBranch, Cloud, Shield, 
  Compass, Share2, Heart, Bookmark, AlertCircle
} from "lucide-react";
import React from "react";

export type AchievementCategory = 'learning' | 'consistency' | 'speed' | 'topics' | 'explore' | 'special';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'none';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: React.ComponentType<{ className?: string }>;
  checkUnlocked: (context: any) => boolean;
}

export const ACHIEVEMENT_CATEGORIES = [
  { id: 'learning', label: 'Learning Milestones', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'consistency', label: 'Consistency & Streaks', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'speed', label: 'Speed & Intensity', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { id: 'topics', label: 'Topic Specific', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { id: 'explore', label: 'Exploration', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'special', label: 'Special & Rare', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
];

export const achievements: Achievement[] = [
  // ── Learning Milestones ──
  {
    id: "first_step",
    name: "First Step",
    description: "Completed your very first topic",
    category: "learning",
    tier: "none",
    icon: CheckCircle2,
    checkUnlocked: (ctx) => (ctx.userProgress?.length || 0) > 0
  },
  {
    id: "module_unlocked",
    name: "Module Unlocked",
    description: "Finished your first complete module",
    category: "learning",
    tier: "none",
    icon: Award,
    checkUnlocked: (ctx) => (ctx.completedModules?.length || 0) > 0
  },
  {
    id: "module_collector_bronze",
    name: "Module Collector",
    description: "Completed 3 complete modules",
    category: "learning",
    tier: "bronze",
    icon: BookOpen,
    checkUnlocked: (ctx) => (ctx.completedModulesCount || 0) >= 3
  },
  {
    id: "module_collector_silver",
    name: "Module Collector",
    description: "Completed 5 complete modules",
    category: "learning",
    tier: "silver",
    icon: BookOpen,
    checkUnlocked: (ctx) => (ctx.completedModulesCount || 0) >= 5
  },
  {
    id: "module_collector_gold",
    name: "Module Collector",
    description: "Completed 10 complete modules",
    category: "learning",
    tier: "gold",
    icon: BookOpen,
    checkUnlocked: (ctx) => (ctx.completedModulesCount || 0) >= 10
  },
  
  // ── Consistency and Streaks ──
  {
    id: "3_day_streak",
    name: "3 Day Streak",
    description: "Learned 3 days in a row",
    category: "consistency",
    tier: "bronze",
    icon: Flame,
    checkUnlocked: (ctx) => (ctx.user?.streak || 0) >= 3
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "7 days straight",
    category: "consistency",
    tier: "silver",
    icon: Flame,
    checkUnlocked: (ctx) => (ctx.user?.streak || 0) >= 7
  },
  {
    id: "monthly_grind",
    name: "Monthly Grind",
    description: "30 days in a month with activity",
    category: "consistency",
    tier: "gold",
    icon: Calendar,
    checkUnlocked: (ctx) => (ctx.user?.streak || 0) >= 30
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Completed a topic before 8:00 AM",
    category: "consistency",
    tier: "none",
    icon: Sunrise,
    checkUnlocked: (ctx) => ctx.activityTimes?.some((time: any) => time.hour < 8) || false
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Completed a topic after 11:00 PM",
    category: "consistency",
    tier: "none",
    icon: Moon,
    checkUnlocked: (ctx) => ctx.activityTimes?.some((time: any) => time.hour >= 23) || false
  },
  {
    id: "lunch_learner",
    name: "Lunch Learner",
    description: "Activity between 12:00 PM and 2:00 PM",
    category: "consistency",
    tier: "none",
    icon: Soup,
    checkUnlocked: (ctx) => ctx.activityTimes?.some((time: any) => time.hour >= 12 && time.hour < 14) || false
  },

  // ── Speed and Intensity ──
  {
    id: "speed_runner",
    name: "Speed Runner",
    description: "Completed an entire module in a single day",
    category: "speed",
    tier: "silver",
    icon: Timer,
    checkUnlocked: () => false // Requires historical timestamp tracking
  },
  {
    id: "marathon",
    name: "Marathon",
    description: "Completed 10 topics in one day",
    category: "speed",
    tier: "gold",
    icon: Activity,
    checkUnlocked: () => false
  },

  // ── Topic Category Specific ──
  {
    id: "linux_certified",
    name: "Linux Certified",
    description: "Completed any Linux module topics",
    category: "topics",
    tier: "none",
    icon: Terminal,
    checkUnlocked: (ctx) => ctx.topicsByCategory?.linux >= 1 || false
  },
  {
    id: "git_guru",
    name: "Git Guru",
    description: "Completed any Git module topics",
    category: "topics",
    tier: "none",
    icon: GitBranch,
    checkUnlocked: (ctx) => ctx.topicsByCategory?.git >= 1 || false
  },
  {
    id: "container_captain",
    name: "Container Captain",
    description: "Completed any Docker/K8s topics",
    category: "topics",
    tier: "none",
    icon: Container,
    checkUnlocked: (ctx) => ctx.topicsByCategory?.docker >= 1 || false
  },
  {
    id: "pipeline_pro",
    name: "Pipeline Pro",
    description: "Completed any CI/CD topics",
    category: "topics",
    tier: "none",
    icon: Zap,
    checkUnlocked: (ctx) => ctx.topicsByCategory?.cicd >= 1 || false
  },
  {
    id: "cloud_ready",
    name: "Cloud Ready",
    description: "Completed any Cloud module topics",
    category: "topics",
    tier: "none",
    icon: Cloud,
    checkUnlocked: (ctx) => ctx.topicsByCategory?.cloud >= 1 || false
  },
  {
    id: "security_aware",
    name: "Security Aware",
    description: "Completed any Security module topics",
    category: "topics",
    tier: "none",
    icon: Shield,
    checkUnlocked: (ctx) => ctx.topicsByCategory?.security >= 1 || false
  },

  // ── Exploration ──
  {
    id: "module_hopper",
    name: "Module Hopper",
    description: "Opened 5 different modules",
    category: "explore",
    tier: "none",
    icon: Compass,
    checkUnlocked: () => false
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Bookmarked 5 topics or resources",
    category: "explore",
    tier: "bronze",
    icon: Bookmark,
    checkUnlocked: (ctx) => (ctx.bookmarksCount || 0) >= 5
  },
  {
    id: "sharer",
    name: "Sharer",
    description: "Shared a module link with others",
    category: "explore",
    tier: "none",
    icon: Share2,
    checkUnlocked: () => false
  },
  {
    id: "feedback_giver",
    name: "Feedback Giver",
    description: "Liked or upvoted module content",
    category: "explore",
    tier: "none",
    icon: Heart,
    checkUnlocked: (ctx) => (ctx.upvotesCount || 0) >= 1
  },

  // ── Special / Rare ──
  {
    id: "100_club",
    name: "100 Club",
    description: "100 topics completed",
    category: "special",
    tier: "gold",
    icon: Trophy,
    checkUnlocked: (ctx) => (ctx.userProgress?.length || 0) >= 100
  },
  {
    id: "500_club",
    name: "500 Club",
    description: "500 topics completed",
    category: "special",
    tier: "platinum",
    icon: Trophy,
    checkUnlocked: (ctx) => (ctx.userProgress?.length || 0) >= 500
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "30 day streak",
    category: "special",
    tier: "platinum",
    icon: Flame,
    checkUnlocked: (ctx) => (ctx.user?.streak || 0) >= 30
  },
  {
    id: "platinum_learner",
    name: "Platinum Learner",
    description: "Completed 3 full roadmaps",
    category: "special",
    tier: "platinum",
    icon: AlertCircle,
    checkUnlocked: (ctx) => (ctx.completedRoadmapsCount || 0) >= 3
  }
];
