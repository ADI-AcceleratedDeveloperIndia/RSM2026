"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertTriangle, PlusCircle, CheckCircle2, Clock, 
  MapPin, Search, SlidersHorizontal, ArrowRight, ShieldAlert,
  Flame, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DISTRICT_NAMES } from "@/lib/districts";

interface HazardItem {
  _id: string;
  hazardId: string;
  title: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected";
  district: string;
  location: string;
  latitude?: number;
  longitude?: number;
  reportedBy: string;
  photos: string[];
  afterPhotos?: string[];
  createdAt: string;
}

export default function HazardsPage() {
  const [hazards, setHazards] = useState<HazardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [stats, setStats] = useState({ total: 0, resolvedCount: 0, resolutionRate: 0 });

  useEffect(() => {
    loadHazards();
    loadStats();
  }, [selectedDistrict, selectedCategory, selectedSeverity]);

  const loadHazards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== "all") params.set("district", selectedDistrict);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedSeverity !== "all") params.set("severity", selectedSeverity);
      if (search) params.set("search", search);

      const res = await fetch(`/api/hazards/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHazards(data.hazards || []);
      }
    } catch (err) {
      console.error("Error loading hazards:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/hazards/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn("Error loading hazard stats:", err);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-900 border border-red-200 flex items-center gap-1"><Flame className="h-3 w-3 text-red-600" /> Critical</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800">High Risk</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-100 text-yellow-800">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">Low</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Resolved</span>;
      case "in_progress":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><Wrench className="h-3 w-3 text-blue-600" /> In Rectification</span>;
      case "assigned":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Department Assigned</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1"><Clock className="h-3 w-3 text-amber-600" /> Reported</span>;
    }
  };

  return (
    <div className="rs-container py-12 space-y-8">
      {/* Hero Header */}
      <div className="rs-card p-8 bg-gradient-to-br from-amber-50 via-white to-red-50 border border-amber-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rs-chip bg-amber-100 text-amber-900">Ground Intelligence</span>
              <span className="rs-chip bg-red-100 text-red-900">Community Safety Watch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Road Hazard & Blackspot Tracker</h1>
            <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
              Citizens are the eyes on the road. Report dangerous potholes, missing road signs, broken traffic signals, or blind curves. Monitor government resolution in real-time.
            </p>
          </div>
          <Link href="/hazards/report" className="shrink-0">
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 text-base px-6 py-6 shadow-lg shadow-red-700/20">
              <PlusCircle className="h-5 w-5" />
              Report a Road Hazard
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Reported Hazards</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total || hazards.length}</p>
            <p className="text-xs text-amber-600 mt-1">From public road users</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Rectified & Fixed</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{stats.resolvedCount}</p>
            <p className="text-xs text-slate-500 mt-1">With photo verification</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Resolution Rate</p>
            <p className="text-3xl font-bold text-indigo-700 mt-2">{stats.resolutionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">Department response efficiency</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Safety Oversight</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">33</p>
            <p className="text-xs text-slate-500 mt-1">Districts monitored live</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search hazard by landmark, area, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadHazards()}
            className="pl-9 bg-white border-slate-300"
          />
        </div>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[160px]"
        >
          <option value="all">All Districts</option>
          {DISTRICT_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[150px]"
        >
          <option value="all">All Categories</option>
          <option value="pothole">Pothole / Road Damage</option>
          <option value="broken_signal">Broken Traffic Signal</option>
          <option value="missing_sign">Missing Sign Board</option>
          <option value="poor_visibility">Poor Visibility / Streetlight</option>
          <option value="dangerous_curve">Dangerous Blind Curve</option>
          <option value="no_footpath">Pedestrian Hazard</option>
          <option value="encroachment">Footpath Encroachment</option>
        </select>
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[140px]"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button onClick={loadHazards} variant="outline" className="shrink-0">
          Filter
        </Button>
      </div>

      {/* Hazards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Scanning ground reports...</div>
      ) : hazards.length === 0 ? (
        <div className="rs-card p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No hazards reported</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Notice a pothole or missing sign? Help authorities fix it by reporting the hazard with geolocation.
          </p>
          <Link href="/hazards/report">
            <Button className="bg-red-600 hover:bg-red-700 text-white mt-2">Report a Hazard</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hazards.map((h) => (
            <Link key={h._id} href={`/hazards/${h.hazardId}`} className="block group">
              <div className="rs-card p-5 h-full flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-amber-300 group-hover:-translate-y-0.5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {getSeverityBadge(h.severity)}
                    {getStatusBadge(h.status)}
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                    {h.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {h.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{h.location}, {h.district}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1">
                    <span className="font-mono text-slate-600 font-medium">{h.hazardId}</span>
                    <span className="text-amber-700 font-medium flex items-center gap-1 group-hover:underline">
                      Status & details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
