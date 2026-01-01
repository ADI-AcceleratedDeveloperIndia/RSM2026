"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, FileText, Users, Download, Calendar, CheckCircle2, XCircle, Clock, Eye, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Event = {
  referenceId: string;
  title: string;
  date: string;
  location: string;
  organizerId: string;
  organizerName: string;
  institution: string;
  approved: boolean;
  createdAt: string;
};

type Participant = {
  certificateId: string;
  name: string;
  institution: string;
  score: number;
  total: number;
  percentage: number;
  activityType: string;
  certificateDate: string;
};

type EventParticipants = {
  event: {
    referenceId: string;
    title: string;
    date: string;
    location: string;
    organizerName: string;
  };
  participants: Participant[];
  totalParticipants: number;
};

type Organizer = {
  _id: string;
  temporaryId: string;
  finalId?: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  designation: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type OrganizerWithEvents = Organizer & {
  events: Event[];
  eventCount: number;
};

type DailyReport = {
  date: string;
  stats: {
    totalCertificates: number;
    totalAppreciations: number;
    totalEvents: number;
    totalQuizPasses: number;
    totalQuizAttempts: number;
    passRate: number;
    totalSimulationPlays: number;
    successRate: number;
    avgTimeSeconds: number;
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalAppreciations: 0,
    totalEvents: 0,
    totalQuizCertificates: 0,
    quizParticipant: 0,
    quizMerit: 0,
    quizTopper: 0,
    quizParticipantRate: 0,
    quizMeritRate: 0,
    quizTopperRate: 0,
    totalQuizAttempts: 0,
    totalSimulationPlays: 0,
    successRate: 0,
    avgTimeSeconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState<OrganizerWithEvents[]>([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);
  const [expandedOrganizers, setExpandedOrganizers] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventParticipants, setEventParticipants] = useState<EventParticipants | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [appreciations, setAppreciations] = useState<{ fullName: string; appreciationText: string; createdAt: string }[]>([]);
  const [loadingAppreciations, setLoadingAppreciations] = useState(false);
  const [parentsPledges, setParentsPledges] = useState<{ _id: string; childName: string; institutionName: string; parentName: string; district: string; createdAt: string }[]>([]);
  const [loadingPledges, setLoadingPledges] = useState(false);
  const [clubEntries, setClubEntries] = useState<{ _id: string; institutionName: string; district: string; pointOfContact: string; organizerId: string; createdAt: string }[]>([]);
  const [loadingClub, setLoadingClub] = useState(false);

  useEffect(() => {
    loadStats();
    loadOrganizers();
    loadDailyReports();
    loadAppreciations();
    loadParentsPledges();
    loadClubEntries();
  }, []);

  const loadAppreciations = async () => {
    setLoadingAppreciations(true);
    try {
      const res = await fetch("/api/admin/appreciations/list");
      const data = await res.json();
      setAppreciations(data.items || []);
    } catch (error) {
      console.error("Error loading appreciations:", error);
    } finally {
      setLoadingAppreciations(false);
    }
  };

  const loadParentsPledges = async () => {
    setLoadingPledges(true);
    try {
      const res = await fetch("/api/admin/parents-pledge/list");
      const data = await res.json();
      setParentsPledges(data.items || []);
    } catch (error) {
      console.error("Error loading parents pledges:", error);
    } finally {
      setLoadingPledges(false);
    }
  };

  const loadClubEntries = async () => {
    setLoadingClub(true);
    try {
      const res = await fetch("/api/admin/club/list");
      const data = await res.json();
      setClubEntries(data.items || []);
    } catch (error) {
      console.error("Error loading club entries:", error);
    } finally {
      setLoadingClub(false);
    }
  };

  const loadStats = async () => {
    try {
      const overviewRes = await fetch("/api/stats/overview");
      const overviewData = await overviewRes.json();

      const totalQuizAttempts = overviewData.totalQuizAttempts || 0;
      const totalQuizPasses = overviewData.totalQuizPasses || 0;
      const passRate = totalQuizAttempts > 0 ? Math.round((totalQuizPasses / totalQuizAttempts) * 100) : 0;

      const totalSimulationPlays = overviewData.totalSimulationPlays || 0;
      const successRate = overviewData.successRate || 0;

      setStats({
        totalCertificates: overviewData.totalCertificates || 0,
        totalAppreciations: overviewData.totalAppreciations || 0,
        totalEvents: overviewData.totalEvents || 0,
        totalQuizCertificates: overviewData.totalQuizCertificates || 0,
        quizParticipant: overviewData.quizParticipant || 0,
        quizMerit: overviewData.quizMerit || 0,
        quizTopper: overviewData.quizTopper || 0,
        quizParticipantRate: overviewData.quizParticipantRate || 0,
        quizMeritRate: overviewData.quizMeritRate || 0,
        quizTopperRate: overviewData.quizTopperRate || 0,
        totalQuizAttempts: overviewData.totalQuizAttempts || 0,
        totalSimulationPlays,
        successRate,
        avgTimeSeconds: 0, // Will be calculated from daily reports if needed
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizers = async () => {
    setLoadingOrganizers(true);
    try {
      const [organizersRes, eventsRes] = await Promise.all([
        fetch("/api/admin/organizers/list"),
        fetch("/api/admin/events/list"),
      ]);
      const organizersData = await organizersRes.json();
      const eventsData = await eventsRes.json();

      const organizersMap = new Map<string, OrganizerWithEvents>();
      
      // Initialize organizers
      organizersData.organizers.forEach((org: Organizer) => {
        organizersMap.set(org.finalId || org.temporaryId, {
          ...org,
          events: [],
          eventCount: 0,
        });
      });

      // Group events by organizer
      eventsData.events.forEach((event: Event) => {
        const organizer = organizersMap.get(event.organizerId);
        if (organizer) {
          organizer.events.push(event);
          organizer.eventCount++;
        }
      });

      setOrganizers(Array.from(organizersMap.values()));
    } catch (error) {
      console.error("Error loading organizers:", error);
    } finally {
      setLoadingOrganizers(false);
    }
  };

  const loadDailyReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch("/api/admin/daily-report/list");
      const data = await res.json();
      setDailyReports(data.reports || []);
    } catch (error) {
      console.error("Error loading daily reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const toggleOrganizer = (organizerId: string) => {
    const newExpanded = new Set(expandedOrganizers);
    if (newExpanded.has(organizerId)) {
      newExpanded.delete(organizerId);
    } else {
      newExpanded.add(organizerId);
    }
    setExpandedOrganizers(newExpanded);
  };

  const handleViewParticipants = async (eventReferenceId: string) => {
    setSelectedEvent(eventReferenceId);
    setLoadingParticipants(true);
    try {
      const res = await fetch(`/api/admin/events/participants?eventReferenceId=${eventReferenceId}`);
      const data = await res.json();
      setEventParticipants(data);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleDownloadDailyReport = async (date: string) => {
    try {
      const res = await fetch(`/api/admin/daily-report/download?date=${date}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-report-${date}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report");
    }
  };

  const handleExportAppreciations = async () => {
    try {
      const res = await fetch("/api/admin/appreciations/export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "appreciations.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export");
    }
  };

  const handleApproveOrganizer = async (temporaryId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this organizer?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/organizers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temporaryId, action }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrganizers(); // Refresh the list
        alert(`Organizer ${action === "approve" ? "approved" : "rejected"} successfully`);
      } else {
        alert(data.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error approving/rejecting organizer:", error);
      alert("Failed to process request");
    }
  };

  const handleDownloadTodayData = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // First, try to collect today's data (this will create the report if it doesn't exist)
      const collectRes = await fetch("/api/admin/daily-report/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });
      
      if (!collectRes.ok) {
        const errorData = await collectRes.json().catch(() => ({}));
        if (errorData.message && errorData.message.includes("already exists")) {
          // Report already exists, proceed to download
        } else {
          throw new Error(errorData.error || "Failed to collect today's data");
        }
      }
      
      // Wait a moment for the report to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now download it
      const downloadRes = await fetch(`/api/admin/daily-report/download?date=${today}`);
      if (!downloadRes.ok) {
        if (downloadRes.status === 404) {
          alert("Report not found. Please try again in a moment.");
        } else {
          throw new Error("Failed to download report");
        }
        return;
      }
      
      const blob = await downloadRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `last-24-hours-${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading today's data:", error);
      alert(`Failed to download today's data: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const statCards = [
    {
      label: "Total Organizers",
      value: organizers.length,
      icon: <Users className="h-6 w-6" />,
    },
    {
      label: "Total Events",
      value: stats.totalEvents,
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      label: "Total Certificates",
      value: stats.totalCertificates,
      icon: <FileText className="h-6 w-6" />,
    },
    {
      label: "Appreciations",
      value: stats.totalAppreciations,
      icon: <Award className="h-6 w-6" />,
    },
  ];

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="rs-chip">Transport Department • Admin • Karimnagar</span>
            <h1 className="text-3xl font-semibold text-emerald-900 mt-2">Admin Dashboard</h1>
            <p className="text-slate-600 max-w-2xl">
              Monitor organizers, events, participants, and download daily reports.
            </p>
          </div>
          <p className="text-sm text-emerald-700">{loading ? "Loading..." : "Data refreshed"}</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rs-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                {card.icon}
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-blink"></span>
                Live
              </span>
            </div>
            <p className="text-3xl font-semibold text-emerald-900 mt-4">{card.value}</p>
            <p className="text-sm text-slate-600">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600 font-medium">Quiz Certificate Distribution</p>
          <p className="text-xs text-slate-500 mb-2">Based on quiz certificates generated</p>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Participant (&lt;60%):</span>
              <span className="text-sm font-semibold text-emerald-900">{stats.quizParticipantRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Merit (60-79%):</span>
              <span className="text-sm font-semibold text-blue-900">{stats.quizMeritRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Topper (≥80%):</span>
              <span className="text-sm font-semibold text-yellow-900">{stats.quizTopperRate}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t">
            Total: {stats.totalQuizCertificates} quiz certificates
          </p>
        </div>
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600 font-medium">Simulation Success Rate</p>
          <p className="text-xs text-slate-500 mb-1">Users completing simulations successfully</p>
          <p className="text-4xl font-semibold text-emerald-900">{stats.successRate}%</p>
          <p className="text-xs text-slate-500 mt-2">{stats.totalSimulationPlays > 0 ? `${Math.round((stats.totalSimulationPlays * stats.successRate) / 100)} completed / ${stats.totalSimulationPlays} total plays` : "No simulation data"}</p>
        </div>
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600 font-medium">Appreciation Rate</p>
          <p className="text-xs text-slate-500 mb-1">Certificates with appreciation messages</p>
          <p className="text-4xl font-semibold text-emerald-900">
            {stats.totalCertificates > 0 ? Math.round((stats.totalAppreciations / stats.totalCertificates) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-2">{stats.totalAppreciations} appreciations / {stats.totalCertificates} certificates</p>
        </div>
      </div>

      {/* Organizers with Events */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Organizers & Events</h2>
            <p className="text-sm text-slate-600">Total: {organizers.length} organizers</p>
          </div>
          <Button onClick={loadOrganizers} variant="outline" size="sm" disabled={loadingOrganizers}>
            Refresh
          </Button>
        </div>
        {loadingOrganizers ? (
          <div className="text-center py-8 text-slate-600">Loading organizers...</div>
        ) : organizers.length === 0 ? (
          <div className="text-sm text-slate-600 text-center py-8">No organizers registered yet</div>
        ) : (
          <div className="space-y-3">
            {organizers.map((org) => (
              <div
                key={org._id}
                className={`rounded-xl border p-4 ${
                  org.status === "approved"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : org.status === "rejected"
                    ? "border-red-200 bg-red-50/50"
                    : "border-yellow-200 bg-yellow-50/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-emerald-900">{org.fullName}</div>
                      {org.status === "approved" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : org.status === "rejected" ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>Institution: {org.institution}</div>
                      <div>Designation: {org.designation}</div>
                      {org.finalId && (
                        <div className="text-xs font-mono text-emerald-700">
                          Organizer ID: {org.finalId}
                        </div>
                      )}
                      <div className="text-xs font-semibold text-emerald-800 mt-2">
                        Events: {org.eventCount}
                      </div>
                    </div>
                  </div>
                  {org.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleApproveOrganizer(org.temporaryId, "approve")}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproveOrganizer(org.temporaryId, "reject")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
                {org.eventCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <button
                      onClick={() => toggleOrganizer(org._id)}
                      className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900"
                    >
                      {expandedOrganizers.has(org._id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {expandedOrganizers.has(org._id) ? "Hide" : "Show"} Events ({org.eventCount})
                    </button>
                    {expandedOrganizers.has(org._id) && (
                      <div className="mt-3 space-y-2">
                        {org.events.map((event) => (
                          <div
                            key={event.referenceId}
                            className="rounded-lg border border-emerald-100 bg-white p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-emerald-900">{event.title}</div>
                                <div className="text-xs text-slate-600 mt-1 space-y-1">
                                  <div>Event ID: <span className="font-mono text-emerald-700">{event.referenceId}</span></div>
                                  <div>Organizer ID: <span className="font-mono text-blue-700">{event.organizerId}</span></div>
                                  <div>Date: {new Date(event.date).toLocaleDateString()}</div>
                                  <div>Location: {event.location}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {event.approved ? (
                                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Approved
                                      </span>
                                    ) : (
                                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 ml-3"
                                onClick={() => handleViewParticipants(event.referenceId)}
                              >
                                <Eye className="h-4 w-4" />
                                Participants
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Reports */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Daily Reports</h2>
            <p className="text-sm text-slate-600">Download 24-hour data (12 AM to 11:59 PM) for any date</p>
            <p className="text-xs text-amber-700 mt-1 bg-amber-50 p-2 rounded">
              📅 <strong>Note:</strong> Daily reports are automatically collected at 11:59 PM each day and stored permanently. 
              You can download today's data anytime using the button below. Historical reports are available after collection.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadTodayData} className="rs-btn-secondary text-sm" disabled={loadingReports}>
              <Download className="h-4 w-4 mr-1" />
              {loadingReports ? "Generating..." : "Download Last 24 Hours"}
            </Button>
            <Button onClick={loadDailyReports} variant="outline" size="sm" disabled={loadingReports}>
              Refresh
            </Button>
          </div>
        </div>
        {loadingReports ? (
          <div className="text-center py-8 text-slate-600">Loading reports...</div>
        ) : dailyReports.length === 0 ? (
          <div className="text-sm text-slate-600 text-center py-8">No daily reports available yet</div>
        ) : (
          <div className="space-y-2">
            {dailyReports.map((report) => (
              <div
                key={report.date}
                className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-3"
              >
                <div>
                  <div className="font-medium text-emerald-900">{report.date}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Certificates: {report.stats.totalCertificates} | Events: {report.stats.totalEvents} | 
                    Pass Rate: {report.stats.passRate}% | Success Rate: {report.stats.successRate}%
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleDownloadDailyReport(report.date)}
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appreciations */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Appreciation Messages</h2>
            <p className="text-sm text-slate-600">Latest appreciation messages from certificate recipients</p>
            <p className="text-xs text-slate-500 mt-1">Total: {appreciations.length} messages</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadAppreciations} 
              variant="outline" 
              size="sm" 
              disabled={loadingAppreciations}
            >
              {loadingAppreciations ? "Loading..." : "Refresh"}
            </Button>
            <Button 
              onClick={handleExportAppreciations} 
              className="rs-btn-secondary text-sm"
              disabled={loadingAppreciations || appreciations.length === 0}
            >
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>
        </div>
        {loadingAppreciations ? (
          <div className="text-center py-8 text-slate-600">Loading appreciations...</div>
        ) : appreciations.length === 0 ? (
          <div className="text-sm text-slate-600 text-center py-8">
            <p>No appreciations yet</p>
            <p className="text-xs text-slate-500 mt-2">Appreciations will appear here when users submit feedback after downloading certificates.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {appreciations.slice(0, 50).map((a, idx) => (
              <div key={idx} className="rounded-xl border border-emerald-100 bg-white/90 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-emerald-900">{a.fullName || "Anonymous"}</div>
                  <div className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-slate-600 whitespace-pre-wrap">{a.appreciationText || "No message"}</div>
              </div>
            ))}
            {appreciations.length > 50 && (
              <div className="text-center text-sm text-slate-500 pt-2">
                Showing latest 50 of {appreciations.length} appreciations. Export CSV to see all.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Parents Pledge */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Parents Pledge (హామీ పత్రం)</h2>
            <p className="text-sm text-slate-600">All parent pledge submissions</p>
            <p className="text-xs text-slate-500 mt-1">Total: {parentsPledges.length} pledges</p>
          </div>
          <Button 
            onClick={loadParentsPledges} 
            variant="outline" 
            size="sm" 
            disabled={loadingPledges}
          >
            {loadingPledges ? "Loading..." : "Refresh"}
          </Button>
        </div>
        {loadingPledges ? (
          <div className="text-center py-8 text-slate-600">Loading pledges...</div>
        ) : parentsPledges.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p>No pledges submitted yet</p>
          </div>
        ) : (
          <div className="rs-table-wrapper">
            <table className="rs-table text-sm">
              <thead>
                <tr>
                  <th className="text-left">Child Name</th>
                  <th className="text-left">Parent Name</th>
                  <th className="text-left">Institution</th>
                  <th className="text-left">District</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {parentsPledges.map((pledge) => (
                  <tr key={pledge._id}>
                    <td className="font-medium">{pledge.childName}</td>
                    <td>{pledge.parentName}</td>
                    <td>{pledge.institutionName}</td>
                    <td>{pledge.district}</td>
                    <td className="text-xs">{new Date(pledge.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Club Entries */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Road Safety Club</h2>
            <p className="text-sm text-slate-600">Schools and institutions that joined the Club</p>
            <p className="text-xs text-slate-500 mt-1">Total: {clubEntries.length} members</p>
          </div>
          <Button 
            onClick={loadClubEntries} 
            variant="outline" 
            size="sm" 
            disabled={loadingClub}
          >
            {loadingClub ? "Loading..." : "Refresh"}
          </Button>
        </div>
        {loadingClub ? (
          <div className="text-center py-8 text-slate-600">Loading club entries...</div>
        ) : clubEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p>No club members yet</p>
          </div>
        ) : (
          <div className="rs-table-wrapper">
            <table className="rs-table text-sm">
              <thead>
                <tr>
                  <th className="text-left">Institution</th>
                  <th className="text-left">District</th>
                  <th className="text-left">Point of Contact</th>
                  <th className="text-left">Organizer ID</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {clubEntries.map((entry) => (
                  <tr key={entry._id}>
                    <td className="font-medium">{entry.institutionName}</td>
                    <td>{entry.district}</td>
                    <td>{entry.pointOfContact}</td>
                    <td className="font-mono text-xs">{entry.organizerId}</td>
                    <td className="text-xs">{new Date(entry.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Participants Dialog */}
      <Dialog open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Event Participants</DialogTitle>
            <DialogDescription>
              View all participants and their details for this event
            </DialogDescription>
          </DialogHeader>
          {loadingParticipants ? (
            <div className="py-8 text-center text-slate-600">Loading participants...</div>
          ) : eventParticipants ? (
            <div className="space-y-6 mt-4">
              <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-slate-600">Event:</span>
                  <span className="ml-2 font-medium text-emerald-900">{eventParticipants.event.title}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Organizer:</span>
                  <span className="ml-2 font-medium text-emerald-900">{eventParticipants.event.organizerName}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Total Participants:</span>
                  <span className="ml-2 font-medium text-emerald-900">{eventParticipants.totalParticipants}</span>
                </div>
              </div>

              {eventParticipants.participants.length === 0 ? (
                <div className="text-center py-8 text-slate-600">No participants yet for this event</div>
              ) : (
                <div className="rs-table-wrapper">
                  <table className="rs-table text-sm">
                    <thead>
                      <tr>
                        <th className="text-left">Name</th>
                        <th className="text-left">Institution</th>
                        <th className="text-left">Score</th>
                        <th className="text-left">Activity</th>
                        <th className="text-left">Certificate ID</th>
                        <th className="text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventParticipants.participants.map((p, idx) => (
                        <tr key={idx}>
                          <td className="font-medium">{p.name}</td>
                          <td>{p.institution}</td>
                          <td>
                            {p.score}/{p.total} ({p.percentage}%)
                          </td>
                          <td className="capitalize">{p.activityType}</td>
                          <td className="font-mono text-xs">{p.certificateId}</td>
                          <td className="text-xs">{new Date(p.certificateDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-600">No data available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
