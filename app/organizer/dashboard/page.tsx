"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Calendar, Award, CheckCircle2, Clock, Copy, Check,
  PlusCircle, LogOut, ExternalLink, ShieldCheck, FileText,
  AlertCircle, RefreshCw, Building, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrganizerSession {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  designation: string;
  status: "pending" | "approved" | "rejected";
  finalId: string | null;
  temporaryId: string;
}

interface OrganizerEvent {
  _id?: string;
  referenceId: string;
  title: string;
  date: string;
  location: string;
  approved: boolean;
  createdAt: string;
}

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const [organizer, setOrganizer] = useState<OrganizerSession | null>(null);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local session
    const stored = localStorage.getItem("rsm_organizer");
    if (!stored) {
      router.push("/organizer/login");
      return;
    }

    try {
      const parsed: OrganizerSession = JSON.parse(stored);
      setOrganizer(parsed);
      loadLiveOrganizerData(parsed);
    } catch (e) {
      localStorage.removeItem("rsm_organizer");
      router.push("/organizer/login");
    }
  }, [router]);

  const loadLiveOrganizerData = async (org: OrganizerSession) => {
    setLoading(true);
    try {
      // Refresh status from server to catch approval updates
      if (org.temporaryId) {
        try {
          const statusRes = await fetch(
            `/api/organizer/status?temporaryId=${encodeURIComponent(org.temporaryId)}`
          );
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.status && statusData.status !== org.status) {
              const updated = {
                ...org,
                status: statusData.status,
                finalId: statusData.finalId || org.finalId,
              };
              setOrganizer(updated);
              localStorage.setItem("rsm_organizer", JSON.stringify(updated));
              org = updated;
            }
          }
        } catch (e) {
          console.warn("Status refresh failed:", e);
        }
      }

      // Fetch events
      const idToQuery = org.finalId || org.temporaryId;
      if (idToQuery) {
        const eventsRes = await fetch(`/api/organizer/events?organizerId=${encodeURIComponent(idToQuery)}`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events || []);
        }
      }
    } catch (err) {
      console.error("Error loading organizer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!organizer) return;
    setRefreshing(true);
    await loadLiveOrganizerData(organizer);
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("rsm_organizer");
    router.push("/organizer/login");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && !organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading Organizer Workspace...</p>
        </div>
      </div>
    );
  }

  if (!organizer) return null;

  const isApproved = organizer.status === "approved" && !!organizer.finalId;
  const approvedEventsCount = events.filter((e) => e.approved).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  Organizer Mission Hub
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  RSM 2027
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                National Road Safety Month — Verifiable Ground Action & Impact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs h-9 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </Button>

            <Link href="/" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm" className="text-xs h-9">
                Public Site
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs h-9 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur text-emerald-100">
                  {organizer.designation || "Institutional Coordinator"}
                </span>
                {isApproved ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400 text-emerald-950 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="h-3 w-3" /> OFFICIAL VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-950 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> VERIFICATION PENDING
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {organizer.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-emerald-100">
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-emerald-300" />
                  {organizer.institution}
                </span>
                <span>•</span>
                <span>{organizer.email}</span>
                <span>•</span>
                <span>{organizer.phone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Link href="/events/create">
                <Button className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 font-semibold gap-1.5 shadow-md text-sm">
                  <PlusCircle className="h-4 w-4" />
                  <span>Conduct New Event</span>
                </Button>
              </Link>
              <Link href="/certificates">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 text-sm gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>Issue Certificates</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Verification Status Card */}
        {isApproved ? (
          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Official Organizer Credential
                </CardTitle>
                <Badge className="bg-emerald-600 text-white font-mono text-xs">ACTIVE</Badge>
              </div>
              <CardDescription className="text-xs text-emerald-800">
                Approved by District Road Transport Authority Head. Use this official Final ID to tag events and validate mass participant certificates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200">
                <div className="flex-1 w-full">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Official Final Organizer ID
                  </p>
                  <p className="font-mono text-base sm:text-lg font-bold text-emerald-900 select-all">
                    {organizer.finalId}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(organizer.finalId!, "finalId")}
                  className="w-full sm:w-auto gap-1 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  {copiedId === "finalId" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy ID
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-amber-50/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-amber-950 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Application Under Nodal Review
                </CardTitle>
                <Badge className="bg-amber-500 text-white font-mono text-xs">PENDING APPROVAL</Badge>
              </div>
              <CardDescription className="text-xs text-amber-800">
                Your credentials have been submitted and are under review by the District Road Transport Authority Head. You can still prepare events using your Temporary ID.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
                <div className="flex-1 w-full">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Temporary Organizer Reference ID
                  </p>
                  <p className="font-mono text-base sm:text-lg font-bold text-amber-900 select-all">
                    {organizer.temporaryId}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(organizer.temporaryId, "tempId")}
                  className="w-full sm:w-auto gap-1 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                >
                  {copiedId === "tempId" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-amber-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy ID
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Events Registered</p>
                <p className="text-2xl font-bold text-slate-900">{events.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Under this organizer account</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Approved Events</p>
                <p className="text-2xl font-bold text-emerald-700">{approvedEventsCount}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Government validated</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Verification Tier</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isApproved ? "Official Node" : "Provisional"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">State Transport Framework</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizer Events Table */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base text-slate-900">Conducted Road Safety Events</CardTitle>
              <CardDescription className="text-xs">
                Real-time records of rallies, workshops, safety pledges, and curriculum drives.
              </CardDescription>
            </div>
            <Link href="/events/create">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Event</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">No events registered yet</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Organize an awareness rally, student quiz, or helmet drive and register it here to generate official certificates for your participants.
                  </p>
                </div>
                <Link href="/events/create">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    Register Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Event Title</th>
                      <th className="py-3 px-4">Reference ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((evt) => (
                      <tr key={evt.referenceId} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {evt.title}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 flex items-center gap-1.5 mt-2">
                          <span>{evt.referenceId}</span>
                          <button
                            onClick={() => copyToClipboard(evt.referenceId, evt.referenceId)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Copy Reference ID"
                          >
                            {copiedId === evt.referenceId ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(evt.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {evt.location}
                        </td>
                        <td className="py-3 px-4">
                          {evt.approved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="h-3 w-3" /> Under Review
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/events/${evt.referenceId}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                              <span>Details</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
