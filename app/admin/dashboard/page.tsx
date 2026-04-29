"use client";

import { useState, useEffect, useMemo } from "react";
import axios, { AxiosError } from "axios";
import DashboardCard from "@/components/DashboardCard";
import { Users, UserCheck, UserX, Clock, Loader2 } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

interface Rider {
  _id: string;
  status: "checked-in" | "checked-out";
  createdAt: string;
}

export default function Dashboard() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const res = await axios.get("/api/rider");
        if (res.data.success) {
          setRiders(res.data.data);
        } else {
          setError(res.data.error || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        const axiosError = err as AxiosError<{ error: string }>;
        setError(axiosError.response?.data?.error || "Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  const stats = useMemo(() => {
    const totalRiders = riders.length;
    const checkedIn = riders.filter((r) => r.status === "checked-in").length;
    const checkedOut = riders.filter((r) => r.status === "checked-out").length;
    
    // Calculate today's registrations
    const today = new Date().toDateString();
    const todayCount = riders.filter((r) => 
      new Date(r.createdAt).toDateString() === today
    ).length;

    return {
      totalRiders,
      checkedIn,
      checkedOut,
      todayCount,
    };
  }, [riders]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColors.primary }} />
        <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
          Loading dashboard data...
        </p>
      </div>
    );
  }

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

        {error && (
          <div
            className="p-4 rounded-xl border text-sm font-medium"
            style={{
              backgroundColor: themeColors.error + "10",
              borderColor: themeColors.error + "30",
              color: themeColors.error,
            }}
          >
            {error}
          </div>
        )}

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
          <DashboardCard title="Today's Total" value={stats.todayCount} icon={Clock} />
        </div>
      </div>
    </div>
  );
}
