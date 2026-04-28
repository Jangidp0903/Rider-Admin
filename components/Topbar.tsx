"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { themeColors } from "@/lib/themeColors";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";

const Topbar = ({
  onToggleSidebar,
  onToggleCollapse,
  sidebarCollapsed,
}: {
  onToggleSidebar: () => void;
  onToggleCollapse: () => void;
  sidebarCollapsed: boolean;
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const { showToast } = useToast();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const userBtnRef = useRef(null);

  const [pageTitle] = useState("Dashboard");
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await apiClient.get("/api/auth/me");
        if (res.data && res.data.username) {
          setAdminName(res.data.username);
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };
    fetchAdmin();
  }, []);

  // Device detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      showToast("Logout successfully", "success");
      window.location.href = "/login";
    } catch {
      showToast("Logout failed", "error");
    }
    setShowUserDropdown(false);
  };

  const headerStyle = {
    left: isDesktop ? (sidebarCollapsed ? "5rem" : "16rem") : "0",
  };

  return (
    <header
      className="fixed top-0 right-0 h-16 px-3 sm:px-4 md:px-6 flex justify-between items-center z-20 transition-all duration-300 ease-in-out"
      style={{
        ...headerStyle,
        backgroundColor: themeColors.cardBackground,
        borderBottom: `1px solid ${themeColors.border}`,
      }}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 cursor-pointer rounded-xl transition"
          style={{
            backgroundColor: themeColors.sidebarActiveBackground,
            color: themeColors.textSecondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              themeColors.sidebarActiveBackground;
          }}
        >
          <Menu size={20} />
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 cursor-pointer rounded-xl transition"
          style={{
            backgroundColor: themeColors.sidebarActiveBackground,
            color: themeColors.textSecondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              themeColors.sidebarActiveBackground;
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>

        <h1
          className="text-base sm:text-lg lg:text-xl font-bold truncate max-w-[140px] sm:max-w-none"
          style={{ color: themeColors.primary }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* ---------- User Dropdown ---------- */}
        <div className="relative">
          <button
            ref={userBtnRef}
            onClick={() => setShowUserDropdown((v) => !v)}
            className="flex items-center space-x-2 sm:space-x-3 rounded-xl px-2 sm:px-3 py-1 transition cursor-pointer"
            style={{
              backgroundColor: themeColors.background,
              border: `2px solid ${themeColors.border}`,
              color: themeColors.textSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                themeColors.sidebarActiveBackground;
              e.currentTarget.style.borderColor = themeColors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.background;
              e.currentTarget.style.borderColor = themeColors.border;
            }}
          >
            <div className="hidden sm:block text-right">
              <p
                className="text-sm font-bold truncate max-w-[80px] sm:max-w-none"
                style={{ color: themeColors.textPrimary }}
              >
                {adminName}
              </p>
            </div>
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2"
              style={{
                backgroundColor: themeColors.primary,
                borderColor: themeColors.primaryHover,
              }}
            >
              <User size={18} className="text-white" />
            </div>
          </button>

          {showUserDropdown && (
            <div
              ref={userDropdownRef}
              className="absolute right-0 mt-3 w-48 sm:w-56 rounded-lg border-2 overflow-hidden z-50"
              style={{
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.border,
              }}
            >
              <div
                className="px-4 py-3 border-b-2"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2"
                    style={{
                      backgroundColor: themeColors.primary,
                      borderColor: themeColors.primaryHover,
                    }}
                  >
                    <User size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: themeColors.textPrimary }}
                    >
                      {adminName}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Administrator
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <Link
                  href="/admin/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-3 px-4 py-3 transition border-l-4 border-transparent"
                  style={{ color: themeColors.textPrimary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      themeColors.sidebarActiveBackground;
                    e.currentTarget.style.color = themeColors.primary;
                    e.currentTarget.style.borderColor = themeColors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = themeColors.textPrimary;
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <Settings size={18} />
                  <span className="font-semibold text-sm">
                    Profile Settings
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 transition border-l-4 border-transparent"
                  style={{ color: themeColors.textPrimary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      themeColors.sidebarActiveBackground;
                    e.currentTarget.style.color = themeColors.primary;
                    e.currentTarget.style.borderColor = themeColors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = themeColors.textPrimary;
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <LogOut size={18} />
                  <span className="font-semibold text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
