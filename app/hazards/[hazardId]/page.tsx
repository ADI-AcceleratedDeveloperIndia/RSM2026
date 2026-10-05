"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, 
  MapPin, ShieldAlert, Flame, Wrench, ExternalLink,
  Building, User, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HazardDetailPage({
  params,
}: {
  params: Promise<{ hazardId: string }>;
}) {
  const { hazardId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHazard() {
      try {
        const res = await fetch(`/api/hazards/${hazardId}`);
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Error loading hazard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHazard();
  }, [hazardId]);

  if (loading) {
    return <div className="rs-container py-20 text-center text-slate-500">Loading hazard report...</div>;
  }

  if (!data?.hazard) {
    return (
      <div className="rs-container py-20 text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900">Hazard Report Not Found</h2>
        <p className="text-sm text-slate-500">Could not locate hazard ID: {hazardId}</p>
        <Link href="/hazards">
          <Button variant="outline">Back to Hazard Tracker</Button>
        </Link>
      </div>
    );
  }

  const { hazard, interventions } = data;

  const steps = [
    { id: "reported", label: "Reported" },
    { id: "assigned", label: "Assigned" },
    { id: "in_progress", label: "Rectifying" },
    { id: "resolved", label: "Resolved" },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === hazard.status);

  return (
    <div className="rs-container py-12 max-w-4xl space-y-8">
      <Link href="/hazards" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-700 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Hazard Tracker
      </Link>

      {/* Main Card */}
      <div className="rs-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                {hazard.hazardId}
              </span>
              <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {hazard.category.replace("_", " ")}
              </span>
              <span className={`capitalize text-xs font-bold px-2.5 py-1 rounded ${
                hazard.severity === "critical"
                  ? "bg-red-100 text-red-900"
                  : hazard.severity === "high"
                  ? "bg-orange-100 text-orange-900"
                  : "bg-yellow-100 text-yellow-900"
              }`}>
                {hazard.severity} Risk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{hazard.title}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-red-500" /> {hazard.location}, {hazard.district} District
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 text-xs text-slate-500">
            <p className="text-slate-400">Reported By</p>
            <p className="text-sm font-semibold text-slate-800">{hazard.reportedBy}</p>
            <p className="text-slate-400 mt-0.5">{new Date(hazard.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="py-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0" />
            {steps.map((step, idx) => {
              const isPast = currentStepIdx >= idx || hazard.status === "resolved";
              const isCurrent = hazard.status === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPast 
                      ? "bg-green-600 text-white shadow-md shadow-green-600/30 ring-4 ring-white" 
                      : "bg-slate-200 text-slate-500 ring-4 ring-white"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[11px] mt-2 font-medium ${isCurrent ? "text-green-700 font-bold" : isPast ? "text-slate-700" : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1">Hazard Description</h4>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{hazard.description}</p>
        </div>

        {/* Resolution Banner if resolved */}
        {hazard.status === "resolved" && (
          <div className="p-5 bg-green-50 border border-green-200 rounded-xl text-green-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-base">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Hazard Rectified & Resolved
            </div>
            <p className="text-xs text-green-700">
              Rectified by {hazard.resolvedBy} on {new Date(hazard.resolvedAt).toLocaleDateString()}.
            </p>
            {hazard.resolutionNotes && (
              <p className="text-xs text-green-800 bg-white/70 p-3 rounded-lg border border-green-100">
                <strong>Resolution Report:</strong> {hazard.resolutionNotes}
              </p>
            )}
          </div>
        )}

        {/* Department Assigned Info */}
        {hazard.assignedTo && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span>Assigned Agency: <strong>{hazard.assignedTo}</strong></span>
            </div>
            <span className="capitalize font-semibold text-blue-700">Status: {hazard.status}</span>
          </div>
        )}
      </div>

      {/* Before / After Evidence Photos */}
      <div className="rs-card p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Photographic Evidence</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50">
            <h4 className="text-xs font-bold uppercase text-slate-500">Reported Condition (Before)</h4>
            {hazard.photos && hazard.photos.length > 0 ? (
              hazard.photos.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-red-600 hover:underline">
                  View Photo Attachment #{i + 1} &rarr;
                </a>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No before photograph provided.</p>
            )}
          </div>

          <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50">
            <h4 className="text-xs font-bold uppercase text-slate-500">Fixed Condition (After)</h4>
            {hazard.afterPhotos && hazard.afterPhotos.length > 0 ? (
              hazard.afterPhotos.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-green-700 font-semibold hover:underline">
                  View Rectification Proof #{i + 1} &rarr;
                </a>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                {hazard.status === "resolved" ? "Rectified on site." : "Awaiting department completion photo."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
