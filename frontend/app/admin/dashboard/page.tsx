"use client";

import StatsCard from "@/components/cards/StatsCard";
import AlertCard from "@/components/cards/AlertCard";
import { Users, Video, Bell, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import AlertTrendChart from "@/components/charts/AlertTrendChart";
import ActivityChart from "@/components/charts/ActivityChart";
import { useAlertStore } from "@/store/alertStore";
import { useCameraStore } from "@/store/cameraStore";
import { useEffect } from "react";
import { clsx } from "clsx";

export default function AdminDashboard() {
  const { alerts, fetchAlerts } = useAlertStore();
  const { cameras, fetchCameras } = useCameraStore();

  useEffect(() => {
    fetchAlerts({ limit: 5 });
    fetchCameras();
  }, [fetchAlerts, fetchCameras]);

  const stats = [
    {
      title: "Total Employees",
      value: "1,280",
      icon: Users,
      color: "blue",
      trend: { value: 12, isUp: true },
    },
    {
      title: "Active Cameras",
      value: Array.isArray(cameras) ? cameras.filter((c) => c.status === "active").length : 0,
      icon: Video,
      color: "green",
    },
    {
      title: "Alerts Today",
      value: "24",
      icon: Bell,
      color: "red",
      trend: { value: 5, isUp: false },
    },
    {
      title: "Active Workers",
      value: "842",
      icon: Activity,
      color: "yellow",
      trend: { value: 8, isUp: true },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">
          Overview
        </h1>
        <p className="text-[#94A3B8]">
          Welcome back, here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...(stat as any)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl border border-[#334155]/50 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#F1F5F9]">
              Alert Trends (Last 7 Days)
            </h3>
            <select className="bg-[#0F172A] border border-[#334155] rounded-xl text-xs px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <AlertTrendChart />
          </div>
        </div>

        <div className="glass rounded-3xl border border-[#334155]/50 p-6">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-8">
            Worker Activity
          </h3>
          <div className="h-[300px] w-full">
            <ActivityChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#F1F5F9]">Recent Alerts</h3>
            <Link
              href="/admin/alerts"
              className="text-sm font-medium text-[#2563EB] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.slice(0, 4).map((alert) => (
              <AlertCard key={alert._id || alert.id} alert={alert} />
            ))}
            {alerts.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-[#94A3B8] glass rounded-3xl border border-dashed border-[#334155]">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>No recent alerts found</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#F1F5F9]">Camera Status</h3>
          <div className="glass rounded-3xl border border-[#334155]/50 overflow-hidden">
            <div className="divide-y divide-[#334155]/50">
              {Array.isArray(cameras) && cameras.slice(0, 6).map((camera) => (
                <div key={camera._id || camera.id} className="p-4 flex items-center justify-between hover:bg-[#334155]/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-2 h-2 rounded-full',
                      camera.status === 'active' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                    )} />
                    <div>
                      <p className="text-sm font-medium text-[#F1F5F9] group-hover:text-[#2563EB] transition-colors">{camera.name}</p>
                      <p className="text-[10px] text-[#94A3B8]">{camera.location}</p>
                    </div>
                  </div>
                  <Video className="w-4 h-4 text-[#334155] group-hover:text-[#94A3B8]" />
                </div>
              ))}
              {(!Array.isArray(cameras) || cameras.length === 0) && (
                <div className="p-8 text-center text-[#94A3B8] text-sm italic">
                  No cameras registered
                </div>
              )}
            </div>
            {Array.isArray(cameras) && cameras.length > 6 && (
              <Link href="/admin/cameras" className="block p-3 text-center text-xs font-semibold text-[#2563EB] hover:bg-[#2563EB]/10 border-t border-[#334155]/50 transition-all">
                View All {cameras.length} Cameras
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
