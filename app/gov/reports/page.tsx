"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileBarChart, PlusCircle, Download, Eye, 
  Printer, CheckCircle2, Shield, Calendar, Sparkles, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DISTRICT_NAMES } from "@/lib/districts";

export default function GovReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  const [genScope, setGenScope] = useState("statewide");
  const [genDistrict, setGenDistrict] = useState("Karimnagar");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/list");
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
          scope: genScope,
          districtName: genScope === "district" ? genDistrict : undefined,
          generatedBy: "Mission Control Executive Engine",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate report");
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Official Impact & Audit Reports</h2>
          <p className="text-sm text-slate-500">
            Synthesize verified road safety outputs into formal government dossiers, district scorecards, and evidence annexures.
          </p>
        </div>
        <Button 
          onClick={() => setShowGenerateModal(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs shadow-md"
        >
          <Sparkles className="h-4 w-4" /> Generate Official Report
        </Button>
      </div>

      {/* Reports Table */}
      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Report Reference & Title</th>
                <th className="px-6 py-3 font-medium">Scope</th>
                <th className="px-6 py-3 font-medium">Rectification Rate</th>
                <th className="px-6 py-3 font-medium">Generated Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Exports</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading official reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center space-y-3">
                    <FileBarChart className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="text-slate-600 font-semibold">No official reports generated yet</p>
                    <p className="text-xs text-slate-400">Click 'Generate Official Report' above to synthesize current campaign data.</p>
                  </td>
                </tr>
              ) : (
                reports.map((rpt) => (
                  <tr key={rpt._id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-indigo-700 block">{rpt.reportId}</span>
                      <span className="font-medium text-slate-900 mt-0.5 block">{rpt.title}</span>
                    </td>
                    <td className="px-6 py-4 capitalize text-xs font-semibold text-slate-700">
                      {rpt.scope} {rpt.districtName && `(${rpt.districtName})`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        {rpt.hazardAudit?.rectificationRate || 100}% Fixed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(rpt.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
                        Official Gazette
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/gov/reports/${rpt.reportId}`}>
                        <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Dossier
                        </Button>
                      </Link>
                      <a href={`/api/reports/${rpt.reportId}/download`} download>
                        <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-slate-600">
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

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleGenerateReport} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Generate Official Impact Dossier</h3>
                <p className="text-xs text-slate-500">Synthesizes live data into an official publication document</p>
              </div>
              <button type="button" onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Report Scope *</label>
                <select
                  value={genScope}
                  onChange={(e) => setGenScope(e.target.value)}
                  className="w-full border border-slate-300 rounded-md text-xs p-2 bg-white mt-1 h-9"
                >
                  <option value="statewide">Statewide (All Districts)</option>
                  <option value="district">Single District Focus</option>
                </select>
              </div>

              {genScope === "district" && (
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
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={generating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {generating ? "Synthesizing Data..." : "Generate Official Report"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
