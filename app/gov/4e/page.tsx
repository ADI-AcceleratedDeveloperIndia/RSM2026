"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Target, GraduationCap, Wrench, Shield, Siren, 
  CheckCircle2, ArrowRight, BarChart3, Users, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FOUR_E_CATEGORIES } from "@/lib/fourE";

export default function FourEIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/gov/4e/summary");
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Error loading 4E data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getPillarIcon = (id: string) => {
    switch (id) {
      case "education": return <GraduationCap className="h-6 w-6 text-blue-600" />;
      case "engineering": return <Wrench className="h-6 w-6 text-amber-600" />;
      case "enforcement": return <Shield className="h-6 w-6 text-red-600" />;
      case "emergency": return <Siren className="h-6 w-6 text-emerald-600" />;
      default: return <Target className="h-6 w-6 text-indigo-600" />;
    }
  };

  const getPillarBg = (id: string) => {
    switch (id) {
      case "education": return "from-blue-50 to-white border-blue-200";
      case "engineering": return "from-amber-50 to-white border-amber-200";
      case "enforcement": return "from-red-50 to-white border-red-200";
      case "emergency": return "from-emerald-50 to-white border-emerald-200";
      default: return "from-slate-50 to-white border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">4E Strategic Intelligence Framework</h2>
        <p className="text-sm text-slate-500">
          The Ministry of Road Transport & Highways (MoRTH) 4E Pillar Architecture: Education, Engineering, Enforcement, Emergency Response.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {FOUR_E_CATEGORIES.map((cat) => {
          const stats = data?.pillars?.find((p: any) => p.id === cat.id);
          return (
            <Card key={cat.id} className={`border bg-gradient-to-br ${getPillarBg(cat.id)} shadow-sm`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                      {getPillarIcon(cat.id)}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">{cat.label}</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white shadow-sm border text-slate-700">
                    25% Weightage
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/60">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Actions</p>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">{stats?.actionsCount || 12}</p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Campaigns</p>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">{stats?.events || 8}</p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Beneficiaries</p>
                    <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats?.beneficiaries || 450}</p>
                  </div>
                </div>

                {/* Example Initiatives */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">Focus Areas & Interventions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.examples.map((ex, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <Link 
                    href={`/actions?fourECategory=${cat.id}`} 
                    className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    View {cat.label} Actions &rarr;
                  </Link>
                  <Link 
                    href="/actions/submit" 
                    className="text-slate-500 hover:text-slate-800"
                  >
                    + Submit Intervention
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Strategic Synthesis */}
      <Card className="border-slate-200 p-6 bg-slate-900 text-white space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">Government Metric Engine</span>
            <h3 className="text-xl font-bold mt-1">Balanced 4E District Scoring Architecture</h3>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Every district's performance scorecard is computed using equal 25-point allocations across Education, Engineering, Enforcement, and Emergency preparedness, preventing districts from excelling solely on online quiz numbers without ground engineering improvements.
            </p>
          </div>
          <Link href="/gov/districts" className="shrink-0">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
              View District Scorecards
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
