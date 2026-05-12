"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { HUB_OPTIONS } from "@/lib/constants";

import axios from "axios";

interface SubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  icon: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group relative">
      {/* Label */}
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1 ml-1">
        {label}
      </label>

      {/* 🔵 MOBILE SELECT */}
      <div
        className="relative flex items-center border rounded-lg px-3 py-2 transition-colors md:hidden"
        style={{
          borderColor: themeColors.border,
          backgroundColor: themeColors.background,
        }}
      >
        <span className="mr-2 text-zinc-500">{icon}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 bg-transparent text-xs font-medium outline-none appearance-none cursor-pointer ${
            value ? "text-zinc-900" : "text-zinc-400"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 text-zinc-400 pointer-events-none"
        />
      </div>

      {/* 🟢 DESKTOP CUSTOM SELECT */}
      <div className="hidden md:block">
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center border rounded-lg px-3 py-2 cursor-pointer transition-all"
          style={{
            borderColor: isOpen ? themeColors.primary : themeColors.border,
            backgroundColor: themeColors.background,
          }}
        >
          <span
            className={`mr-2 ${isOpen || value ? "" : "text-zinc-500"}`}
            style={{ color: isOpen || value ? themeColors.primary : undefined }}
          >
            {icon}
          </span>
          <div className="flex-1 text-xs font-medium">
            {value ? (
              <span className="text-zinc-900">
                {options.find((o) => o.value === value)?.label || value}
              </span>
            ) : (
              <span className="text-zinc-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            style={{ color: isOpen ? themeColors.primary : undefined }}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl max-h-[150px] overflow-y-auto"
            style={{ borderColor: themeColors.border }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 text-xs cursor-pointer transition-colors ${
                  value === option.value ? "font-bold" : "hover:bg-zinc-50"
                }`}
                style={{
                  backgroundColor:
                    value === option.value
                      ? themeColors.primary + "10"
                      : undefined,
                  color:
                    value === option.value
                      ? themeColors.primary
                      : themeColors.textPrimary,
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}

        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default function SubAdminModal({
  isOpen,
  onClose,
  onSuccess,
}: SubAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    hubName: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/sub-admin", formData);
      if (res.data.success) {
        setFormData({ name: "", email: "", phoneNumber: "", hubName: "" });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md bg-white rounded-xl overflow-hidden"
        style={{ backgroundColor: themeColors.cardBackground }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: themeColors.border }}
        >
          <h3
            className="text-base font-semibold"
            style={{ color: themeColors.textPrimary }}
          >
            Add New Sub Admin
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-zinc-100"
            style={{ color: themeColors.textSecondary }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-2 rounded-lg bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <CustomSelect
              label="Assigned Hub"
              icon={<MapPin size={14} />}
              value={formData.hubName}
              onChange={(v) => setFormData({ ...formData, hubName: v })}
              options={HUB_OPTIONS}
            />
          </div>

          <div className="space-y-1">
            <label
              className="text-[10px] font-semibold uppercase tracking-wider ml-1"
              style={{ color: themeColors.textSecondary }}
            >
              Full Name
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: themeColors.textSecondary }}
              />
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-9 pr-4 py-2 rounded-lg border outline-none text-xs transition-all focus:ring-4"
                style={
                  {
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.background,
                    color: themeColors.textPrimary,
                    "--tw-ring-color": themeColors.primary + "10",
                  } as any
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              className="text-[10px] font-semibold uppercase tracking-wider ml-1"
              style={{ color: themeColors.textSecondary }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: themeColors.textSecondary }}
              />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-9 pr-4 py-2 rounded-lg border outline-none text-xs transition-all focus:ring-4"
                style={
                  {
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.background,
                    color: themeColors.textPrimary,
                    "--tw-ring-color": themeColors.primary + "10",
                  } as any
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              className="text-[10px] font-semibold uppercase tracking-wider ml-1"
              style={{ color: themeColors.textSecondary }}
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: themeColors.textSecondary }}
              />
              <input
                type="tel"
                required
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full pl-9 pr-4 py-2 rounded-lg border outline-none text-xs transition-all focus:ring-4"
                style={
                  {
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.background,
                    color: themeColors.textPrimary,
                    "--tw-ring-color": themeColors.primary + "10",
                  } as any
                }
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl cursor-pointer text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Sub Admin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
