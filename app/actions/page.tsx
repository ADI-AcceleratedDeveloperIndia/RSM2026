"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Target, PlusCircle, CheckCircle2, Clock, 
  Search, SlidersHorizontal, ArrowRight, Shield,
  GraduationCap, Wrench, Siren, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DISTRICT_NAMES } from "@/lib/districts";
import { FOUR_E_CATEGORIES } from "@/lib/fourE";

interface ActionItem {
  _id: string;
  actionId: string;
  title: string;
  description: string;
  fourECategory: "education" | "engineering" | "enforcement" | "emergency";
  actionType: string;
  status: "committed" | "in_progress" | "completed" | "verified" | "rejected";
  priority: string;
  submittedBy: string;
  district: string;
  targetDate?: string;
  estimatedBeneficiaries: number;
  actualBeneficiaries?: number;
  createdAt: string;
}

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({ total: 0, completedCount: 0, completionRate: 0 });

  useEffect(() => {
    loadActions();
    loadStats();
  }, [selectedDistrict, selectedCategory, selectedStatus]);

  const loadActions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== "all") params.set("district", selectedDistrict);
      if (selectedCategory !== "all") params.set("fourECategory", selectedCategory);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (search) params.set("search", search);

      const res = await fetch(`/api/actions/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions || []);
      }
    } catch (err) {
      console.error("Error loading actions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/actions/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn("Error loading action stats:", err);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "education":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Education</span>;
      case "engineering":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1"><Wrench className="h-3 w-3" /> Engineering</span>;
      case "enforcement":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1"><Shield className="h-3 w-3" /> Enforcement</span>;
      case "emergency":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1"><Siren className="h-3 w-3" /> Emergency</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{category}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Verified</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Completed</span>;
      case "in_progress":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
      case "committed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="h-3 w-3 text-yellow-600" /> Committed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="rs-container py-12 space-y-8">
      {/* Hero Header */}
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 border border-emerald-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rs-chip bg-emerald-100 text-emerald-800">Action Engine</span>
              <span className="rs-chip bg-indigo-100 text-indigo-800">Verified Impact</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Road Safety Action Tracker</h1>
            <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
              Participation alone is not enough. Commit to concrete safety actions across Education, Engineering, Enforcement, and Emergency response. Track your progress with measurable evidence.
            </p>
          </div>
          <Link href="/actions/submit" className="shrink-0">
            <Button className="rs-btn-primary gap-2 text-base px-6 py-6 shadow-lg shadow-emerald-700/20">
              <PlusCircle className="h-5 w-5" />
              Commit to an Action
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Actions</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total || actions.length}</p>
            <p className="text-xs text-emerald-600 mt-1">Committed by citizens & schools</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Completed</p>
            <p className="text-3xl font-bold text-emerald-700 mt-2">{stats.completedCount}</p>
            <p className="text-xs text-slate-500 mt-1">Actions with verified evidence</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Completion Rate</p>
            <p className="text-3xl font-bold text-indigo-700 mt-2">{stats.completionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">Statewide action efficacy</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Districts</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">33</p>
            <p className="text-xs text-slate-500 mt-1">Across the state</p>
          </CardContent>
        </Card>
      </div>

      {/* 4E Category Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Categories
        </button>
        {FOUR_E_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search by action title, ID, or initiator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadActions()}
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
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="committed">Committed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="verified">Verified</option>
        </select>
        <Button onClick={loadActions} variant="outline" className="shrink-0">
          Filter
        </Button>
      </div>

      {/* Actions Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading safety actions...</div>
      ) : actions.length === 0 ? (
        <div className="rs-card p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No actions found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Be the first in your district to commit to a road safety action and inspire your community.
          </p>
          <Link href="/actions/submit">
            <Button className="rs-btn-primary mt-2">Commit to First Action</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {actions.map((action) => (
            <Link key={action._id} href={`/actions/${action.actionId}`} className="block group">
              <div className="rs-card p-5 h-full flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-emerald-300 group-hover:-translate-y-0.5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {getCategoryBadge(action.fourECategory)}
                    {getStatusBadge(action.status)}
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {action.title}
                  </h3>
                  {action.description && (
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {action.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-emerald-700 font-medium">{action.actionId}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{action.district}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>By: {action.submittedBy}</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1 group-hover:underline">
                      View details <ArrowRight className="h-3 w-3" />
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
