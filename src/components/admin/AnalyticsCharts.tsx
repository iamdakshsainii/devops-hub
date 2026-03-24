"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Calendar } from "lucide-react";

interface DataPoint {
  date: string;
  users: number;
}

interface AnalyticsChartsProps {
  growthData: {
    daily: DataPoint[];
    weekly: DataPoint[];
    monthly: DataPoint[];
    yearly: DataPoint[];
  };
  contentData: { label: string; value: number }[];
}

export default function AnalyticsCharts({ growthData, contentData }: AnalyticsChartsProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly" | "custom">("monthly");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [customData, setCustomData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const activeData = period === "custom" ? customData : growthData[period] || [];

  const fetchCustomAnalytics = async () => {
    if (!customRange.from || !customRange.to) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?from=${customRange.from}&to=${customRange.to}`);
      const result = await res.json();
      if (result.data) {
        setCustomData(result.data);
        setPeriod("custom");
      }
    } catch (e) {
      console.error("Custom analytics failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Growth Trend Area Chart */}
      <Card className="bg-gradient-to-b from-card to-card/50">
        <CardHeader className="pb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-pink-500" /> User Sign-up Trend 
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (Total: {activeData.reduce((acc: number, d: DataPoint) => acc + d.users, 0)})
            </span>
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Range Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">View:</span>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="bg-muted/50 text-foreground text-xs font-medium px-2 py-1.5 rounded-md border outline-none cursor-pointer hover:bg-muted transition-colors"
              >
                <option value="daily">Daily (Last 7 Days)</option>
                <option value="weekly">Weekly (Last 4 Weeks)</option>
                <option value="monthly">Monthly (Last 6 Months)</option>
                <option value="yearly">Yearly (Last 3 Years)</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            {/* Custom Picker Panel */}
            {period === "custom" && (
              <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-md text-xs border animate-in fade-in-50 duration-200">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground mx-0.5" />
                <input 
                  type="date" 
                  value={customRange.from}
                  min="2026-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                  className="bg-transparent text-foreground outline-none px-1"
                />
                <span className="text-muted-foreground">to</span>
                <input 
                  type="date" 
                  value={customRange.to}
                  min="2026-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
                  className="bg-transparent text-foreground outline-none px-1"
                />
                <button 
                  onClick={fetchCustomAnalytics}
                  disabled={loading || !customRange.from || !customRange.to}
                  className="bg-primary text-primary-foreground px-2 py-1 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity font-medium ml-1"
                >
                  {loading ? "..." : "Load"}
                </button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.3} />
                <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#aaa" }}
                  itemStyle={{ color: "#EC4899" }}
                />
                <Area type="monotone" dataKey="users" stroke="#EC4899" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Content Distribution Bar Chart */}
      <Card className="bg-gradient-to-b from-card to-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" /> Content Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.3} />
                <XAxis dataKey="label" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#aaa" }}
                  itemStyle={{ color: "#3B82F6" }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
