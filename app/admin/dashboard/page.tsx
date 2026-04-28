"use client";

import DashboardCard from "@/components/DashboardCard";
import { FolderKanban, FileText, Mail, Activity } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

export default function Dashboard() {
  // Static data
  const stats = {
    projects: 12,
    blogs: 8,
    contacts: 23,
    visitors: "12,482",
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="w-full max-w-full mx-auto space-y-8">
        {/* Page Header */}
        <div
          className="pb-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: themeColors.border }}
        >
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: themeColors.textPrimary }}
            >
              Overview
            </h1>
            <p
              className="mt-1.5 text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Projects"
            value={stats.projects}
            icon={FolderKanban}
          />
          <DashboardCard
            title="Total Blogs"
            value={stats.blogs}
            icon={FileText}
          />
          <DashboardCard
            title="Contact Enquiries"
            value={stats.contacts}
            icon={Mail}
          />
          <DashboardCard
            title="Site Visitors"
            value={stats.visitors}
            icon={Activity}
          />
        </div>
      </div>
    </div>
  );
}
