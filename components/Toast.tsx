"use client";

import React from "react";
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    color: "#10B981",
    bg: "#ECFDF5",
    border: "#D1FAE5"
  },
  error: {
    icon: AlertCircle,
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FEE2E2"
  },
  warning: {
    icon: AlertTriangle,
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FEF3C7"
  },
  info: {
    icon: Info,
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#DBEAFE"
  }
};

const Toast = ({ id, message, type, onRemove }: ToastProps) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-xl border shadow-lg w-full sm:max-w-sm animate-in slide-in-from-top-2 sm:slide-in-from-right-2 duration-300 mb-3 pointer-events-auto"
      style={{ 
        backgroundColor: config.bg, 
        borderColor: config.border 
      }}
    >
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: themeColors.textPrimary }}>
          {message}
        </p>
      </div>
      <button 
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
        style={{ color: themeColors.textSecondary }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ 
  toasts, 
  onRemove 
}: { 
  toasts: { id: string; message: string; type: ToastType }[];
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="fixed top-4 right-4 left-4 sm:top-6 sm:right-6 sm:left-auto z-[9999] flex flex-col items-center sm:items-end pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
