"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, Calendar, ArrowUpDown, X, SlidersHorizontal } from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import CustomSelect from "./CustomSelect";
import { FilterState, StatusFilterType, SortOrderType, DateFilterType } from "@/types/rider";

/* ── Constants ── */
const DEFAULT_FILTERS: FilterState = {
  searchValue: "",
  statusFilter: "all",
  dateFilter: "all",
  customDateRange: { from: "", to: "" },
  sortOrder: "latest",
};

/* ── Filter Content (shared between desktop panel and mobile modal) ── */

interface FilterContentProps {
  filters: FilterState;
  onChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  hideSearch?: boolean;
}

function FilterContent({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
  hideSearch = false,
}: FilterContentProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      {!hideSearch && (
        <div className="space-y-1">
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: themeColors.textSecondary }}
          >
            Search
          </p>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: themeColors.textSecondary }}
            >
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Name, phone or FE ID…"
              value={filters.searchValue}
              onChange={(e) => onChange("searchValue", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.background,
                color: themeColors.textPrimary,
              }}
            />
          </div>
        </div>
      )}

      {/* Row: Status + Sort */}
      <div className="grid grid-cols-2 gap-4">
        <CustomSelect
          label="Status"
          icon={<Filter size={14} />}
          value={filters.statusFilter}
          onChange={(v) => onChange("statusFilter", v as StatusFilterType)}
          options={[
            { label: "All Status", value: "all" },
            { label: "Checked In", value: "checked-in" },
            { label: "Checked Out", value: "checked-out" },
          ]}
        />

        <CustomSelect
          label="Sort Order"
          icon={<ArrowUpDown size={14} />}
          value={filters.sortOrder}
          onChange={(v) => onChange("sortOrder", v as SortOrderType)}
          options={[
            { label: "Latest First", value: "latest" },
            { label: "Oldest First", value: "oldest" },
          ]}
        />
      </div>

      {/* Date Range */}
      <CustomSelect
        label="Date Range"
        icon={<Calendar size={14} />}
        value={filters.dateFilter}
        onChange={(v) => onChange("dateFilter", v as DateFilterType)}
        options={[
          { label: "All Time", value: "all" },
          { label: "Today", value: "today" },
          { label: "Yesterday", value: "yesterday" },
          { label: "Last 7 Days", value: "last7" },
          { label: "Custom Range", value: "custom" },
        ]}
      />

      {/* Custom Date Range */}
      {filters.dateFilter === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: themeColors.textSecondary }}
            >
              From
            </p>
            <input
              type="date"
              value={filters.customDateRange.from}
              onChange={(e) =>
                onChange("customDateRange", {
                  ...filters.customDateRange,
                  from: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.background,
                color: themeColors.textPrimary,
              }}
            />
          </div>
          <div className="space-y-1">
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: themeColors.textSecondary }}
            >
              To
            </p>
            <input
              type="date"
              value={filters.customDateRange.to}
              onChange={(e) =>
                onChange("customDateRange", {
                  ...filters.customDateRange,
                  to: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.background,
                color: themeColors.textPrimary,
              }}
            />
          </div>
        </div>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
          style={{
            borderColor: themeColors.border,
            color: themeColors.textSecondary,
            backgroundColor: themeColors.background,
          }}
        >
          <X size={14} />
          Reset all filters
        </button>
      )}
    </div>
  );
}

/* ── Filter Drawer (Side Modal) ── */

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (tempFilters: FilterState) => void;
  activeFilterCount: number;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  activeFilterCount,
}: FilterDrawerProps) {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Sync temp filters with actual filters whenever drawer opens
  // We handle this by using a key on the component in the parent

  const handleTempChange = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setTempFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleTempReset = useCallback(() => {
    // Resetting inside drawer only affects temp state until Apply is clicked
    setTempFilters({
      ...DEFAULT_FILTERS,
      searchValue: filters.searchValue, // Keep search value as it's external
    });
  }, [filters.searchValue]);

  const tempHasActiveFilters = useMemo(() => {
    return (
      tempFilters.statusFilter !== "all" ||
      tempFilters.dateFilter !== "all" ||
      tempFilters.sortOrder !== "latest"
    );
  }, [tempFilters]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Side Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm overflow-hidden"
        style={{
          backgroundColor: themeColors.cardBackground,
          animation: "slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: themeColors.border }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={18}
              style={{ color: themeColors.primary }}
            />
            <span
              className="text-lg font-black"
              style={{ color: themeColors.textPrimary }}
            >
              Filter Options
            </span>
            {activeFilterCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-black"
                style={{
                  backgroundColor: themeColors.primary,
                  color: "#fff",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-zinc-100"
            style={{ backgroundColor: themeColors.background }}
          >
            <X size={20} style={{ color: themeColors.textSecondary }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <FilterContent
            filters={tempFilters}
            onChange={handleTempChange}
            onReset={handleTempReset}
            hasActiveFilters={tempHasActiveFilters}
            hideSearch={true}
          />
        </div>

        {/* Footer */}
        <div
          className="px-6 py-6 border-t flex-shrink-0 flex gap-3"
          style={{ borderColor: themeColors.border }}
        >
          <button
            onClick={() => onApply(tempFilters)}
            className="flex-[2] py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: themeColors.primary }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
