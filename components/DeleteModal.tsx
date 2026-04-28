"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this? This action cannot be undone.",
  isLoading = false,
}: DeleteModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 transition-opacity duration-200"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className="
          relative w-full max-w-md
          bg-white rounded-2xl
          border transition-all duration-200
          overflow-hidden
        "
        style={{ borderColor: themeColors.border }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div
          className="h-[3px] w-full"
          style={{ backgroundColor: "#ef4444" }}
          aria-hidden="true"
        />

        <div className="p-6 sm:p-8">
          {/* Icon + Title row */}
          <div className="flex items-start gap-4 mb-5 pr-8">
            <div
              className="
                flex-shrink-0 w-10 h-10
                rounded-xl border
                flex items-center justify-center
              "
              style={{
                borderColor: "#fecaca",
                backgroundColor: "#fef2f2",
                color: "#ef4444",
              }}
              aria-hidden="true"
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1 min-w-0">
              <h3
                id="delete-modal-title"
                className="text-base font-semibold leading-snug tracking-tight"
                style={{ color: themeColors.textPrimary }}
              >
                {title}
              </h3>
              <p
                id="delete-modal-description"
                className="text-sm leading-relaxed"
                style={{ color: themeColors.textSecondary }}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px mb-6"
            style={{ backgroundColor: themeColors.border }}
            aria-hidden="true"
          />

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {/* Cancel */}
            <button
              onClick={!isLoading ? onClose : undefined}
              disabled={isLoading}
              className="
                flex-1 px-5 py-2.5
                rounded-xl cursor-pointer text-sm font-medium
                border transition-colors duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
              "
              style={{
                borderColor: themeColors.border,
                color: themeColors.textPrimary,
                backgroundColor: "white",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#f8fafc";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "white";
              }}
            >
              Cancel
            </button>

            {/* Delete */}
            <button
              onClick={!isLoading ? onConfirm : undefined}
              disabled={isLoading}
              className="
                flex-1 px-5 py-2.5
                rounded-xl cursor-pointer text-sm font-semibold text-white
                border border-transparent
                flex items-center justify-center gap-2
                transition-colors duration-150
                disabled:opacity-70 disabled:cursor-not-allowed
              "
              style={{ backgroundColor: "#ef4444" }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#dc2626";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#ef4444";
              }}
            >
              {isLoading ? (
                <>
                  <span
                    className="
                      w-4 h-4 rounded-full
                      border-2 border-white/30 border-t-white
                      animate-spin block
                    "
                    aria-hidden="true"
                  />
                  <span>Deleting…</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
