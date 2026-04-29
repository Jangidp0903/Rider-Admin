"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { themeColors } from "@/lib/themeColors";
import {
  Loader2,
  Download,
  Search,
  SlidersHorizontal,
  Clock,
  ArrowRight,
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

function getDurationMinutes(checkIn: string, checkOut?: string | null): string {
  if (!checkOut) return "-";
  const diff = Math.floor(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60),
  );
  return `${diff} min`;
}

/* ── Constants ───────────────────── */

const DEFAULT_FILTERS: FilterState = {
  searchValue: "",
  statusFilter: "all",
  dateFilter: "all",
  customDateRange: { from: "", to: "" },
  sortOrder: "latest",
  hubFilter: "all",
};

/* ── Sub-components ─────────────── */

interface TimeBlockProps {
  dateStr: string;
  timeStr: string;
}

function TimeBlock({ dateStr, timeStr }: TimeBlockProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color: themeColors.textPrimary }}
      >
        {timeStr}
      </span>
      <span
        className="text-[11px] font-medium"
        style={{ color: themeColors.textSecondary }}
      >
        {dateStr}
      </span>
    </div>
  );
}

interface StatusPillProps {
  active: boolean;
}

function StatusPill({ active }: StatusPillProps) {
  return active ? (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: themeColors.success + "12",
        color: themeColors.success,
        border: `1px solid ${themeColors.success}25`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
        style={{ backgroundColor: themeColors.success }}
      />
      Active
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.textSecondary,
        borderColor: themeColors.border,
      }}
    >
      Completed
    </span>
  );
}

