"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MapPin, Target, AlertTriangle,
  Building2, FileBarChart, Settings, ChevronLeft,
  ChevronRight, Shield, LogOut, LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const govNavItems = [
  { href: "/gov", label: "Mission Control", icon: LayoutDashboard },
  { href: "/gov/districts", label: "Districts", icon: MapPin },
  { href: "/gov/4e", label: "4E Intelligence", icon: Target },
  { href: "/gov/actions", label: "Actions", icon: Target },
  { href: "/gov/hazards", label: "Hazards", icon: AlertTriangle },
  { href: "/gov/institutions", label: "Institutions", icon: Building2 },
  { href: "/gov/reports", label: "Reports", icon: FileBarChart },
  { href: "/gov/settings", label: "Settings", icon: Settings },
];

export default function GovLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  if (pathname === "/gov/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-500" />
            {!isCollapsed && (
              <span className="font-bold text-lg text-white">Gov Portal</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {govNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                  isActive
                    ? "bg-indigo-600 text-white font-medium"
                    : "hover:bg-slate-800 hover:text-white",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className={cn(isActive ? "text-indigo-200" : "")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Back to Public Site" : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Public Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">
            GOVERNMENT MISSION CONTROL
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Admin User</span>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
