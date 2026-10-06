"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Home,
  ChevronDown,
  Sparkles,
  Scale,
  Cpu,
  ShieldCheck,
  GraduationCap,
  ShieldHalf,
  Users,
  Heart,
  Target,
  AlertTriangle,
  Building2,
  CalendarDays,
  Award,
  ArrowRight
} from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [mobileActivityOpen, setMobileActivityOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("i18nextLng") || "en";
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActivityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = (lang: "en" | "te") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const isTe = i18n.language === "te";

  // Sub-items for the Activity Menu
  const activityItems = [
    {
      href: "/basics",
      label: isTe ? "బేసిక్స్" : "Basics",
      sublabel: isTe ? "అందరికీ రోడ్ నియమాలు" : "Traffic Rules (For All)",
      icon: Scale,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      href: "/simulation",
      label: isTe ? "సిమ్యులేషన్" : "Simulation Lab",
      sublabel: isTe ? "స్కూల్ విద్యార్థుల ల్యాబ్" : "Gamified Scenarios (School)",
      icon: Cpu,
      color: "text-blue-600 bg-blue-50",
    },
    {
      href: "/quiz",
      label: isTe ? "క్విజ్" : "Quiz Challenge",
      sublabel: isTe ? "నాలెడ్జ్ ఛాలెంజ్ & మెరిట్" : "15 Questions (Inter)",
      icon: ShieldCheck,
      color: "text-purple-600 bg-purple-50",
    },
    {
      href: "/guides",
      label: isTe ? "సేఫ్టీ గైడ్స్" : "Safety Guides",
      sublabel: isTe ? "రైడింగ్ మార్గదర్శకాలు" : "Defensive Commuting (UG)",
      icon: GraduationCap,
      color: "text-amber-600 bg-amber-50",
    },
    {
      href: "/prevention",
      label: isTe ? "నివారణ" : "Prevention",
      sublabel: isTe ? "వాహన రక్షణ అలవాట్లు" : "Vehicle & Habit Checks (Grads)",
      icon: ShieldHalf,
      color: "text-rose-600 bg-rose-50",
    },
    {
      href: "/club",
      label: isTe ? "రోడ్ సురక్ష క్లబ్" : "Safety Club",
      sublabel: isTe ? "సంస్థల క్లబ్ నెట్‌వర్క్" : "Institutional Chapters",
      icon: Users,
      color: "text-cyan-600 bg-cyan-50",
    },
    {
      href: "/special",
      label: isTe ? "కుటుంబ ప్రతిజ్ఞ" : "Parents Pledge",
      sublabel: isTe ? "సురక్ష కుటుంబ వాగ్దానం" : "Family Road Safety Pledge",
      icon: Heart,
      color: "text-red-600 bg-red-50",
      isSpecial: true,
    },
  ];

  const isActivityActive = [
    "/activity",
    "/activities",
    "/basics",
    "/simulation",
    "/quiz",
    "/guides",
    "/prevention",
    "/club",
    "/special",
  ].some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-emerald-100 shadow-[0_4px_20px_rgba(0,109,74,0.06)]">
      <div className="rs-container">
        <div className="flex h-20 items-center justify-between gap-2 sm:gap-4">
          {/* Dignitary Frames & Emblem */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-white shadow-[0_6px_16px_rgba(13,148,94,0.14)]"
              title="Hon'ble Chief Minister"
            >
              <Image
                src="/assets/leadership/chief-minister-placeholder.svg"
                alt="Hon'ble Chief Minister"
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
              />
            </div>
            <Link href="/" className="flex items-center" title="State Government • Transport Department">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-emerald-200 bg-white flex items-center justify-center shadow-[0_6px_16px_rgba(13,148,94,0.14)] hover:border-emerald-400 transition-colors">
                <Image
                  src="/assets/logo/state-government-emblem.svg"
                  alt="State Government Transport Department"
                  width={48}
                  height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                />
              </div>
            </Link>
            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-white shadow-[0_6px_16px_rgba(13,148,94,0.14)]"
              title="Hon'ble Transport Minister"
            >
              <Image
                src="/assets/leadership/transport-minister-placeholder.svg"
                alt="Hon'ble Transport Minister"
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-emerald-100 bg-white/80 px-2 py-1 shadow-[0_8px_20px_rgba(24,90,64,0.08)]">
            {/* 1. Home */}
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === "/"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>{t("home") || "Home"}</span>
            </Link>

            {/* 2. ACTIVITY (Dropdown containing all previous modules) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setActivityDropdownOpen(true)}
              onMouseLeave={() => setActivityDropdownOpen(false)}
            >
              <Link
                href="/activities"
                onClick={() => setActivityDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActivityActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("activity") || "Activity"}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    activityDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {/* Activity Dropdown Menu */}
              {activityDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-950/10 p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      {isTe ? "అన్ని రోడ్ సురక్ష కార్యక్రమాలు" : "Citizen & Student Activities"}
                    </div>
                    {activityItems.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActivityDropdownOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                            active
                              ? "bg-emerald-50 text-emerald-900 font-semibold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${item.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900">{item.label}</span>
                            <span className="text-[10px] text-slate-500">{item.sublabel}</span>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="pt-1.5 border-t border-slate-100">
                      <Link
                        href="/activities"
                        onClick={() => setActivityDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <span>{isTe ? "అన్ని కార్యక్రమాల హబ్ →" : "View Activities Hub →"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. NEW FEATURE: Actions */}
            <Link
              href="/actions"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname.startsWith("/actions")
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>{t("actions") || "Actions"}</span>
            </Link>

            {/* 4. NEW FEATURE: Hazards */}
            <Link
              href="/hazards"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname.startsWith("/hazards")
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{t("hazards") || "Hazards"}</span>
            </Link>

            {/* 5. NEW FEATURE: Institutions */}
            <Link
              href="/institution"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname.startsWith("/institution")
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>{t("institutions") || "Institutions"}</span>
            </Link>

            {/* 6. Events */}
            <Link
              href="/events"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname.startsWith("/events")
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{t("events") || "Events"}</span>
            </Link>

            {/* 7. Certificates (Main top-level item) */}
            <Link
              href="/certificates"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                pathname.startsWith("/certificates")
                  ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t("certificates") || "Certificates"}</span>
            </Link>
          </nav>

          {/* Right Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Organizer Hub Login */}
            <Link
              href="/organizer/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
              title="Institutional Road Safety Organizers Portal"
            >
              <Users className="h-3.5 w-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Organizer Hub</span>
              <span className="sm:hidden">Org</span>
            </Link>

            {/* Government Mission Control Portal */}
            <Link
              href="/gov"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm"
              title="Government Mission Control Portal"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Mission Control</span>
              <span className="sm:hidden">Gov</span>
            </Link>

            {/* Language Switcher */}
            <div className="rs-pill-toggle">
              {mounted && (
                <>
                  <button
                    data-active={i18n.language === "en"}
                    onClick={() => toggleLanguage("en")}
                    className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full transition-all"
                    aria-label="Switch to English"
                  >
                    EN
                  </button>
                  <button
                    data-active={i18n.language === "te"}
                    onClick={() => toggleLanguage("te")}
                    className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full transition-all"
                    aria-label="Switch to Telugu"
                  >
                    TE
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 text-emerald-800 shadow-sm hover:bg-emerald-50"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={t("toggleMenu") || "Toggle menu"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden pb-4 pt-2">
            <div className="grid gap-2 rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-xl shadow-emerald-900/10">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname === "/" ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>{t("home") || "Home"}</span>
              </Link>

              {/* Activity Section Header / Accordion */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileActivityOpen(!mobileActivityOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition ${
                    isActivityActive ? "bg-emerald-50 text-emerald-800" : "text-slate-800 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>{t("activity") || "Activity"} ({activityItems.length})</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${
                      mobileActivityOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileActivityOpen && (
                  <div className="p-2 space-y-1 bg-white border-t border-slate-200">
                    {activityItems.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                            active
                              ? "bg-emerald-600 text-white"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{item.sublabel.split("(")[0]}</span>
                        </Link>
                      );
                    })}
                    <Link
                      href="/activities"
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-2 text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      {isTe ? "అన్ని కార్యక్రమాల పేజీ →" : "View All Activities Hub →"}
                    </Link>
                  </div>
                )}
              </div>

              {/* Actions */}
              <Link
                href="/actions"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname.startsWith("/actions") ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <Target className="h-4 w-4" />
                <span>{t("actions") || "Actions"}</span>
              </Link>

              {/* Hazards */}
              <Link
                href="/hazards"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname.startsWith("/hazards") ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-amber-50"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{t("hazards") || "Hazards"}</span>
              </Link>

              {/* Institutions */}
              <Link
                href="/institution"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname.startsWith("/institution") ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>{t("institutions") || "Institutions"}</span>
              </Link>

              {/* Events */}
              <Link
                href="/events"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname.startsWith("/events") ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>{t("events") || "Events"}</span>
              </Link>

              {/* Certificates */}
              <Link
                href="/certificates"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition border ${
                  pathname.startsWith("/certificates")
                    ? "bg-emerald-700 text-white border-emerald-600"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                <Award className="h-4 w-4 text-emerald-600" />
                <span>{t("certificates") || "Certificates"}</span>
              </Link>

              {/* Organizer Portal */}
              <Link
                href="/organizer/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 mt-1"
              >
                <Users className="h-4 w-4 text-emerald-600" />
                <span>👥 Organizer Mission Hub</span>
              </Link>

              {/* Government Mission Control */}
              <Link
                href="/gov"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 mt-1"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>🏛️ Government Mission Control</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
