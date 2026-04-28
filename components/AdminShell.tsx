"use client";
import { useState } from "react";
import { themeColors } from "@/lib/themeColors";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSidebarCollapse = () => setIsCollapsed(!isCollapsed);
  const closeSidebar = () => setIsOpen(false);

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: themeColors.background }}
    >
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        isOpen={isOpen}
        isCollapsed={isCollapsed}
        onClose={closeSidebar}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Topbar
          onToggleSidebar={toggleSidebar}
          onToggleCollapse={toggleSidebarCollapse}
          sidebarCollapsed={isCollapsed}
        />
        <main
          className="flex-1 p-2 mt-16"
          style={{ backgroundColor: themeColors.background }}
        >
          <div className="max-w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
