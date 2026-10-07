"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Target, CheckCircle, XCircle, Clock, 
  Search, SlidersHorizontal, ExternalLink, Shield,
  Award, Eye, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DISTRICT_NAMES } from "@/lib/districts";
import { FOUR_E_CATEGORIES } from "@/lib/fourE";

function ActionsContent() {
  const searchParams = useSearchParams();
  const districtParam = searchParams.get("district");

  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("completed"); // Default to completed (awaiting verification)
  const [districtFilter, setDistrictFilter] = useState(districtParam || "all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (districtParam) {
      setDistrictFilter(districtParam);
    }
  }, [districtParam]);
  
  // Verification dialog
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadActions();
  }, [statusFilter, districtFilter, categoryFilter]);

  const loadActions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (districtFilter !== "all") params.set("district", districtFilter);
      if (categoryFilter !== "all") params.set("fourECategory", categoryFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/actions/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions || []);
      }
    } catch (err) {
      console.error("Error loading gov actions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (actionId: string, decision: "verify" | "reject") => {
    if (!confirm(`Are you sure you want to ${decision} this action?`)) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/actions/${actionId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: decision,
          verificationNotes: verifyNotes,
          verifiedBy: "Government Mission Control Officer",
        }),
      });

      if (!res.ok) throw new Error("Failed to process decision");
      setSelectedAction(null);
      setVerifyNotes("");
      loadActions();
    } catch (err: any) {
      alert(err.message || "Error processing decision");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Action Verification & Impact Queue</h2>
          <p className="text-sm text-slate-500">
            Review completed road safety actions, inspect attached evidence, and approve verified impact scores.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            statusFilter === "completed" 
              ? "bg-amber-100 text-amber-900 border border-amber-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="h-4 w-4 text-amber-600" />
          Awaiting Verification
        </button>
        <button
          onClick={() => setStatusFilter("verified")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            statusFilter === "verified" 
              ? "bg-green-100 text-green-900 border border-green-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          Verified Actions
        </button>
        <button
          onClick={() => setStatusFilter("committed")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            statusFilter === "committed" 
              ? "bg-indigo-100 text-indigo-900 border border-indigo-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          In Progress / Committed
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            statusFilter === "all" 
              ? "bg-slate-200 text-slate-900 border border-slate-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Actions
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search by action title, ID, or initiator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadActions()}
            className="pl-9 bg-white border-slate-300"
          />
        </div>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[150px]"
        >
          <option value="all">All Districts</option>
          {DISTRICT_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[140px]"
        >
          <option value="all">All 4E Pillars</option>
          {FOUR_E_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <Button onClick={loadActions} variant="outline">Filter</Button>
      </div>

      {/* Actions Table */}
      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Action ID & Title</th>
                <th className="px-6 py-3 font-medium">Pillar</th>
                <th className="px-6 py-3 font-medium">District</th>
                <th className="px-6 py-3 font-medium">Initiator</th>
                <th className="px-6 py-3 font-medium text-center">Evidence</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading action records...
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No actions matching this filter.
                  </td>
                </tr>
              ) : (
                actions.map((act) => (
                  <tr key={act._id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-indigo-700 block">{act.actionId}</span>
                      <span className="font-medium text-slate-900 mt-0.5 block">{act.title}</span>
                    </td>
                    <td className="px-6 py-4 capitalize text-xs font-semibold text-slate-700">
                      {act.fourECategory}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{act.district}</td>
                    <td className="px-6 py-4 text-slate-600">{act.submittedBy}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {act.evidence?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        act.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : act.status === "completed"
                          ? "bg-amber-100 text-amber-800"
                          : act.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/actions/${act.actionId}`} target="_blank">
                        <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </Link>
                      {act.status === "completed" && (
                        <Button
                          size="sm"
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setSelectedAction(act)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Review
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Decision Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-indigo-700 font-semibold">{selectedAction.actionId}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedAction.title}</h3>
                <p className="text-xs text-slate-500">Initiator: {selectedAction.submittedBy} • {selectedAction.district}</p>
              </div>
              <button onClick={() => setSelectedAction(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
              <p><strong>Description:</strong> {selectedAction.description || "No description provided."}</p>
              <p><strong>Beneficiaries:</strong> {selectedAction.actualBeneficiaries || selectedAction.estimatedBeneficiaries} people impacted</p>
              <p><strong>Evidence items:</strong> {selectedAction.evidence?.length || 0} attached artifacts</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Verification Notes</label>
              <Input
                placeholder="e.g. Verified via school photographs and attendance log"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDecision(selectedAction.actionId, "reject")}
                disabled={processing}
                className="text-red-600 hover:bg-red-50"
              >
                Reject Action
              </Button>
              <Button
                size="sm"
                onClick={() => handleDecision(selectedAction.actionId, "verify")}
                disabled={processing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Approve & Verify Impact
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GovActionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading ground action verification queue...</div>}>
      <ActionsContent />
    </Suspense>
  );
}
