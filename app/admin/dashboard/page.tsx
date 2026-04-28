"use client";

import DashboardCard from "@/components/DashboardCard";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

export default function Dashboard() {
  // Rider dummy stats
  const stats = {
    totalRiders: 42,
    checkedIn: 28,
    checkedOut: 10,
    pending: 4,
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="w-full max-w-full mx-auto space-y-8">
        {/* Header */}
        <div
          className="pb-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: themeColors.border }}
        >
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: themeColors.textPrimary }}
            >
              Rider Overview
            </h1>
            <p
              className="mt-1.5 text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              Live status of all riders in your system.
            </p>
          </div>
        </div>

        {/* Rider Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Riders"
            value={stats.totalRiders}
            icon={Users}
          />
          <DashboardCard
            title="Checked In"
            value={stats.checkedIn}
            icon={UserCheck}
          />
          <DashboardCard
            title="Checked Out"
            value={stats.checkedOut}
            icon={UserX}
          />
          <DashboardCard title="Pending" value={stats.pending} icon={Clock} />
        </div>
      </div>
    </div>
  );
}
