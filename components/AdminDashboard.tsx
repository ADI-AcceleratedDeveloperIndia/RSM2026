"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, FileText, Users, Download, Activity, MapPin, Calendar, CheckCircle2, XCircle, Clock, Eye, UserCheck, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Event = {
  referenceId: string;
  title: string;
  date: string;
  location: string;
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
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalAppreciations: 0,
    totalEvents: 0,
    totalQuizPasses: 0,
    totalQuizAttempts: 0,
    passRate: 0,
    totalSimulationPlays: 0,
  });
  const [simStats, setSimStats] = useState({
    totalSessions: 0,
    totalCompletions: 0,
    successRate: 0,
    categoryStats: [] as { category: string; total: number; successful: number }[],
    avgTimeSeconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [appreciations, setAppreciations] = useState<{ fullName: string; appreciationText: string; createdAt: string }[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventParticipants, setEventParticipants] = useState<EventParticipants | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [loadingAllParticipants, setLoadingAllParticipants] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats/overview").then((res) => res.json()).catch(() => ({})),
      fetch("/api/sim/stats").then((res) => res.json()).catch(() => ({})),
      fetch("/api/admin/events/list").then((res) => res.json()).catch(() => ({ events: [] })),
    ])
      .then(([overviewData, simData, eventsData]) => {
        if (overviewData && typeof overviewData === 'object') {
          setStats({
            totalCertificates: overviewData.totalCertificates || 0,
            totalAppreciations: overviewData.totalAppreciations || 0,
            totalEvents: overviewData.totalEvents || 0,
            totalQuizPasses: overviewData.totalQuizPasses || 0,
            totalQuizAttempts: overviewData.totalQuizAttempts || 0,
            passRate: overviewData.passRate || 0,
            totalSimulationPlays: overviewData.totalSimulationPlays || 0,
          });
        }
        if (simData && simData.categoryStats && Array.isArray(simData.categoryStats)) {
          setSimStats(simData);
        }
        if (eventsData && eventsData.events) {
          setEvents(eventsData.events);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/appreciations/list")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setAppreciations(data.items || []))
      .catch(() => setAppreciations([]));
  }, []);

  useEffect(() => {
    loadOrganizers();
    loadAllParticipants();
  }, []);

  const loadOrganizers = async () => {
    setLoadingOrganizers(true);
    try {
      const response = await fetch("/api/admin/organizers/list");
      const data = await response.json();
      if (response.ok) {
        setOrganizers(data.organizers || []);
      }
    } catch (error) {
      console.error("Failed to load organizers:", error);
    } finally {
      setLoadingOrganizers(false);
    }
  };

  const loadAllParticipants = async () => {
    setLoadingAllParticipants(true);
    try {
      const response = await fetch("/api/admin/participants/list?limit=100");
      const data = await response.json();
      if (response.ok) {
        setAllParticipants(data.participants || []);
      }
    } catch (error) {
      console.error("Failed to load participants:", error);
    } finally {
      setLoadingAllParticipants(false);
    }
  };

  const handleApproveOrganizer = async (temporaryId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch("/api/admin/organizers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temporaryId, action }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(action === "approve" ? `Organizer approved! Final ID: ${data.finalId}` : "Organizer rejected");
        loadOrganizers();
      } else {
        alert(data.error || "Failed to process organizer");
      }
    } catch (error) {
      alert("Failed to process organizer");
    }
  };

  const handleViewParticipants = async (eventReferenceId: string) => {
    setSelectedEvent(eventReferenceId);
    setLoadingParticipants(true);
    try {
      const response = await fetch(`/api/admin/events/participants?eventReferenceId=${eventReferenceId}`);
      const data = await response.json();
      if (response.ok) {
        setEventParticipants(data);
      } else {
        alert(data.error || "Failed to load participants");
      }
    } catch (error) {
      alert("Failed to load participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/appreciations/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "appreciations.csv";
      a.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export");
    }
  };

  const statCards = [
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
    {
      label: "Quiz Attempts",
      value: stats.totalQuizAttempts,
      icon: <Users className="h-6 w-6" />,
    },
    {
      label: "Quiz Passes",
      value: stats.totalQuizPasses,
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
              Monitor certificate issuance, quiz performance, simulation insights, and events for Karimnagar district.
            </p>
          </div>
          <p className="text-sm text-emerald-700">{loading ? "Loading..." : "Data refreshed"}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rs-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                {card.icon}
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Live</span>
            </div>
            <p className="text-3xl font-semibold text-emerald-900 mt-4">{card.value}</p>
            <p className="text-sm text-slate-600">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600">Quiz pass rate</p>
          <p className="text-4xl font-semibold text-emerald-900">{stats.passRate}%</p>
          <p className="text-xs text-slate-500 mt-2">Passes vs attempts</p>
        </div>
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600">Total simulation plays</p>
          <p className="text-4xl font-semibold text-emerald-900">{stats.totalSimulationPlays}</p>
          <p className="text-xs text-slate-500 mt-2">Includes all interactive scenarios</p>
        </div>
      </div>

      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Events</h2>
            <p className="text-sm text-slate-600">Manage and view event participants</p>
          </div>
        </div>
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-sm text-slate-600 text-center py-8">No events yet</div>
          ) : (
            events.map((event) => (
              <div
                key={event.referenceId}
                className="rounded-xl border border-emerald-100 bg-white/90 p-4 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-emerald-900 text-lg">{event.title}</div>
                      {event.approved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Organizer: {event.organizerName}</div>
                    <div className="text-sm text-slate-600">Institution: {event.institution}</div>
                    <div className="text-xs text-slate-500 mt-2 flex gap-4">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-700 mt-2 font-mono">{event.referenceId}</div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleViewParticipants(event.referenceId)}
                    >
                      <Eye className="h-4 w-4" />
                      View Participants
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rs-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-900">Export Appreciations</h2>
          <p className="text-sm text-slate-600">Download all appreciation messages as CSV.</p>
        </div>
        <Button onClick={handleExport} className="rs-btn-secondary text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rs-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Simulation Statistics</h2>
            <p className="text-sm text-slate-600">Spot the Violation metrics</p>
          </div>
          <span className="rs-chip">Avg Time: {simStats.avgTimeSeconds}s</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-slate-600">
          <div>
            <p>Total sessions</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.totalSessions}</p>
          </div>
          <div>
            <p>Total completions</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.totalCompletions}</p>
          </div>
          <div>
            <p>Success rate</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.successRate}%</p>
          </div>
          <div>
            <p>Avg Time</p>
            <p className="text-2xl font-semibold text-emerald-900">{simStats.avgTimeSeconds}s</p>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-emerald-900 mb-3">Completions by Category</h3>
            <div className="space-y-2">
              {simStats.categoryStats && simStats.categoryStats.length > 0 ? (
                simStats.categoryStats.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <span className="capitalize">{cat.category}</span>
                    <span className="font-semibold text-emerald-800">
                      {cat.successful} / {cat.total}
                    </span>
                  </div>
                ))
              ) : (
                <p>No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Organizers Section */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Organizers</h2>
            <p className="text-sm text-slate-600">Review and approve organizer registrations</p>
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
                      <div>Email: {org.email}</div>
                      <div>Phone: {org.phone}</div>
                      <div>Institution: {org.institution}</div>
                      <div>Designation: {org.designation}</div>
                      <div className="text-xs font-mono text-slate-500">
                        Temporary ID: {org.temporaryId}
                      </div>
                      {org.finalId && (
                        <div className="text-xs font-mono text-emerald-700">
                          Final ID: {org.finalId}
                        </div>
                      )}
                    </div>
                  </div>
                  {org.status === "pending" && (
                    <div className="ml-4 flex gap-2">
                      <Button
                        size="sm"
                        className="rs-btn-primary gap-2"
                        onClick={() => handleApproveOrganizer(org.temporaryId, "approve")}
                      >
                        <UserCheck className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleApproveOrganizer(org.temporaryId, "reject")}
                      >
                        <UserX className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Participants Section */}
      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">All Participants</h2>
            <p className="text-sm text-slate-600">View all certificate recipients</p>
          </div>
          <Button onClick={loadAllParticipants} variant="outline" size="sm" disabled={loadingAllParticipants}>
            Refresh
          </Button>
        </div>
        {loadingAllParticipants ? (
          <div className="text-center py-8 text-slate-600">Loading participants...</div>
        ) : allParticipants.length === 0 ? (
          <div className="text-sm text-slate-600 text-center py-8">No participants yet</div>
        ) : (
          <div className="rs-table-wrapper">
            <table className="rs-table text-sm">
              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-left">Institution</th>
                  <th className="text-left">Type</th>
                  <th className="text-left">Score</th>
                  <th className="text-left">Activity</th>
                  <th className="text-left">Event</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {allParticipants.map((p: any, idx: number) => (
                  <tr key={idx}>
                    <td className="font-medium">{p.fullName}</td>
                    <td>{p.institution || "-"}</td>
                    <td className="capitalize">{p.type}</td>
                    <td>
                      {p.score}/{p.total}
                    </td>
                    <td className="capitalize">{p.activityType}</td>
                    <td className="text-xs">{p.eventTitle || "-"}</td>
                    <td className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rs-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emerald-900">Appreciation Messages</h2>
        <div className="space-y-4">
          {appreciations.length === 0 ? (
            <div className="text-sm text-slate-600">No appreciations yet.</div>
          ) : (
            appreciations.slice(0, 20).map((a, idx) => (
              <div key={idx} className="rounded-xl border border-emerald-100 bg-white/90 p-4">
                <div className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
                <div className="font-semibold text-emerald-900">{a.fullName}</div>
                <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{a.appreciationText}</div>
              </div>
            ))
          )}
        </div>
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
                  <span className="text-sm text-slate-600">Location:</span>
                  <span className="ml-2 font-medium text-emerald-900">{eventParticipants.event.location}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Date:</span>
                  <span className="ml-2 font-medium text-emerald-900">
                    {new Date(eventParticipants.event.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Total Participants:</span>
                  <span className="ml-2 font-medium text-emerald-900">{eventParticipants.totalParticipants}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Reference ID:</span>
                  <span className="ml-2 font-mono text-xs text-emerald-900">{eventParticipants.event.referenceId}</span>
                </div>
              </div>

              {eventParticipants.participants.length === 0 ? (
                <div className="text-center py-8 text-slate-600">No participants yet for this event</div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-emerald-900">Participants List</h3>
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
