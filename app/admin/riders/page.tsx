"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { themeColors } from "@/lib/themeColors";
import {
  Loader2,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Rider, FilterState } from "@/types/rider";
import FilterDrawer from "@/components/FilterDrawer";

/* ── Helpers ─────────────────────── */

function formatDateTime(date: string) {
  const d = new Date(date);
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getDurationMinutes(checkIn: string, checkOut?: string | null) {
  if (!checkOut) return "-";

  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();

  const diff = Math.floor((end - start) / (1000 * 60));
  return `${diff} min`;
}

/* ── Constants ───────────────────── */

const DEFAULT_FILTERS: FilterState = {
  searchValue: "",
  statusFilter: "all",
  dateFilter: "all",
  customDateRange: { from: "", to: "" },
  sortOrder: "latest",
};

/* ── Page ───────────────────────── */

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ── Debounce ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.searchValue), 500);
    return () => clearTimeout(t);
  }, [filters.searchValue]);

  /* ── Fetch Data ── */
  const fetchRiders = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: debouncedSearch,
        status: filters.statusFilter,
        dateRange: filters.dateFilter,
        from: filters.customDateRange.from,
        to: filters.customDateRange.to
      });

      const res = await axios.get(`/api/rider?${params.toString()}`);
      if (res.data.success) {
        setRiders(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching riders:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRiders(1);
  }, [fetchRiders]);

  /* ── Callbacks ── */
  const handleFilterChange = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* ── CSV Export ── */
  const downloadCSV = async () => {
    // For CSV, we might want all data, but for now we'll export current view
    // Or we could fetch all data without pagination for export
    try {
      const params = new URLSearchParams({
        limit: "1000", // Fetch a large amount for CSV
        search: debouncedSearch,
        status: filters.statusFilter,
        dateRange: filters.dateFilter,
        from: filters.customDateRange.from,
        to: filters.customDateRange.to
      });
      const res = await axios.get(`/api/rider?${params.toString()}`);
      const allData: Rider[] = res.data.data;

      const headers = ["FE ID", "Name", "Phone", "Token", "Check In", "Check Out", "Duration"];
      const rows = allData.map((r) => {
        const inT = formatDateTime(r.createdAt);
        const outT = r.checkedOutAt ? formatDateTime(r.checkedOutAt) : null;
        return [
          r.feId,
          r.fullName,
          r.phone,
          r.token,
          `${inT.date} ${inT.time}`,
          outT ? `${outT.date} ${outT.time}` : "-",
          getDurationMinutes(r.createdAt, r.checkedOutAt),
        ];
      });

      const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "riders_report.csv";
      a.click();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchValue) count++;
    if (filters.statusFilter !== "all") count++;
    if (filters.dateFilter !== "all") count++;
    return count;
  }, [filters]);

  /* ── UI ── */

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: themeColors.textPrimary }}>
            Rider Management
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Track and manage all rider registration records.
          </p>
        </div>
        <button 
          onClick={downloadCSV} 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-white cursor-pointer hover:opacity-90 active:scale-95"
          style={{ backgroundColor: themeColors.primary }}
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone or FE ID…"
            value={filters.searchValue}
            onChange={(e) => handleFilterChange("searchValue", e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
              color: themeColors.textPrimary,
            }}
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer hover:bg-zinc-50"
          style={{
            borderColor: activeFilterCount > 0 ? themeColors.primary : themeColors.border,
            backgroundColor: activeFilterCount > 0 ? themeColors.primary + "08" : themeColors.cardBackground,
            color: activeFilterCount > 0 ? themeColors.primary : themeColors.textPrimary,
          }}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white" style={{ backgroundColor: themeColors.primary }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-2xl border bg-white/50" style={{ borderColor: themeColors.border }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColors.primary }} />
          <p className="text-sm font-medium mt-3" style={{ color: themeColors.textSecondary }}>Loading riders...</p>
        </div>
      ) : (
        <div 
          className="border rounded-2xl overflow-hidden"
          style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }}
        >
          {/* Desktop View (Table) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: themeColors.background, borderBottom: `1px solid ${themeColors.border}` }}>
                  {[
                    "FE ID",
                    "Rider Info",
                    "Token",
                    "Check In",
                    "Check Out",
                    "Duration",
                  ].map((h) => (
                    <th key={h} className="p-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: themeColors.textSecondary }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {riders.map((r, index) => {
                  const inT = formatDateTime(r.createdAt);
                  const outT = r.checkedOutAt ? formatDateTime(r.checkedOutAt) : null;

                  return (
                    <tr 
                      key={r._id} 
                      style={{ borderBottom: index !== riders.length - 1 ? `1px solid ${themeColors.border}` : "none" }}
                      className="hover:bg-zinc-50 transition-colors"
                    >
                      <td className="p-4">
                        <span 
                          className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg border"
                          style={{ 
                            backgroundColor: themeColors.background, 
                            borderColor: themeColors.border,
                            color: themeColors.primary 
                          }}
                        >
                          {r.feId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm" style={{ color: themeColors.textPrimary }}>{r.fullName}</span>
                          <span className="text-xs" style={{ color: themeColors.textSecondary }}>{r.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-orange-500 tabular-nums">#{r.token}</span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold" style={{ color: themeColors.textPrimary }}>{inT.time}</span>
                          <span className="text-[10px] uppercase font-semibold" style={{ color: themeColors.textSecondary }}>{inT.date}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {outT ? (
                          <div className="flex flex-col">
                            <span className="font-bold" style={{ color: themeColors.textPrimary }}>{outT.time}</span>
                            <span className="text-[10px] uppercase font-semibold" style={{ color: themeColors.textSecondary }}>{outT.date}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-zinc-100 text-zinc-400">In Progress</span>
                        )}
                      </td>

                      <td className="p-4 font-bold" style={{ color: themeColors.textPrimary }}>
                        {getDurationMinutes(r.createdAt, r.checkedOutAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View (Cards) */}
          <div className="md:hidden divide-y" style={{ borderColor: themeColors.border }}>
            {riders.map((r) => {
              const inT = formatDateTime(r.createdAt);
              const outT = r.checkedOutAt ? formatDateTime(r.checkedOutAt) : null;

              return (
                <div key={r._id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-base truncate" style={{ color: themeColors.textPrimary }}>{r.fullName}</p>
                      <p className="text-sm" style={{ color: themeColors.textSecondary }}>{r.phone}</p>
                    </div>
                    <span className="font-black text-orange-500 flex-shrink-0">#{r.token}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: themeColors.textSecondary }}>Check In</p>
                      <p className="text-sm font-bold" style={{ color: themeColors.textPrimary }}>{inT.time}</p>
                      <p className="text-[10px]" style={{ color: themeColors.textSecondary }}>{inT.date}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: themeColors.textSecondary }}>Check Out</p>
                      {outT ? (
                        <>
                          <p className="text-sm font-bold" style={{ color: themeColors.textPrimary }}>{outT.time}</p>
                          <p className="text-[10px]" style={{ color: themeColors.textSecondary }}>{outT.date}</p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-zinc-400">Pending</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span 
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                      style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.primary }}
                    >
                      {r.feId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase" style={{ color: themeColors.textSecondary }}>Duration:</span>
                      <span className="text-sm font-bold" style={{ color: themeColors.textPrimary }}>{getDurationMinutes(r.createdAt, r.checkedOutAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination Footer */}
          <div 
            className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}
          >
            <p className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>
              Showing <span className="font-black" style={{ color: themeColors.textPrimary }}>{riders.length}</span> of <span className="font-black" style={{ color: themeColors.textPrimary }}>{pagination.total}</span> entries
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchRiders(pagination.page - 1)}
                className="px-4 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-white"
                style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}
              >
                Previous
              </button>
              <div className="flex items-center gap-1 mx-2">
                <span className="text-xs font-bold" style={{ color: themeColors.textPrimary }}>{pagination.page}</span>
                <span className="text-xs" style={{ color: themeColors.textSecondary }}>/</span>
                <span className="text-xs" style={{ color: themeColors.textSecondary }}>{pagination.totalPages}</span>
              </div>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchRiders(pagination.page + 1)}
                className="px-4 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-white"
                style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setIsFilterOpen(false);
        }}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
