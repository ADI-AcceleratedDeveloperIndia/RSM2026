"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Award, CheckCircle2, 
  Users, Calendar, Target, AlertTriangle, Building2,
  Printer, TrendingUp, BarChart3, GraduationCap, Wrench, Shield, Siren
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DistrictDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDistrictScorecard() {
      try {
        const res = await fetch(`/api/scorecards/${code}`);
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Error loading district scorecard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDistrictScorecard();
  }, [code]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading district scorecard...</div>;
  }

  if (!data?.scorecard) {
    return (
      <div className="p-8 text-center space-y-4">
        <MapPin className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900">District Scorecard Not Found</h2>
        <Link href="/gov/districts">
          <Button variant="outline">Back to District Directory</Button>
        </Link>
      </div>
    );
  }

  const { scorecard, districtInfo, institutions, recentActions, recentHazards, recentEvents } = data;
  const pScores = scorecard.pillarScores || { education: 20, engineering: 18, enforcement: 21, emergency: 19 };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <Link href="/gov/districts" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to District Rankings
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.print()}
          className="gap-2 text-xs"
        >
          <Printer className="h-3.5 w-3.5" /> Print District Scorecard
        </Button>
      </div>

      {/* Main Scorecard Header */}
      <Card className="border-slate-200 p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-indigo-800/80 text-indigo-200 border border-indigo-700">
                {scorecard.districtCode}
              </span>
              <span className="text-xs text-slate-300">
                {scorecard.state || "State Government"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Road Safety Month 2027
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{scorecard.districtName} District</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Rank #{scorecard.rank || 1} • Computed live from field evidence & verified impact
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
            <div className="text-center pr-4 border-r border-white/20">
              <p className="text-xs text-slate-300 uppercase font-semibold">Overall Score</p>
              <p className="text-4xl font-bold text-white mt-1">{scorecard.overallScore}<span className="text-lg text-slate-300 font-normal">/100</span></p>
            </div>
            <div className="text-center pl-2">
              <p className="text-xs text-slate-300 uppercase font-semibold">Grade</p>
              <p className="text-4xl font-bold text-emerald-400 mt-1">{scorecard.grade || "A"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4E Pillars Breakdown */}
      <Card className="border-slate-200 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">4E Strategic Pillar Scorecards</h3>
          <p className="text-xs text-slate-500">Each pillar is evaluated out of 25 maximum points.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600" /> Education
              </span>
              <span className="font-bold text-sm text-blue-900">{pScores.education}/25</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(pScores.education / 25) * 100}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">Awareness drives, quizzes, school clubs</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-amber-600" /> Engineering
              </span>
              <span className="font-bold text-sm text-amber-900">{pScores.engineering}/25</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${(pScores.engineering / 25) * 100}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">Pothole fixes, signs, blackspot fixes</p>
          </div>

          <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-900 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-red-600" /> Enforcement
              </span>
              <span className="font-bold text-sm text-red-900">{pScores.enforcement}/25</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(pScores.enforcement / 25) * 100}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">Helmet checking drives, speed checks</p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <Siren className="h-4 w-4 text-emerald-600" /> Emergency
              </span>
              <span className="font-bold text-sm text-emerald-900">{pScores.emergency}/25</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(pScores.emergency / 25) * 100}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">Golden hour training, first responder drills</p>
          </div>
        </div>
      </Card>

      {/* Raw Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Participants</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{scorecard.metrics?.participants?.toLocaleString() || 0}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold">Events Conducted</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{scorecard.metrics?.events || 0}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold">Actions Completed</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{scorecard.metrics?.actionsCompleted || 0} / {scorecard.metrics?.actionsTotal || 0}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold">Hazards Rectified</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{scorecard.metrics?.hazardsResolved || 0} / {scorecard.metrics?.hazardsReported || 0}</p>
        </Card>
      </div>

      {/* Participating Institutions */}
      <Card className="border-slate-200 p-6 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Enrolled Institutions in {scorecard.districtName}</h3>
          <span className="text-xs text-slate-500">{institutions?.length || 0} institutions</span>
        </div>

        {institutions && institutions.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {institutions.map((inst: any) => (
              <div key={inst._id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{inst.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{inst.type} • POC: {inst.contactPerson}</p>
                </div>
                <Link href={`/institution/${inst.institutionId}`} className="text-xs text-indigo-600 font-semibold hover:underline">
                  Profile &rarr;
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No institutions registered in this district yet.</p>
        )}
      </Card>
    </div>
  );
}
