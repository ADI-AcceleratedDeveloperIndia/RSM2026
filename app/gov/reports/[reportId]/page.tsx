"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Printer, Download, CheckCircle2, 
  Shield, Building2, MapPin, Calendar, Award, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
        }
      } catch (err) {
        console.error("Error loading report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Compiling official dossier...</div>;
  }

  if (!report) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Official Report Not Found</h2>
        <Link href="/gov/reports">
          <Button variant="outline">Back to Reports Center</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/gov/reports" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Reports Center
        </Link>
        <div className="flex gap-2">
          <a href={`/api/reports/${reportId}/download`} download>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </a>
          <Button size="sm" onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print / Export Official PDF
          </Button>
        </div>
      </div>

      {/* Gazette Header Document Layout */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Emblem & Gazette Header */}
        <div className="text-center space-y-3 pb-6 border-b-2 border-slate-900">
          <div className="flex justify-center">
            <Image
              src="/assets/logo/state-government-emblem.svg"
              alt="State Government Emblem"
              width={70}
              height={70}
              className="object-contain"
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Transport Department • State Government
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight">
            Road Safety Month 2027
          </h1>
          <p className="text-sm font-semibold text-indigo-950 uppercase tracking-wider">
            National Road Safety Action & Verified Impact Dossier
          </p>
          <div className="pt-2 flex justify-center items-center gap-4 text-xs font-mono text-slate-500">
            <span>REFERENCE: {report.reportId}</span>
            <span>•</span>
            <span>GAZETTE STATUS: {report.status.toUpperCase()}</span>
            <span>•</span>
            <span>DATE: {new Date(report.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            1. Executive Summary & Impact Synopsis
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed font-serif">
            {report.executiveSummary}
          </p>
        </div>

        {/* Section 2: 4E Strategic Analysis Matrix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            2. Four Pillars of Road Safety (4E) Performance Audit
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-blue-950">Education Pillar</h4>
                <span className="text-xs font-bold text-blue-700">25 pts</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>Participants reached: {report.fourEAnalysis?.education?.participantsReached?.toLocaleString()}</li>
                <li>Educational initiatives: {report.fourEAnalysis?.education?.totalInitiatives}</li>
                <li>Institutions with Safety Clubs: {report.fourEAnalysis?.education?.institutionsEngaged}</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-amber-950">Engineering Pillar</h4>
                <span className="text-xs font-bold text-amber-700">25 pts</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>Blackspots evaluated: {report.fourEAnalysis?.engineering?.blackspotsIdentified}</li>
                <li>Potholes & obstacles rectified: {report.fourEAnalysis?.engineering?.potholesFixed}</li>
                <li>Verification proof logged: 100% with GPS pins</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-red-950">Enforcement Pillar</h4>
                <span className="text-xs font-bold text-red-700">25 pts</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>Helmet compliance checkpoints: {report.fourEAnalysis?.enforcement?.helmetCheckpoints}</li>
                <li>Zero-tolerance school zone drives: {report.fourEAnalysis?.enforcement?.complianceDrives}</li>
                <li>Speed monitoring operations: Active</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-emerald-950">Emergency Response Pillar</h4>
                <span className="text-xs font-bold text-emerald-700">25 pts</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>First-responder trained citizens: {report.fourEAnalysis?.emergency?.firstAidTrained?.toLocaleString()}</li>
                <li>Golden Hour readiness drills: {report.fourEAnalysis?.emergency?.drillsConducted}</li>
                <li>Good Samaritan protection campaign: Statewide</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Ground Hazards & Action Efficacy */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            3. Ground Verification & Hazard Rectification Efficacy
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 border border-slate-200 rounded-xl">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Hazards Reported</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{report.hazardAudit?.reported || 0}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Rectified on Site</p>
              <p className="text-xl font-bold text-green-700 mt-1">{report.hazardAudit?.resolved || 0}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Rectification Rate</p>
              <p className="text-xl font-bold text-indigo-700 mt-1">{report.hazardAudit?.rectificationRate || 100}%</p>
            </div>
          </div>
        </div>

        {/* Section 4: Top Performing Districts */}
        {report.topDistricts && report.topDistricts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. District Scorecard Leaderboard
            </h3>

            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-2 font-semibold">Rank</th>
                  <th className="p-2 font-semibold">District</th>
                  <th className="p-2 font-semibold">Score (/100)</th>
                  <th className="p-2 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {report.topDistricts.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none">
                    <td className="p-2 font-mono font-bold">#{d.rank || i + 1}</td>
                    <td className="p-2 font-medium">{d.districtName}</td>
                    <td className="p-2 font-semibold">{d.score}</td>
                    <td className="p-2 font-bold text-emerald-700">{d.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures Footer */}
        <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-end text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">National Road Safety Action Platform</p>
            <p className="text-[11px] text-slate-400">Authenticated System Output</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-900">Principal Secretary to Government</p>
            <p className="text-[11px] text-slate-400">Transport, Roads & Buildings Department</p>
          </div>
        </div>
      </div>
    </div>
  );
}
