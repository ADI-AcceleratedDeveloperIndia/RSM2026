"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, MapPin, Target, AlertTriangle,
  Building2, FileBarChart, Settings, ChevronLeft,
  ChevronRight, Shield, LogOut, CheckSquare,
  Users, Layers, Award, Sparkles, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GovUser {
  id?: string;
  email?: string;
  role?: "superadmin" | "state_admin" | "district_admin" | "verifier" | "admin";
  fullName?: string;
  district?: string;
  state?: string;
}

export default function GovLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<GovUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch live session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch((e) => console.warn("Session fetch warning:", e));
  }, []);

  if (pathname === "/gov/login") {
    return <>{children}</>;
  }

  const isDistrictAdmin = user?.role === "district_admin";
  const userDistrict = user?.district || "Hyderabad";

  // Navigation tailored by authority level
  const navItems = isDistrictAdmin
    ? [
        {
          href: `/gov?district=${encodeURIComponent(userDistrict)}`,
          label: "District Hub",
          badge: userDistrict,
          icon: LayoutDashboard,
        },
        {
          href: `/gov/actions?district=${encodeURIComponent(userDistrict)}`,
          label: "Event Sanctions",
          badge: "Local",
          icon: CheckSquare,
        },
        {
          href: `/gov/hazards?district=${encodeURIComponent(userDistrict)}`,
          label: "Hazard Dispatch (PWD)",
          badge: "Local",
          icon: AlertTriangle,
        },
        {
          href: `/gov/institutions?district=${encodeURIComponent(userDistrict)}`,
          label: "Schools & Organizers",
          badge: "Local",
          icon: Building2,
        },
        {
          href: `/gov/reports?district=${encodeURIComponent(userDistrict)}`,
          label: "DRSC Monthly Dossier",
          badge: "PDF",
          icon: FileBarChart,
        },
      ]
    : [
        { href: "/gov", label: "Statewide Mission Control", icon: LayoutDashboard },
        { href: "/gov/districts", label: "Districts Delta Rank", icon: MapPin },
        { href: "/gov/4e", label: "4E State Intelligence", icon: Target },
        { href: "/gov/actions", label: "Statewide Actions", icon: CheckSquare },
        { href: "/gov/hazards", label: "Blackspots & Hazards", icon: AlertTriangle },
        { href: "/gov/institutions", label: "Institutions Registry", icon: Building2 },
        { href: "/gov/reports", label: "Supreme Court & MoRTH Dossiers", icon: FileBarChart },
        { href: "/gov/settings", label: "Master Setup & RBAC (Excel)", icon: Settings },
      ];

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/gov/login" });
    } catch (_) {
      window.location.href = "/gov/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "bg-slate-950 text-slate-300 transition-all duration-300 ease-in-out hidden md:flex flex-col border-r border-slate-800 z-30 shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/30">
              <Shield className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white tracking-tight leading-tight">
                  {isDistrictAdmin ? "RTA Command" : "State Mission"}
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold uppercase">
                  {isDistrictAdmin ? userDistrict : "Eagle's Eye View"}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Authority Level Tag */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authority Level</div>
            <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mt-0.5">
              {isDistrictAdmin ? (
                <>
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>District Transport Officer (DTO)</span>
                </>
              ) : (
                <>
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  <span>State Technical Director / Super Admin</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1.5 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href.split("?")[0];
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-slate-850 hover:text-slate-100",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400")} />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!isCollapsed && (item as any).badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {(item as any).badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 bg-slate-900/30">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors",
              isCollapsed && "justify-center px-2"
            )}
            title="Public Site"
          >
            <Sparkles size={16} />
            {!isCollapsed && <span>Public Citizen Portal</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors",
              isCollapsed && "justify-center px-2"
            )}
            title="Sign Out"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 justify-between shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                {isDistrictAdmin ? (
                  <>
                    <MapPin className="h-4 w-4 text-amber-600 hidden sm:inline" />
                    <span>DISTRICT TRANSPORT OFFICE • {userDistrict.toUpperCase()}</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 text-indigo-600 hidden sm:inline" />
                    <span>STATE MISSION CONTROL — EAGLE'S EYE VIEW</span>
                  </>
                )}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {isDistrictAdmin 
                  ? "Head of Transport in the District — Operational Sanctions & Blackspot Coordination"
                  : "National Road Safety Action & Impact Platform • State Command"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-slate-800">
                {user?.fullName || (isDistrictAdmin ? `DTO ${userDistrict}` : "State Administrator")}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {user?.email || "official@rsm2027.gov.in"}
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-800 font-bold shadow-sm">
              {user?.fullName ? user.fullName.charAt(0) : (isDistrictAdmin ? "D" : "S")}
            </div>
          </div>
        </header>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1.5 shadow-xl animate-in slide-in-from-top-2">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              {isDistrictAdmin ? `District Transport Command (${userDistrict})` : "State Mission Navigation"}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Icon size={18} className="text-indigo-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center px-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Public Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
