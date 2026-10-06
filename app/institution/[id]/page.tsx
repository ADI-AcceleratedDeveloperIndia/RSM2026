"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  Building2, ArrowLeft, MapPin, CheckCircle2, 
  Users, Calendar, Target, Mail, Phone, Award, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstitutionProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInstitution() {
      try {
        const res = await fetch(`/api/institutions/${id}`);
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Error loading institution:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInstitution();
  }, [id]);

  if (loading) {
    return <div className="rs-container py-20 text-center text-slate-500">Loading institution profile...</div>;
  }

  if (!data?.institution) {
    return (
      <div className="rs-container py-20 text-center space-y-4">
        <Building2 className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900">Institution Not Found</h2>
        <p className="text-sm text-slate-500">Could not locate institution with ID: {id}</p>
        <Link href="/institution">
          <Button variant="outline">Back to Institutions</Button>
        </Link>
      </div>
    );
  }

  const { institution, metrics, recentActions, recentEvents } = data;

  return (
    <div className="rs-container py-12 max-w-4xl space-y-8">
      <Link href="/institution" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-700 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Institutions Directory
      </Link>

      {/* Header Profile */}
      <div className="rs-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                {institution.institutionId}
              </span>
              <span className="capitalize text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {institution.type}
              </span>
              {institution.status === "verified" ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Accredited Institution
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  Registered (Pending Verification)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{institution.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" /> {institution.district} District • {institution.address || "State Government"}
            </p>
          </div>

          <Link href="/actions/submit">
            <Button size="sm" className="rs-btn-primary gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" /> Submit Action
            </Button>
          </Link>
        </div>

        {/* Coordinator Info */}
        <div className="grid sm:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
          <div>
            <p className="text-xs text-slate-400">Coordinator / POC</p>
            <p className="font-semibold text-slate-800 mt-0.5">{institution.contactPerson}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Official Email</p>
            <p className="text-slate-700 mt-0.5 truncate">{institution.contactEmail}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Contact Phone</p>
            <p className="text-slate-700 mt-0.5">{institution.contactPhone}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 border border-slate-100 rounded-xl">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Participants</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metrics?.totalParticipants || 0}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Certificates earned</p>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl">
            <p className="text-xs text-slate-400 uppercase font-semibold">Events Conducted</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{metrics?.totalEvents || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Campaign drives</p>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl">
            <p className="text-xs text-slate-400 uppercase font-semibold">Safety Actions</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{metrics?.totalActions || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Committed & completed</p>
          </div>
        </div>
      </div>

      {/* Linked Safety Actions */}
      <div className="rs-card p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Safety Actions by this Institution</h2>
            <p className="text-xs text-slate-500">Initiatives and community safety drives</p>
          </div>
          <Link href="/actions/submit" className="text-xs text-emerald-700 font-semibold hover:underline">
            + New Action
          </Link>
        </div>

        {recentActions && recentActions.length > 0 ? (
          <div className="space-y-3">
            {recentActions.map((act: any) => (
              <Link key={act._id} href={`/actions/${act.actionId}`} className="block">
                <div className="p-4 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors bg-white flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs text-emerald-700 font-medium">{act.actionId}</span>
                    <h4 className="font-semibold text-sm text-slate-900 mt-0.5">{act.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Pillar: {act.fourECategory} • Status: {act.status}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">View &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic py-2">No safety actions logged yet.</p>
        )}
      </div>

      {/* Linked Events */}
      <div className="rs-card p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Campaign Events Conducted</h2>
            <p className="text-xs text-slate-500">Official Road Safety Month events</p>
          </div>
          <Link href="/events" className="text-xs text-emerald-700 font-semibold hover:underline">
            Browse All Events
          </Link>
        </div>

        {recentEvents && recentEvents.length > 0 ? (
          <div className="space-y-3">
            {recentEvents.map((evt: any) => (
              <Link key={evt._id} href={`/events/${evt.referenceId}`} className="block">
                <div className="p-4 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors bg-white flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs text-indigo-700 font-medium">{evt.referenceId}</span>
                    <h4 className="font-semibold text-sm text-slate-900 mt-0.5">{evt.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Date: {new Date(evt.date).toLocaleDateString()} • Location: {evt.location}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">View &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic py-2">No campaign events logged yet.</p>
        )}
      </div>
    </div>
  );
}
