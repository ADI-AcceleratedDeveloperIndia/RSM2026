"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, FileText, Users, Download, Activity, MapPin, Plus, BookOpen, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCertificates: 1247,
    totalAppreciations: 89,
    totalEvents: 15,
    totalQuizPasses: 892,
    totalQuizAttempts: 1156,
    passRate: 77,
    totalSimulationPlays: 245,
    districts: [
      { key: "karimnagar", count: 342 },
      { key: "rajannasircilla", count: 198 },
      { key: "hyderabad", count: 156 },
      { key: "warangal", count: 134 },
      { key: "nizamabad", count: 98 },
    ] as { key: string; count: number }[],
  });
  const [simStats, setSimStats] = useState({
    totalSessions: 245,
    totalCompletions: 189,
    successRate: 77,
    categoryStats: [
      { category: "helmet", total: 98, successful: 87 },
      { category: "triple riding", total: 76, successful: 58 },
      { category: "drunk driving", total: 71, successful: 44 },
    ] as { category: string; total: number; successful: number }[],
    avgTimeSeconds: 45,
  });
  const [loading, setLoading] = useState(true);
  const [appreciations, setAppreciations] = useState<{ fullName: string; appreciationText: string; createdAt: string }[]>([]);
  const [isCreateOrganiserOpen, setIsCreateOrganiserOpen] = useState(false);
  const [organiserForm, setOrganiserForm] = useState({
    name: "",
    organisation: "",
    eventDetails: "",
    place: "",
    date: "",
  });
  const [selectedOrganiser, setSelectedOrganiser] = useState<string | null>(null);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  // Dummy organiser data
  const dummyOrganiser = {
    id: "org-001",
    name: "Sri Ramesh Kumar",
    organisation: "Karimnagar Government High School",
    eventDetails: "Road Safety Awareness Rally & Workshop",
    place: "Karimnagar",
    date: "2026-01-15",
    referenceIds: [
      "RSM-ORG-20260115-A1B2C3D4",
      "RSM-ORG-20260115-E5F6G7H8",
      "RSM-ORG-20260115-I9J0K1L2",
      "RSM-ORG-20260115-M3N4O5P6",
      "RSM-ORG-20260115-Q7R8S9T0",
    ],
  };

  useEffect(() => {
    const defaultStats = {
      totalCertificates: 1247,
      totalAppreciations: 89,
      totalEvents: 15,
      totalQuizPasses: 892,
      totalQuizAttempts: 1156,
      passRate: 77,
      totalSimulationPlays: 245,
      districts: [
        { key: "karimnagar", count: 342 },
        { key: "rajannasircilla", count: 198 },
        { key: "hyderabad", count: 156 },
        { key: "warangal", count: 134 },
        { key: "nizamabad", count: 98 },
      ],
    };

    const defaultSimStats = {
      totalSessions: 245,
      totalCompletions: 189,
      successRate: 77,
      categoryStats: [
        { category: "helmet", total: 98, successful: 87 },
        { category: "triple riding", total: 76, successful: 58 },
        { category: "drunk driving", total: 71, successful: 44 },
      ],
      avgTimeSeconds: 45,
    };

    Promise.all([
      fetch("/api/stats/overview").then((res) => res.json()).catch(() => defaultStats),
      fetch("/api/sim/stats").then((res) => res.json()).catch(() => defaultSimStats),
    ])
      .then(([overviewData, simData]) => {
        // Only update if we got valid data with required properties
        if (overviewData && typeof overviewData === 'object') {
          setStats(prevStats => ({ ...prevStats, ...overviewData }));
        }
        if (simData && simData.categoryStats && Array.isArray(simData.categoryStats)) {
          setSimStats(prevSimStats => ({ ...prevSimStats, ...simData }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  const handleCreateOrganiser = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy submission - just show success message
    alert(`Organiser Created!\n\nName: ${organiserForm.name}\nOrganisation: ${organiserForm.organisation}\nEvent: ${organiserForm.eventDetails}\nPlace: ${organiserForm.place}\nDate: ${organiserForm.date}`);
    setIsCreateOrganiserOpen(false);
    setOrganiserForm({
      name: "",
      organisation: "",
      eventDetails: "",
      place: "",
      date: "",
    });
  };

  const handleCopyRefId = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedRefId(refId);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleDownloadStudyMaterial = async () => {
    try {
      // Try to download the PDF file from the correct path
      const response = await fetch("/assets/Road_Safety_Study_Material.pdf");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Road_Safety_Study_Material.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: Open HTML version in new tab for printing
        window.open("/assets/study-material/road-safety-study-material.html", "_blank");
        alert("PDF file not found. Opening HTML version. You can print it as PDF using your browser's print function.");
      }
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: Open HTML version
      window.open("/assets/study-material/road-safety-study-material.html", "_blank");
      alert("PDF file not available. Opening HTML version. You can print it as PDF using your browser's print function.");
    }
  };

  useEffect(() => {
    fetch("/api/admin/appreciations/list")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setAppreciations(data.items || []))
      .catch(() => setAppreciations([]));
  }, []);

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
            <span className="rs-chip">Transport Department • Admin</span>
            <h1 className="text-3xl font-semibold text-emerald-900 mt-2">Admin Dashboard</h1>
            <p className="text-slate-600 max-w-2xl">
              Monitor certificate issuance, quiz performance, simulation insights, and appreciation submissions across
              Telangana.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isCreateOrganiserOpen} onOpenChange={setIsCreateOrganiserOpen}>
              <DialogTrigger asChild>
                <Button className="rs-btn-primary gap-2">
                  <Plus className="h-4 w-4" /> Create Organiser
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Event Organiser</DialogTitle>
                  <DialogDescription>
                    Add a new organiser with event details for road safety campaigns.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOrganiser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organiser Name</Label>
                    <Input
                      id="name"
                      value={organiserForm.name}
                      onChange={(e) => setOrganiserForm({ ...organiserForm, name: e.target.value })}
                      placeholder="Enter organiser name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisation">Organisation</Label>
                    <Input
                      id="organisation"
                      value={organiserForm.organisation}
                      onChange={(e) => setOrganiserForm({ ...organiserForm, organisation: e.target.value })}
                      placeholder="e.g., School, College, NGO"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDetails">Event Details</Label>
                    <Textarea
                      id="eventDetails"
                      value={organiserForm.eventDetails}
                      onChange={(e) => setOrganiserForm({ ...organiserForm, eventDetails: e.target.value })}
                      placeholder="Describe the event (e.g., Road Safety Rally, First Aid Training)"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="place">Place/District</Label>
                    <Input
                      id="place"
                      value={organiserForm.place}
                      onChange={(e) => setOrganiserForm({ ...organiserForm, place: e.target.value })}
                      placeholder="e.g., Karimnagar, Hyderabad"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={organiserForm.date}
                      onChange={(e) => setOrganiserForm({ ...organiserForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOrganiserOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 rs-btn-primary">
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <p className="text-sm text-emerald-700">{loading ? "Syncing..." : "Data refreshed"}</p>
          </div>
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
          <p className="text-4xl font-semibold text-emerald-900">{(stats.passRate * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-2">Passes vs attempts</p>
        </div>
        <div className="rs-card p-6">
          <p className="text-sm text-slate-600">Total simulation plays</p>
          <p className="text-4xl font-semibold text-emerald-900">{stats.totalSimulationPlays}</p>
          <p className="text-xs text-slate-500 mt-2">Includes all interactive scenarios</p>
        </div>
      </div>

      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">District-wise Participation</h2>
            <p className="text-sm text-slate-600">Certificates issued by district</p>
          </div>
        </div>
        <div className="rs-table-wrapper">
          <table className="rs-table text-sm min-w-[420px]">
            <thead>
              <tr>
                <th className="text-left">District</th>
                <th className="text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {stats.districts?.map((d) => (
                <tr key={d.key}>
                  <td>{d.key || "Unknown"}</td>
                  <td>{d.count}</td>
                </tr>
              ))}
              {(!stats.districts || stats.districts.length === 0) && (
                <tr>
                  <td colSpan={2}>No data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 sm:hidden">Swipe sideways to check every district entry.</p>
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

      <div className="rs-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Event Organisers</h2>
            <p className="text-sm text-slate-600">Manage organisers and their reference IDs</p>
          </div>
        </div>
        <div className="space-y-3">
          <div
            className="rounded-xl border border-emerald-100 bg-white/90 p-4 hover:border-emerald-300 cursor-pointer transition-colors"
            onClick={() => setSelectedOrganiser(dummyOrganiser.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-emerald-900 text-lg">{dummyOrganiser.name}</div>
                <div className="text-sm text-slate-600 mt-1">{dummyOrganiser.organisation}</div>
                <div className="text-xs text-slate-500 mt-2">
                  <span className="inline-block mr-4">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {dummyOrganiser.place}
                  </span>
                  <span className="inline-block">
                    <Activity className="h-3 w-3 inline mr-1" />
                    {new Date(dummyOrganiser.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-emerald-700 mt-2 font-medium">
                  {dummyOrganiser.referenceIds.length} Reference IDs
                </div>
              </div>
              <div className="ml-4">
                <Button variant="outline" size="sm" className="gap-2">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rs-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emerald-900">Appreciation Messages</h2>
        <div className="space-y-4">
          {appreciations.slice(0, 20).map((a, idx) => (
            <div key={idx} className="rounded-xl border border-emerald-100 bg-white/90 p-4">
              <div className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
              <div className="font-semibold text-emerald-900">{a.fullName}</div>
              <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{a.appreciationText}</div>
            </div>
          ))}
          {appreciations.length === 0 && <div className="text-sm text-slate-600">No appreciations yet.</div>}
        </div>
      </div>

      {/* Organiser Details Dialog */}
      <Dialog open={selectedOrganiser === dummyOrganiser.id} onOpenChange={(open) => !open && setSelectedOrganiser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Organiser Details</DialogTitle>
            <DialogDescription>
              View reference IDs and download study material for this organiser
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-900">Organiser Information</h3>
              <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-slate-600">Name:</span>
                  <span className="ml-2 font-medium text-emerald-900">{dummyOrganiser.name}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Organisation:</span>
                  <span className="ml-2 font-medium text-emerald-900">{dummyOrganiser.organisation}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Event:</span>
                  <span className="ml-2 font-medium text-emerald-900">{dummyOrganiser.eventDetails}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Location:</span>
                  <span className="ml-2 font-medium text-emerald-900">{dummyOrganiser.place}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Date:</span>
                  <span className="ml-2 font-medium text-emerald-900">
                    {new Date(dummyOrganiser.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-emerald-900">Reference IDs</h3>
                <span className="text-xs text-slate-500">{dummyOrganiser.referenceIds.length} IDs</span>
              </div>
              <div className="space-y-2">
                {dummyOrganiser.referenceIds.map((refId, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200"
                  >
                    <code className="text-sm font-mono text-emerald-900 flex-1">{refId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyRefId(refId)}
                      className="ml-2 h-8 w-8 p-0"
                    >
                      {copiedRefId === refId ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-600" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-emerald-100">
              <h3 className="font-semibold text-emerald-900">Study Material</h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Road Safety Study Material</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Comprehensive guide covering road safety rules, regulations, and best practices for organisers.
                    </p>
                    <Button
                      onClick={handleDownloadStudyMaterial}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



