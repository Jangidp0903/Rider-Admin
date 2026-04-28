"use client";

import { useState, useEffect } from "react";
import { themeColors } from "@/lib/themeColors";
import { Loader2 } from "lucide-react";

/* ── Types ───────────────────────── */

interface Rider {
  _id: string;
  feId: string;
  fullName: string;
  phone: string;
  token: number;
  status: "checked-in" | "checked-out";
  date: string;
  createdAt: Date;
}

/* ── Helpers ─────────────────────── */

function formatDateTime(date: Date) {
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

  return `${datePart}, ${timePart}`;
}

/* ── Status Badge ────────────────── */

function StatusBadge({ status }: { status: Rider["status"] }) {
  const isActive = status === "checked-in";

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: isActive ? "#dcfce7" : "#f1f5f9",
        color: isActive ? "#16a34a" : "#64748b",
      }}
    >
      {isActive ? "Checked In" : "Checked Out"}
    </span>
  );
}

/* ── Page ───────────────────────── */

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const res = await fetch("/api/rider");
        const data = await res.json();

        if (res.ok && data.success) {
          setRiders(data.data);
        } else {
          setError(data.error || "Failed to fetch riders");
        }
      } catch (err) {
        console.error("Error fetching riders:", err);
        setError("An error occurred while fetching riders.");
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="pb-4 border-b"
          style={{ borderColor: themeColors.border }}
        >
          <h1
            className="text-2xl font-bold"
            style={{ color: themeColors.textPrimary }}
          >
            Rider Queue Dashboard
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: themeColors.textSecondary }}
          >
            Live check-in / check-out tracking
          </p>
        </div>

        {/* States */}
        {loading ? (
          <div
            className="flex justify-center items-center py-20 border rounded-xl"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
          >
            <Loader2
              className="w-6 h-6 animate-spin mr-2"
              style={{ color: themeColors.primary }}
            />
            <span style={{ color: themeColors.textSecondary }}>
              Loading riders...
            </span>
          </div>
        ) : error ? (
          <div
            className="text-center py-10 border rounded-xl"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        ) : riders.length === 0 ? (
          <div
            className="text-center py-20 border rounded-xl"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
              color: themeColors.textSecondary,
            }}
          >
            No riders found
          </div>
        ) : (
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* Header */}
                <thead
                  style={{
                    backgroundColor: themeColors.background,
                    borderBottom: `1px solid ${themeColors.border}`,
                  }}
                >
                  <tr>
                    <th className="text-left px-4 py-3">FE ID</th>
                    <th className="text-left px-4 py-3">Full Name</th>
                    <th className="text-left px-4 py-3">Phone</th>
                    <th className="text-left px-4 py-3">Token</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Time</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {riders.map((rider, index) => (
                    <tr
                      key={rider._id}
                      className="transition-colors"
                      style={{
                        borderBottom:
                          index !== riders.length - 1
                            ? `1px solid ${themeColors.border}`
                            : "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          themeColors.background;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td className="px-4 py-3 font-medium">{rider.feId}</td>

                      <td className="px-4 py-3">{rider.fullName}</td>

                      <td className="px-4 py-3">{rider.phone}</td>

                      <td className="px-4 py-3 font-bold text-orange-500">
                        #{rider.token}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={rider.status} />
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {formatDateTime(rider.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
