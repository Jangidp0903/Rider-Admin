"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Settings, X, LayoutDashboard, Bike, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { themeColors } from "@/lib/themeColors";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Rider Details", icon: Users, path: "/admin/riders" },
  { name: "Profile Settings", icon: Settings, path: "/admin/settings" },
];

const Sidebar = ({
  isOpen,
  isCollapsed,
  onClose,
}: {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        style={{
          backgroundColor: themeColors.cardBackground,
          borderRight: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Logo Section */}
        <div
          className="h-16 flex items-center justify-start px-4 border-b"
          style={{
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.border,
          }}
        >
          {isCollapsed ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <Bike size={28} color={themeColors.primary} />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Bike size={28} color={themeColors.primary} />
              </div>
              <h2
                className="text-xl font-bold tracking-wide"
                style={{ color: themeColors.textPrimary }}
              >
                Zomato
              </h2>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <nav className="flex flex-col p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`relative flex items-center text-sm font-medium px-4 py-3 rounded-md transition-all duration-200 ${
                  isCollapsed ? "justify-center px-2" : ""
                } ${isActive ? "font-semibold" : ""}`}
                style={{
                  backgroundColor: isActive
                    ? themeColors.sidebarActiveBackground
                    : "transparent",
                  color: isActive
                    ? themeColors.primary
                    : themeColors.textSecondary,
                }}
                title={isCollapsed ? item.name : undefined}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      themeColors.sidebarActiveBackground;
                    e.currentTarget.style.color = themeColors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = themeColors.textSecondary;
                  }
                }}
              >
                {/* Active left border line */}
                {isActive && (
                  <span
                    className="absolute left-0 top-0 h-full w-[3px] rounded-r-md"
                    style={{ backgroundColor: themeColors.primary }}
                  ></span>
                )}

                {/* Icon */}
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${
                    isCollapsed ? "mx-auto" : "mr-3"
                  } transition-colors duration-200`}
                  style={{
                    color: isActive ? themeColors.primary : "currentColor",
                  }}
                />

                {/* Label */}
                {!isCollapsed && (
                  <span className="truncate tracking-wide">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: themeColors.cardBackground,
          borderRight: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Mobile Header */}
        <div
          className="h-16 flex items-center justify-between px-4 border-b"
          style={{
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Bike size={28} color={themeColors.primary} />
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: themeColors.textPrimary }}
            >
              DaemonIQ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg cursor-pointer transition-colors duration-200"
            style={{ color: themeColors.textSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                themeColors.sidebarActiveBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className="flex flex-col p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`relative flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive ? "font-semibold" : ""
                }`}
                style={{
                  backgroundColor: isActive
                    ? themeColors.sidebarActiveBackground
                    : "transparent",
                  color: isActive
                    ? themeColors.primary
                    : themeColors.textSecondary,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      themeColors.sidebarActiveBackground;
                    e.currentTarget.style.color = themeColors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = themeColors.textSecondary;
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-0 h-full w-[3px] rounded-r-md"
                    style={{ backgroundColor: themeColors.primary }}
                  ></span>
                )}
                <Icon
                  size={20}
                  className="mr-3 flex-shrink-0 transition-colors duration-200"
                  style={{
                    color: isActive ? themeColors.primary : "currentColor",
                  }}
                />
                <span className="tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
