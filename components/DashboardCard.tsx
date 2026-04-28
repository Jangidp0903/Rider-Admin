"use client";

import { LucideIcon } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div
      className="rounded-md shadow p-6 border"
      style={{
        backgroundColor: themeColors.cardBackground,
        borderColor: themeColors.border,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-sm font-medium mb-1"
            style={{ color: themeColors.textSecondary }}
          >
            {title}
          </p>
          <h3
            className="text-2xl font-bold tracking-tight"
            style={{ color: themeColors.textPrimary }}
          >
            {value}
          </h3>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: themeColors.sidebarActiveBackground,
            borderColor: "rgba(79, 70, 229, 0.1)",
          }}
        >
          <Icon className="w-6 h-6" style={{ color: themeColors.primary }} />
        </div>
      </div>
    </div>
  );
}
