"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { themeColors } from "@/lib/themeColors";

interface CustomSelectProps {
  label?: string;
  icon: React.ReactNode;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

export default function CustomSelect({
  label,
  icon,
  value,
  options,
  onChange,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isOpen]);

  return (
    <div
      className="space-y-1.5 flex-1 min-w-0"
      onClick={(e) => e.stopPropagation()}
    >
      {label && (
        <p
          className="text-[10px] font-black uppercase tracking-widest px-1"
          style={{ color: themeColors.textSecondary }}
        >
          {label}
        </p>
      )}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-bold transition-all hover:bg-zinc-50/50 cursor-pointer"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.background,
            color: themeColors.textPrimary,
          }}
        >
          <span style={{ color: themeColors.textSecondary }}>{icon}</span>
          <span className="flex-1 text-left truncate">
            {selectedOption.label}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            style={{ color: themeColors.textSecondary }}
          />
        </button>

        {isOpen && (
          <div
            className="absolute z-[60] top-full mt-2 left-0 right-0 py-2 rounded-2xl border animate-in fade-in slide-in-from-top-2"
            style={{
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm font-bold transition-colors hover:bg-zinc-50 cursor-pointer"
                style={{
                  color:
                    opt.value === value
                      ? themeColors.primary
                      : themeColors.textPrimary,
                  backgroundColor:
                    opt.value === value
                      ? themeColors.primary + "08"
                      : "transparent",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
