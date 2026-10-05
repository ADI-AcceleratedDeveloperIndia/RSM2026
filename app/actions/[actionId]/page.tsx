"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, CheckCircle2, Clock, Shield, 
  GraduationCap, Wrench, Siren, Calendar,
  Users, MapPin, Plus, ExternalLink, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ActionDetailPage({
  params,
}: {
  params: Promise<{ actionId: string }>;
}) {
  const { actionId } = use(params);
  const [action, setAction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Update state
  const [evidenceType, setEvidenceType] = useState("photo");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [actualBeneficiaries, setActualBeneficiaries] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  useEffect(() => {
    loadAction();
  }, [actionId]);

  const loadAction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/actions/${actionId}`);
      if (!res.ok) throw new Error("Action not found");
      const data = await res.json();
      setAction(data.action);
      if (data.action.actualBeneficiaries) {
        setActualBeneficiaries(data.action.actualBeneficiaries.toString());
      }
    } catch (err: any) {
      setError(err.message || "Failed to load action details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl) return;
    setUpdating(true);
    setUpdateMsg("");

    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidenceItem: {
            type: evidenceType,
            url: evidenceUrl,
            description: evidenceDesc,
            uploadedAt: new Date(),
          },
          status: action.status === "committed" ? "in_progress" : action.status,
          actualBeneficiaries: actualBeneficiaries ? parseInt(actualBeneficiaries, 10) : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to add evidence");
      setEvidenceUrl("");
      setEvidenceDesc("");
      setUpdateMsg("Evidence added successfully!");
      loadAction();
    } catch (err: any) {
      alert(err.message || "Error updating evidence");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!confirm("Are you ready to mark this action as Completed for government verification?")) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completedDate: new Date(),
          actualBeneficiaries: actualBeneficiaries ? parseInt(actualBeneficiaries, 10) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to mark completed");
      loadAction();
    } catch (err: any) {
      alert(err.message || "Error completing action");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="rs-container py-20 text-center text-slate-500">Loading action details...</div>;
  }

  if (error || !action) {
    return (
      <div className="rs-container py-20 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Action Not Found</h2>
        <p className="text-sm text-slate-500">The action ID {actionId} does not exist or has been removed.</p>
        <Link href="/actions">
          <Button variant="outline">Back to Action Tracker</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { id: "committed", label: "Committed" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "verified", label: "Verified" },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === action.status);

  return (
    <div className="rs-container py-12 max-w-4xl space-y-8">
      <Link href="/actions" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Action Tracker
      </Link>

      {/* Main Details Card */}
      <div className="rs-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {action.actionId}
              </span>
              <span className="capitalize text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {action.fourECategory} Pillar
              </span>
              <span className="capitalize text-xs font-medium px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
                {action.priority} Priority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{action.title}</h1>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <p className="text-xs text-slate-400">Initiator</p>
            <p className="text-sm font-semibold text-slate-800">{action.submittedBy}</p>
            <p className="text-xs text-emerald-600 font-medium">{action.district} District</p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="py-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0" />
            {steps.map((step, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = action.status === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPast 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-white" 
                      : "bg-slate-200 text-slate-500 ring-4 ring-white"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[11px] mt-2 font-medium ${isCurrent ? "text-emerald-700 font-bold" : isPast ? "text-slate-700" : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {action.description && (
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1">Action Description</h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{action.description}</p>
          </div>
        )}

        {/* Verification Alert if verified */}
        {action.status === "verified" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Verified by Transport Authority
            </div>
            <p className="text-xs text-green-700">
              Verified by {action.verifiedBy} on {new Date(action.verifiedAt).toLocaleDateString()}. Impact Score: {action.impactScore}/100.
            </p>
            {action.verificationNotes && (
              <p className="text-xs text-green-800 italic mt-1">"{action.verificationNotes}"</p>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 border border-slate-100 rounded-xl">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Est. Beneficiaries</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{action.estimatedBeneficiaries}</p>
          </div>
          <div className="p-3 border border-slate-100 rounded-xl">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Actual Beneficiaries</p>
            <p className="text-lg font-bold text-emerald-700 mt-1">{action.actualBeneficiaries || "-"}</p>
          </div>
          <div className="p-3 border border-slate-100 rounded-xl">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Target Date</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {action.targetDate ? new Date(action.targetDate).toLocaleDateString() : "Flexible"}
            </p>
          </div>
          <div className="p-3 border border-slate-100 rounded-xl">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Evidence Items</p>
            <p className="text-lg font-bold text-indigo-700 mt-1">{action.evidence?.length || 0}</p>
          </div>
        </div>

        {/* Actions for Creator */}
        {action.status !== "verified" && (
          <div className="flex flex-wrap gap-3 pt-2">
            {action.status !== "completed" && (
              <Button onClick={handleMarkCompleted} disabled={updating} className="rs-btn-primary">
                Mark as Completed for Verification
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Evidence Section */}
      <div className="rs-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Evidence & Milestone Records</h2>
          <p className="text-xs text-slate-500 mt-1">
            Documentation, before/after photos, and reports to prove verified impact.
          </p>
        </div>

        {/* Existing Evidence List */}
        {action.evidence && action.evidence.length > 0 ? (
          <div className="space-y-3">
            {action.evidence.map((ev: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-100 rounded-xl flex items-start justify-between gap-4 bg-white hover:border-slate-200">
                <div>
                  <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ev.type}
                  </span>
                  <p className="text-sm font-medium text-slate-800 mt-1">{ev.description || "Evidence artifact"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(ev.uploadedAt).toLocaleString()}</p>
                </div>
                <a 
                  href={ev.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline shrink-0"
                >
                  View Evidence <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic py-2">No evidence uploaded yet. Add links or photos below.</p>
        )}

        {/* Add Evidence Form */}
        <form onSubmit={handleAddEvidence} className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add New Evidence Link / Document
          </h4>
          
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full border border-slate-300 rounded-md text-xs p-2 bg-white mt-1 h-9"
              >
                <option value="photo">Photo / Image</option>
                <option value="document">Document / PDF</option>
                <option value="video">Video URL</option>
                <option value="link">Public Drive / Social Post</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Evidence URL / Image Link *</Label>
              <Input
                placeholder="https://drive.google.com/... or image link"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                required
                className="text-xs mt-1 h-9"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Input
                placeholder="e.g. Photographs of students wearing helmets at event"
                value={evidenceDesc}
                onChange={(e) => setEvidenceDesc(e.target.value)}
                className="text-xs mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Actual Beneficiaries Count</Label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={actualBeneficiaries}
                onChange={(e) => setActualBeneficiaries(e.target.value)}
                className="text-xs mt-1 h-9"
              />
            </div>
          </div>

          {updateMsg && <p className="text-xs text-emerald-600 font-medium">{updateMsg}</p>}

          <Button type="submit" disabled={updating || !evidenceUrl} size="sm" className="rs-btn-primary">
            {updating ? "Saving..." : "Add Evidence Artifact"}
          </Button>
        </form>
      </div>
    </div>
  );
}