/* ── Page ───────────────────────── */

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.searchValue), 500);
    return () => clearTimeout(t);
  }, [filters.searchValue]);

  const fetchRiders = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          search: debouncedSearch,
          status: filters.statusFilter,
          dateRange: filters.dateFilter,
          hub: filters.hubFilter,
          from: filters.customDateRange.from,
          to: filters.customDateRange.to,
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
    },
    [debouncedSearch, filters],
  );

  useEffect(() => {
    fetchRiders(1);
  }, [fetchRiders]);

  const handleFilterChange = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams({
        limit: "1000",
        search: debouncedSearch,
        status: filters.statusFilter,
        dateRange: filters.dateFilter,
        from: filters.customDateRange.from,
        to: filters.customDateRange.to,
      });
      const res = await axios.get(`/api/rider?${params.toString()}`);
      const allData: Rider[] = res.data.data;

      const headers = [
        "FE ID",
        "Name",
        "Phone",
        "Token",
        "Hub",
        "Check In",
        "Check Out",
        "Duration",
      ];
      const rows = allData.map((r) => {
        const inT = formatDateTime(r.createdAt);
        const outT = r.checkedOutAt ? formatDateTime(r.checkedOutAt) : null;
        return [
          r.feId,
          r.fullName,
          r.phone,
          r.token,
          r.hubName,
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
    if (filters.hubFilter && filters.hubFilter !== "all") count++;
    return count;
  }, [filters]);

  return (
    <div className="p-1 space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: themeColors.textPrimary }}
          >
            Rider Management
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: themeColors.textSecondary }}
          >
            Track and manage all rider registration records.
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity text-white hover:opacity-90 active:scale-95"
          style={{ backgroundColor: themeColors.primary }}
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: themeColors.textSecondary }}
          >
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
            borderColor:
              activeFilterCount > 0 ? themeColors.primary : themeColors.border,
            backgroundColor:
              activeFilterCount > 0
                ? themeColors.primary + "08"
                : themeColors.cardBackground,
            color:
              activeFilterCount > 0
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

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { label: "All", value: "all" },
          { label: "Checked In", value: "checked-in" },
          { label: "Checked Out", value: "checked-out" },
        ].map((tab) => {
          const isActive = filters.statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleFilterChange("statusFilter", tab.value as any)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 cursor-pointer ${
                isActive ? "shadow-sm" : ""
              }`}
              style={{
                backgroundColor: isActive
                  ? themeColors.primary
                  : themeColors.cardBackground,
                color: isActive ? "#fff" : themeColors.textSecondary,
                borderColor: isActive ? themeColors.primary : themeColors.border,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      {loading ? (
        <div
          className="flex flex-col items-center justify-center py-32 rounded-2xl border"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.cardBackground,
          }}
        >
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: themeColors.primary }}
          />
          <p
            className="text-sm font-medium mt-3"
            style={{ color: themeColors.textSecondary }}
          >
            Loading riders...
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.cardBackground,
          }}
        >
          {/* ── Desktop Table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: themeColors.background }}>
                  {[
                    "FE ID",
                    "Rider",
                    "Token",
                    "Hub",
                    "Check In",
                    "Check Out",
                    "Duration",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        color: themeColors.textSecondary,
                        borderBottom: `1.5px solid ${themeColors.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {riders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-sm font-medium"
                      style={{ color: themeColors.textSecondary }}
                    >
                      No riders found.
                    </td>
                  </tr>
                ) : (
                  riders.map((r, index) => {
                    const inT = formatDateTime(r.createdAt);
                    const outT = r.checkedOutAt
                      ? formatDateTime(r.checkedOutAt)
                      : null;
                    const isLast = index === riders.length - 1;

                    return (
                      <tr
                        key={r._id}
                        className="transition-colors"
                        style={{
                          borderBottom: isLast
                            ? "none"
                            : `1px solid ${themeColors.border}`,
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = themeColors.background;
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = "transparent";
                        }}
                      >
                        {/* FE ID */}
                        <td className="px-5 py-4">
                          <span
                            className="font-mono text-[11px] font-bold px-2 py-1 rounded-md border"
                            style={{
                              backgroundColor: themeColors.background,
                              borderColor: themeColors.border,
                              color: themeColors.primary,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {r.feId}
                          </span>
                        </td>

                        {/* Rider Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black flex-shrink-0"
                              style={{
                                backgroundColor: themeColors.primary + "12",
                                color: themeColors.primary,
                              }}
                            >
                              {r.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: themeColors.textPrimary }}
                              >
                                {r.fullName}
                              </p>
                              <p
                                className="text-[12px] font-medium tabular-nums"
                                style={{ color: themeColors.textSecondary }}
                              >
                                {r.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Token */}
                        <td className="px-5 py-4">
                          <span
                            className="text-sm font-black tabular-nums"
                            style={{ color: themeColors.primary }}
                          >
                            #{r.token}
                          </span>
                        </td>

                        {/* Hub */}
                        <td className="px-5 py-4">
                          <span
                            className="text-[12px] font-semibold"
                            style={{ color: themeColors.textPrimary }}
                          >
                            {r.hubName}
                          </span>
                        </td>

                        {/* Check In */}
                        <td className="px-5 py-4">
                          <TimeBlock dateStr={inT.date} timeStr={inT.time} />
                        </td>

                        {/* Check Out */}
                        <td className="px-5 py-4">
                          {outT ? (
                            <TimeBlock
                              dateStr={outT.date}
                              timeStr={outT.time}
                            />
                          ) : (
                            <span
                              className="text-[11px] font-semibold"
                              style={{ color: themeColors.textSecondary }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-4">
                          {r.checkedOutAt ? (
                            <span
                              className="inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums"
                              style={{ color: themeColors.textPrimary }}
                            >
                              <Clock
                                size={12}
                                style={{ color: themeColors.textSecondary }}
                              />
                              {getDurationMinutes(r.createdAt, r.checkedOutAt)}
                            </span>
                          ) : (
                            <span
                              className="text-[12px]"
                              style={{ color: themeColors.textSecondary }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusPill active={!r.checkedOutAt} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden">
            {riders.length === 0 ? (
              <div
                className="py-16 text-center text-sm font-medium"
                style={{ color: themeColors.textSecondary }}
              >
                No riders found.
              </div>
            ) : (
              riders.map((r, index) => {
                const inT = formatDateTime(r.createdAt);
                const outT = r.checkedOutAt
                  ? formatDateTime(r.checkedOutAt)
                  : null;
                const isLast = index === riders.length - 1;

                return (
                  <div
                    key={r._id}
                    style={{
                      borderBottom: isLast
                        ? "none"
                        : `1px solid ${themeColors.border}`,
                    }}
                  >
                    <div className="p-4 space-y-3">
                      {/* Top row: avatar + name + token */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                            style={{
                              backgroundColor: themeColors.primary + "12",
                              color: themeColors.primary,
                            }}
                          >
                            {r.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-semibold text-sm truncate"
                              style={{ color: themeColors.textPrimary }}
                            >
                              {r.fullName}
                            </p>
                            <p
                              className="text-[12px]"
                              style={{ color: themeColors.textSecondary }}
                            >
                              {r.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span
                            className="text-sm font-black"
                            style={{ color: themeColors.primary }}
                          >
                            #{r.token}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                            {r.hubName}
                          </span>
                          <StatusPill active={!r.checkedOutAt} />
                        </div>
                      </div>

                      {/* Time row */}
                      <div
                        className="flex items-center gap-2 p-3 rounded-xl"
                        style={{
                          backgroundColor: themeColors.background,
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-1"
                            style={{ color: themeColors.textSecondary }}
                          >
                            Check In
                          </p>
                          <TimeBlock dateStr={inT.date} timeStr={inT.time} />
                        </div>

                        <ArrowRight
                          size={14}
                          style={{
                            color: themeColors.textSecondary,
                            flexShrink: 0,
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-1"
                            style={{ color: themeColors.textSecondary }}
                          >
                            Check Out
                          </p>
                          {outT ? (
                            <TimeBlock
                              dateStr={outT.date}
                              timeStr={outT.time}
                            />
                          ) : (
                            <span
                              className="text-sm font-semibold"
                              style={{ color: themeColors.textSecondary }}
                            >
                              Pending
                            </span>
                          )}
                        </div>

                        {r.checkedOutAt && (
                          <>
                            <div
                              className="w-px self-stretch"
                              style={{ backgroundColor: themeColors.border }}
                            />
                            <div className="flex-shrink-0 text-center">
                              <p
                                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                                style={{ color: themeColors.textSecondary }}
                              >
                                Duration
                              </p>
                              <span
                                className="text-sm font-bold tabular-nums"
                                style={{ color: themeColors.textPrimary }}
                              >
                                {getDurationMinutes(
                                  r.createdAt,
                                  r.checkedOutAt,
                                )}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Footer: FE ID */}
                      <div className="flex items-center justify-between">
                        <span
                          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: themeColors.background,
                            borderColor: themeColors.border,
                            color: themeColors.primary,
                          }}
                        >
                          {r.feId}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Pagination ── */}
          <div
            className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{
              borderTop: `1px solid ${themeColors.border}`,
              backgroundColor: themeColors.background,
            }}
          >
            <p
              className="text-xs font-medium"
              style={{ color: themeColors.textSecondary }}
            >
              Showing{" "}
              <span
                className="font-bold"
                style={{ color: themeColors.textPrimary }}
              >
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span
                className="font-bold"
                style={{ color: themeColors.textPrimary }}
              >
                {pagination.total}
              </span>{" "}
              entries
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchRiders(pagination.page - 1)}
                className="px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.textPrimary,
                  backgroundColor: themeColors.cardBackground,
                }}
              >
                Previous
              </button>

              <div className="flex items-center gap-1 px-2">
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: themeColors.textPrimary }}
                >
                  {pagination.page}
                </span>
                <span
                  className="text-xs"
                  style={{ color: themeColors.textSecondary }}
                >
                  /
                </span>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: themeColors.textSecondary }}
                >
                  {pagination.totalPages}
                </span>
              </div>

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchRiders(pagination.page + 1)}
                className="px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.textPrimary,
                  backgroundColor: themeColors.cardBackground,
                }}
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
