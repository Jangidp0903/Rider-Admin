"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { themeColors } from "@/lib/themeColors";
import {
  Loader2,
  Download,
  Search,
  Users,
  CheckCircle2,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";

import { 
  Rider, 
  FilterState, 
} from "@/types/rider";
import FilterDrawer from "@/components/FilterDrawer";

/* ── Helpers ─────────────────────── */

function formatDateTime(date: string): { date: string; time: string } {
  const d = new Date(date);
  const datePart = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date: datePart, time: timePart };
}

/* ── Stat Card ───────────────────── */

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border"
      style={{
        backgroundColor: themeColors.cardBackground,
        borderColor: themeColors.border,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accent + "18", color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="text-xs font-semibold uppercase tracking-wider truncate"
          style={{ color: themeColors.textSecondary }}
        >
          {label}
        </p>
        <p
          className="text-xl font-black tabular-nums"
          style={{ color: themeColors.textPrimary }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Status Badge ────────────────── */

function StatusBadge({ status }: { status: Rider["status"] }) {
  const isActive = status === "checked-in";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{
        backgroundColor: isActive ? "#dcfce7" : "#f1f5f9",
        color: isActive ? "#15803d" : "#64748b",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: isActive ? "#16a34a" : "#94a3b8" }}
      />
      {isActive ? "Checked In" : "Checked Out"}
    </span>
  );
}

/* ── Page ───────────────────────── */

const DEFAULT_FILTERS: FilterState = {
  searchValue: "",
  statusFilter: "all",
  dateFilter: "all",
  customDateRange: { from: "", to: "" },
  sortOrder: "latest",
};

export default function RidersPage() {
  // Data state
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state (unified)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Mobile filter modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.searchValue),
      300,
    );
    return () => clearTimeout(timer);
  }, [filters.searchValue]);

  // Fetch data
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const res = await axios.get("/api/rider");
        if (res.data.success) {
          setRiders(res.data.data);
        } else {
          setError(res.data.error ?? "Failed to fetch riders");
        }
      } catch (err) {
        console.error("Error fetching riders:", err);
        const axiosError = err as AxiosError<{ error: string }>;
        setError(axiosError.response?.data?.error ?? "An error occurred while fetching riders.");
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  // Unified filter change handler
  const handleFilterChange = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const checkedIn = riders.filter((r) => r.status === "checked-in").length;
    return {
      total: riders.length,
      checkedIn,
      checkedOut: riders.length - checkedIn,
    };
  }, [riders]);

  // Active filter count (for badge)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchValue) count++;
    if (filters.statusFilter !== "all") count++;
    if (filters.dateFilter !== "all") count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Filtered & sorted data
  const filteredRiders = useMemo(() => {
    let result = [...riders];

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.fullName.toLowerCase().includes(s) ||
          r.phone.includes(s) ||
          r.feId.toLowerCase().includes(s),
      );
    }

    if (filters.statusFilter !== "all") {
      result = result.filter((r) => r.status === filters.statusFilter);
    }

    if (filters.dateFilter !== "all") {
      const now = new Date();
      result = result.filter((r) => {
        const rDate = new Date(r.createdAt);
        if (filters.dateFilter === "today")
          return rDate.toDateString() === now.toDateString();
        if (filters.dateFilter === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          return rDate.toDateString() === yesterday.toDateString();
        }
        if (filters.dateFilter === "last7") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return rDate >= sevenDaysAgo;
        }
        if (
          filters.dateFilter === "custom" &&
          filters.customDateRange.from &&
          filters.customDateRange.to
        ) {
          const from = new Date(filters.customDateRange.from);
          from.setHours(0, 0, 0, 0);
          const to = new Date(filters.customDateRange.to);
          to.setHours(23, 59, 59, 999);
          return rDate >= from && rDate <= to;
        }
        return true;
      });
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return filters.sortOrder === "latest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [riders, debouncedSearch, filters]);

  // Export CSV
  const downloadCSV = () => {
    if (filteredRiders.length === 0) return;
    const headers = [
      "FE ID",
      "Full Name",
      "Phone",
      "Token",
      "Status",
      "Date/Time",
    ];
    const rows = filteredRiders.map((rider) => {
      const { date, time } = formatDateTime(rider.createdAt);
      return [
        `"${rider.feId}"`,
        `"${rider.fullName}"`,
        `"${rider.phone}"`,
        `"${rider.token}"`,
        `"${rider.status}"`,
        `"${date}, ${time}"`,
      ];
    });
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `riders_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: themeColors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: themeColors.primary }}
            >
              Dashboard
            </p>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: themeColors.textPrimary }}
            >
              Rider Management
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textSecondary }}
            >
              Track, filter, and manage all rider check-in records.
            </p>
          </div>
          <button
            onClick={downloadCSV}
            disabled={filteredRiders.length === 0 || loading}
            className="self-start sm:self-auto cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white flex-shrink-0"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* ── Stat Cards ── */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="Total Riders"
              value={stats.total}
              icon={<Users size={18} />}
              accent={themeColors.primary}
            />
            <StatCard
              label="Checked In"
              value={stats.checkedIn}
              icon={<CheckCircle2 size={18} />}
              accent="#16a34a"
            />
            <StatCard
              label="Checked Out"
              value={stats.checkedOut}
              icon={<LogOut size={18} />}
              accent="#64748b"
            />
          </div>
        )}

        {/* ── Search & Filter Row ── */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: themeColors.textSecondary }}
            >
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, phone or FE ID…"
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
              className="w-full pl-11 pr-4 py-3 rounded-2xl border outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBackground,
                color: themeColors.textPrimary,
              }}
            />
          </div>
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all hover:translate-y-[-1px] cursor-pointer"
            style={{
              borderColor: hasActiveFilters
                ? themeColors.primary
                : themeColors.border,
              backgroundColor: hasActiveFilters
                ? themeColors.primary + "08"
                : themeColors.cardBackground,
              color: hasActiveFilters
                ? themeColors.primary
                : themeColors.textPrimary,
            }}
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                style={{ backgroundColor: themeColors.primary }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div
            className="flex flex-col justify-center items-center py-32 rounded-2xl border"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
          >
            <Loader2
              className="w-7 h-7 animate-spin mb-3"
              style={{ color: themeColors.primary }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: themeColors.textSecondary }}
            >
              Loading rider data…
            </span>
          </div>
        ) : error ? (
          <div
            className="text-center py-20 rounded-2xl border"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
          >
            <p
              className="font-bold text-base mb-1"
              style={{ color: "#b91c1c" }}
            >
              Failed to load data
            </p>
            <p className="text-sm" style={{ color: "#ef4444" }}>
              {error}
            </p>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-28 rounded-2xl border"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: themeColors.background }}
            >
              <Search size={24} style={{ color: themeColors.textSecondary }} />
            </div>
            <p
              className="text-base font-bold mb-1"
              style={{ color: themeColors.textPrimary }}
            >
              No riders found
            </p>
            <p
              className="text-sm text-center max-w-xs"
              style={{ color: themeColors.textSecondary }}
            >
              No records match your current filters. Try adjusting your search.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 px-5 py-2 rounded-xl text-sm font-bold border transition-colors"
              style={{
                borderColor: themeColors.border,
                color: themeColors.primary,
                backgroundColor: themeColors.background,
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
          >
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                    }}
                  >
                    {[
                      "FE ID",
                      "Rider",
                      "Contact",
                      "Token",
                      "Status",
                      "Registered",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                        style={{ color: themeColors.textSecondary }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRiders.map((rider, index) => {
                    const { date, time } = formatDateTime(rider.createdAt);
                    return (
                      <tr
                        key={rider._id}
                        style={{
                          borderBottom:
                            index !== filteredRiders.length - 1
                              ? `1px solid ${themeColors.border}`
                              : "none",
                        }}
                      >
                        <td className="px-5 py-4">
                          <span
                            className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: themeColors.primary + "12",
                              color: themeColors.primary,
                            }}
                          >
                            {rider.feId}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p
                            className="font-bold text-sm"
                            style={{ color: themeColors.textPrimary }}
                          >
                            {rider.fullName}
                          </p>
                        </td>
                        <td
                          className="px-5 py-4 text-sm"
                          style={{ color: themeColors.textSecondary }}
                        >
                          {rider.phone}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="font-black text-base tabular-nums"
                            style={{ color: "#f97316" }}
                          >
                            #{rider.token}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={rider.status} />
                        </td>
                        <td className="px-5 py-4">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: themeColors.textPrimary }}
                          >
                            {date}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: themeColors.textSecondary }}
                          >
                            {time}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div
              className="md:hidden divide-y"
              style={{ borderColor: themeColors.border }}
            >
              {filteredRiders.map((rider) => {
                const { date, time } = formatDateTime(rider.createdAt);
                return (
                  <div key={rider._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="font-bold text-sm truncate"
                          style={{ color: themeColors.textPrimary }}
                        >
                          {rider.fullName}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: themeColors.textSecondary }}
                        >
                          {rider.phone}
                        </p>
                      </div>
                      <StatusBadge status={rider.status} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
                        style={{
                          backgroundColor: themeColors.primary + "12",
                          color: themeColors.primary,
                        }}
                      >
                        {rider.feId}
                      </span>
                      <span
                        className="font-black text-sm"
                        style={{ color: "#f97316" }}
                      >
                        #{rider.token}
                      </span>
                      <span
                        className="text-xs ml-auto"
                        style={{ color: themeColors.textSecondary }}
                      >
                        {date} · {time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3.5 border-t flex flex-wrap items-center justify-between gap-2"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.background,
              }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: themeColors.textSecondary }}
              >
                Showing{" "}
                <span
                  className="font-black"
                  style={{ color: themeColors.textPrimary }}
                >
                  {filteredRiders.length}
                </span>{" "}
                of{" "}
                <span
                  className="font-black"
                  style={{ color: themeColors.textPrimary }}
                >
                  {riders.length}
                </span>{" "}
                entries
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Filter Side Drawer ── */}
      <FilterDrawer
        key={isFilterOpen ? "open" : "closed"}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setIsFilterOpen(false);
        }}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
