"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  AlertTriangle, CheckCircle, Clock, MapPin, 
  Search, Eye, Check, X, Building, Flame, Wrench, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DISTRICT_NAMES } from "@/lib/districts";

function HazardsContent() {
  const searchParams = useSearchParams();
  const districtParam = searchParams.get("district");

  const [hazards, setHazards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("reported"); // Default: newly reported needing triage
  const [districtFilter, setDistrictFilter] = useState(districtParam || "all");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    if (districtParam) {
      setDistrictFilter(districtParam);
    }
  }, [districtParam]);

  // Assignment Modal
  const [assignModalHazard, setAssignModalHazard] = useState<any | null>(null);
  const [assignedDept, setAssignedDept] = useState("roads_and_buildings");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [budgetEstimate, setBudgetEstimate] = useState("");
  const [processing, setProcessing] = useState(false);

  // Resolve Modal
  const [resolveModalHazard, setResolveModalHazard] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [afterPhoto, setAfterPhoto] = useState("");

  useEffect(() => {
    loadHazards();
  }, [statusFilter, districtFilter, severityFilter]);

  const loadHazards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (districtFilter !== "all") params.set("district", districtFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/hazards/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHazards(data.hazards || []);
      }
    } catch (err) {
      console.error("Error loading gov hazards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalHazard) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/hazards/${assignModalHazard.hazardId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: assignedDept,
          assignedTo: assignedOfficer,
          budgetEstimate: budgetEstimate ? parseInt(budgetEstimate, 10) : 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign department");
      setAssignModalHazard(null);
      setAssignedOfficer("");
      setBudgetEstimate("");
      loadHazards();
    } catch (err: any) {
      alert(err.message || "Error assigning department");
    } finally {
      setProcessing(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalHazard) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/hazards/${resolveModalHazard.hazardId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolvedBy: "Mission Control Engineer",
          resolutionNotes,
          afterPhotos: afterPhoto ? [afterPhoto] : [],
        }),
      });

      if (!res.ok) throw new Error("Failed to resolve hazard");
      setResolveModalHazard(null);
      setResolutionNotes("");
      setAfterPhoto("");
      loadHazards();
    } catch (err: any) {
      alert(err.message || "Error resolving hazard");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ground Hazard Triage & Rectification</h2>
          <p className="text-sm text-slate-500">
            Triage public hazard submissions, dispatch engineering teams, and verify completion before public sign-off.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setStatusFilter("reported")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            statusFilter === "reported" 
              ? "bg-amber-100 text-amber-900 border border-amber-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="h-4 w-4 text-amber-600" />
          Awaiting Triage
        </button>
        <button
          onClick={() => setStatusFilter("assigned")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            statusFilter === "assigned" 
              ? "bg-blue-100 text-blue-900 border border-blue-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building className="h-4 w-4 text-blue-600" />
          Assigned to Departments
        </button>
        <button
          onClick={() => setStatusFilter("resolved")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            statusFilter === "resolved" 
              ? "bg-green-100 text-green-900 border border-green-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          Rectified & Resolved
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            statusFilter === "all" 
              ? "bg-slate-200 text-slate-900 border border-slate-300" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Hazards
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search by location, ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadHazards()}
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
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[140px]"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button onClick={loadHazards} variant="outline">Filter</Button>
      </div>

      {/* Hazards Table */}
      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Hazard ID & Title</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">District & Landmark</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading hazard reports...
                  </td>
                </tr>
              ) : hazards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No hazards matching current filters.
                  </td>
                </tr>
              ) : (
                hazards.map((h) => (
                  <tr key={h._id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-amber-900 block">{h.hazardId}</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{h.title}</span>
                    </td>
                    <td className="px-6 py-4 capitalize text-xs font-medium text-slate-700">
                      {h.category.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-xs">
                      <p className="font-semibold">{h.district}</p>
                      <p className="text-slate-500 truncate max-w-xs">{h.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        h.severity === "critical"
                          ? "bg-red-100 text-red-900"
                          : h.severity === "high"
                          ? "bg-orange-100 text-orange-900"
                          : "bg-yellow-100 text-yellow-900"
                      }`}>
                        {h.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {h.assignedTo || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        h.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : h.status === "assigned"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/hazards/${h.hazardId}`} target="_blank">
                        <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </Link>
                      {h.status === "reported" && (
                        <Button
                          size="sm"
                          className="h-8 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => setAssignModalHazard(h)}
                        >
                          <Building className="h-3.5 w-3.5 mr-1" /> Dispatch
                        </Button>
                      )}
                      {(h.status === "assigned" || h.status === "in_progress") && (
                        <Button
                          size="sm"
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setResolveModalHazard(h)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Resolve
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

      {/* Assign Modal */}
      {assignModalHazard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssignSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-amber-900 font-semibold">{assignModalHazard.hazardId}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Dispatch Rectification Agency</h3>
                <p className="text-xs text-slate-500">{assignModalHazard.title} • {assignModalHazard.district}</p>
              </div>
              <button type="button" onClick={() => setAssignModalHazard(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Executing Department *</label>
                <select
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  className="w-full border border-slate-300 rounded-md text-xs p-2 bg-white mt-1 h-9"
                  required
                >
                  <option value="roads_and_buildings">Roads & Buildings (R&B Department)</option>
                  <option value="traffic_police">District Traffic Police (Enforcement)</option>
                  <option value="municipal_corporation">Municipal Corporation (Urban Roads)</option>
                  <option value="nhai">National Highways Authority (NHAI)</option>
                  <option value="transport_dept">Regional Transport Authority (RTA)</option>
                  <option value="health_emergency">Emergency & Trauma Care (108/Health)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Officer / Executive Engineer In Charge</label>
                <Input
                  placeholder="e.g. Executive Engineer, R&B Division Karimnagar"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="text-xs mt-1 h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Budget / Rectification Estimate (₹)</label>
                <Input
                  type="number"
                  placeholder="Optional cost estimate"
                  value={budgetEstimate}
                  onChange={(e) => setBudgetEstimate(e.target.value)}
                  className="text-xs mt-1 h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalHazard(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Dispatch & Issue Work Order
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalHazard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleResolveSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-green-800 font-semibold">{resolveModalHazard.hazardId}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Sign-Off Rectification Proof</h3>
                <p className="text-xs text-slate-500">{resolveModalHazard.title}</p>
              </div>
              <button type="button" onClick={() => setResolveModalHazard(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Completion Summary Notes *</label>
                <Input
                  placeholder="e.g. Pothole filled with dense bituminous macadam; road level restored."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                  className="text-xs mt-1 h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">After Rectification Photo URL</label>
                <Input
                  placeholder="https://drive.google.com/... or proof photo link"
                  value={afterPhoto}
                  onChange={(e) => setAfterPhoto(e.target.value)}
                  className="text-xs mt-1 h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setResolveModalHazard(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Approve & Mark Resolved
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function GovHazardsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading ground hazard dispatch...</div>}>
      <HazardsContent />
    </Suspense>
  );
}
