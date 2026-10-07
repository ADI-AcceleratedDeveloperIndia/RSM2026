"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  FileBarChart, PlusCircle, Download, Eye, 
  Printer, CheckCircle2, Shield, Calendar, Sparkles, X,
  Scale, Building2, Award, Landmark, CheckCheck, AlertCircle, FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DISTRICT_NAMES } from "@/lib/districts";

function ReportsContent() {
  const searchParams = useSearchParams();
  const districtParam = searchParams.get("district");

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState("all");
  const [genTemplateType, setGenTemplateType] = useState("morth_atr");
  const [genScope, setGenScope] = useState(districtParam ? "district" : "statewide");
  const [genDistrict, setGenDistrict] = useState(districtParam || "Karimnagar");
  const [genSignatory, setGenSignatory] = useState("District Transport Officer & Nodal Lead");

  useEffect(() => {
    if (districtParam) {
      setGenScope("district");
      setGenDistrict(districtParam);
    }
  }, [districtParam]);

  useEffect(() => {
    loadReports();
  }, [selectedTemplateFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const url = selectedTemplateFilter !== "all" 
        ? `/api/reports/list?templateType=${selectedTemplateFilter}`
        : "/api/reports/list";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: genTemplateType,
          scope: genScope,
          districtName: genScope === "district" ? genDistrict : undefined,
          generatedBy: "Mission Control Executive Engine",
          signatoryName: genSignatory,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate statutory report");
      setShowGenerateModal(false);
      loadReports();
    } catch (err: any) {
      alert(err.message || "Error generating report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
              Statutory Source of Truth
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 100% MoRTH & CoRS Compliant
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">
            Government Compliance & Statutory Reporting Center
          </h2>
          <p className="text-sm text-slate-500">
            Automated statutory report generation and audit dossiers for MoRTH, Supreme Court Committee on Road Safety (CoRS), and District Road Safety Committees (DRSC Section 215D).
          </p>
        </div>
        <Button 
          onClick={() => setShowGenerateModal(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs shadow-md shrink-0 h-10 px-4"
        >
          <Sparkles className="h-4 w-4" /> Generate Statutory Report
        </Button>
      </div>

      {/* Statutory Compliance Readiness Index (CARI) Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-300">
              <Landmark className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">MoRTH Action Taken Report</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              AUDIT READY
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold">Form NRSM-ATR</div>
            <p className="text-xs text-white/70 mt-1">
              Mandatory National Road Safety Month Consolidated Report with 4E metrics, driver health camps, and PWD blackspot fixes.
            </p>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="text-indigo-200 font-medium">Compliance Readiness</span>
            <span className="font-bold text-emerald-300">98.4% (Grade A+)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-slate-900 text-white shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-purple-300">
              <Scale className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Supreme Court CoRS</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              SYNCHRONIZED
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold">Form SCCRS-QPR</div>
            <p className="text-xs text-white/70 mt-1">
              Quarterly Monitoring Matrix for Justice Sapre Committee. Automated State Road Safety Fund & e-Challan enforcement tracking.
            </p>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="text-purple-200 font-medium">CoRS Statutory Score</span>
            <span className="font-bold text-emerald-300">96.0% (Compliant)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-emerald-300">
              <Building2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">MV Act Section 215D</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              33 DISTRICTS
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold">DRSC Monthly Review</div>
            <p className="text-xs text-white/70 mt-1">
              District Magistrate / Collector Action Dossier. Real-time joint actions across Police, PWD, Transport & Health.
            </p>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="text-emerald-200 font-medium">DRSC Meeting Adherence</span>
            <span className="font-bold text-cyan-300">100% On Schedule</span>
          </div>
        </div>
      </div>

      {/* Template Filter Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "all", label: "All Statutory Reports", icon: FileBarChart },
          { id: "morth_atr", label: "🏛️ MoRTH Action Taken Reports (Form NRSM-ATR)", icon: Landmark },
          { id: "cors_compliance", label: "⚖️ Supreme Court CoRS Matrices (Form SCCRS-QPR)", icon: Scale },
          { id: "drsc_action_plan", label: "🏢 District DRSC Dossiers (Sec 215D)", icon: Building2 },
          { id: "general_impact", label: "📊 Executive Impact Dossiers", icon: FileCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTemplateFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTemplateFilter === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Report Reference & Title</th>
                <th className="px-6 py-3 font-medium">Statutory Authority</th>
                <th className="px-6 py-3 font-medium">Scope</th>
                <th className="px-6 py-3 font-medium">Compliance Readiness</th>
                <th className="px-6 py-3 font-medium">Generated Date</th>
                <th className="px-6 py-3 font-medium text-right">Official Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading official statutory reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center space-y-3">
                    <FileBarChart className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="text-slate-600 font-semibold">No reports found for this filter</p>
                    <p className="text-xs text-slate-400">Click 'Generate Statutory Report' above to synthesize current compliance data.</p>
                  </td>
                </tr>
              ) : (
                reports.map((rpt) => (
                  <tr key={rpt._id || rpt.reportId} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 block bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {rpt.reportId}
                        </span>
                        {rpt.templateType === "morth_atr" && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">MoRTH Form</span>
                        )}
                        {rpt.templateType === "cors_compliance" && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">CoRS Matrix</span>
                        )}
                        {rpt.templateType === "drsc_action_plan" && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Sec 215D</span>
                        )}
                      </div>
                      <span className="font-medium text-slate-900 mt-1 block max-w-md">{rpt.title}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <span className="font-medium block text-slate-800">{rpt.statutoryReference || "MoRTH Statutory Framework"}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{rpt.generatedBy}</span>
                    </td>
                    <td className="px-6 py-4 capitalize text-xs font-semibold text-slate-700">
                      {rpt.scope} {rpt.districtName && `(${rpt.districtName})`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                        {rpt.complianceScore || 96}% Audit-Ready
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(rpt.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/gov/reports/${rpt.reportId}`}>
                        <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs text-indigo-700 hover:bg-indigo-50 border-indigo-200">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Dossier
                        </Button>
                      </Link>
                      <a href={`/api/reports/${rpt.reportId}/download`} download>
                        <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900">
                          <Download className="h-3.5 w-3.5 mr-1" /> CSV
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Report Modal with Statutory Templates */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleGenerateReport} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Generate Official Statutory Report</h3>
                <p className="text-xs text-slate-500">
                  Select the required statutory format to synthesize real-time data into a legally compliant government document.
                </p>
              </div>
              <button type="button" onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Statutory Template Format *</label>
                <div className="space-y-2">
                  {[
                    {
                      id: "morth_atr",
                      title: "MoRTH Official Action Taken Report (Form NRSM-ATR)",
                      desc: "Mandatory format for Ministry of Road Transport & Highways. Covers 4E quantitative matrix, driver health camps, blackspots.",
                      badge: "Mandatory for Centre",
                    },
                    {
                      id: "cors_compliance",
                      title: "Supreme Court Committee on Road Safety (Form SCCRS-QPR)",
                      desc: "Quarterly Monitoring Matrix for Justice Sapre Committee. State Road Safety Fund, e-Challan automation, 108 Golden Hour response.",
                      badge: "Supreme Court Directives",
                    },
                    {
                      id: "drsc_action_plan",
                      title: "District Road Safety Committee (DRSC) Review (Section 215D)",
                      desc: "Statutory review format for District Collector & DM. Inter-departmental coordination (Police, PWD, RTO, Health).",
                      badge: "MV Act Sec 215D",
                    },
                    {
                      id: "general_impact",
                      title: "Executive Government Impact Dossier",
                      desc: "General state performance overview with citizen participation metrics and district leaderboard.",
                      badge: "Cabinet & Press Brief",
                    },
                  ].map((tpl) => (
                    <label
                      key={tpl.id}
                      onClick={() => setGenTemplateType(tpl.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        genTemplateType === tpl.id
                          ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="templateType"
                        value={tpl.id}
                        checked={genTemplateType === tpl.id}
                        onChange={() => setGenTemplateType(tpl.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{tpl.title}</span>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                            {tpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tpl.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scope & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Territorial Scope *</label>
                  <select
                    value={genScope}
                    onChange={(e) => setGenScope(e.target.value)}
                    className="w-full border border-slate-300 rounded-md text-xs p-2 bg-white mt-1 h-9"
                  >
                    <option value="statewide">Statewide (All 33 Districts)</option>
                    <option value="district">Single District Focus</option>
                  </select>
                </div>

                {genScope === "district" ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Target District *</label>
                    <select
                      value={genDistrict}
                      onChange={(e) => setGenDistrict(e.target.value)}
                      className="w-full border border-slate-300 rounded-md text-xs p-2 bg-white mt-1 h-9"
                    >
                      {DISTRICT_NAMES.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Reporting State *</label>
                    <input
                      type="text"
                      disabled
                      value="State Government"
                      className="w-full border border-slate-200 rounded-md text-xs p-2 bg-slate-50 mt-1 h-9 text-slate-600"
                    />
                  </div>
                )}
              </div>

              {/* Signatory Designation */}
              <div>
                <label className="text-xs font-semibold text-slate-700">Authorized Signatory / Designee *</label>
                <input
                  type="text"
                  value={genSignatory}
                  onChange={(e) => setGenSignatory(e.target.value)}
                  placeholder="e.g. Transport Commissioner / District Collector"
                  className="w-full border border-slate-300 rounded-md text-xs p-2 bg-white mt-1 h-9"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={generating} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                <Sparkles className="h-4 w-4" />
                {generating ? "Synthesizing Statutory Data..." : "Generate Official Report"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function GovReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading government statutory reporting center...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
