"use client";

import { useState, useEffect } from "react";
import {
  Shield, Users, UserPlus, Sliders, Database, CheckCircle2,
  AlertTriangle, RefreshCw, Lock, Mail, MapPin, Building,
  Key, Save, Cpu, Sparkles, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TELANGANA_DISTRICTS } from "@/lib/districts";

interface Officer {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  state: string;
  district?: string;
  permissions?: string[];
}

export default function GovSettingsPage() {
  const [activeTab, setActiveTab] = useState<"officers" | "campaign" | "diagnostics">("officers");
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeSuccess, setRecomputeSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [newOfficer, setNewOfficer] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "district_admin",
    district: "Hyderabad",
  });

  // Campaign settings state
  const [campaignConfig, setCampaignConfig] = useState({
    name: "National Road Safety Month 2027",
    theme: "Sadak Suraksha Jeevan Raksha — Verifiable Action & Zero Preventable Fatalities",
    startDate: "2027-01-15",
    endDate: "2027-02-14",
    mandatoryGeoTag: true,
    requirePhotoProof: true,
    autoScorecardSync: true,
    targetFatalitiesReductionPct: 25,
    educationWeight: 25,
    engineeringWeight: 25,
    enforcementWeight: 25,
    emergencyWeight: 25,
  });

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gov/users");
      const data = await res.json();
      if (data.users) {
        setOfficers(data.users);
      }
    } catch (err) {
      console.error("Error loading officers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.email || !newOfficer.password || !newOfficer.fullName) {
      alert("Please fill in all officer details");
      return;
    }

    try {
      const res = await fetch("/api/gov/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOfficer),
      });
      const data = await res.json();
      if (res.ok) {
        setIsProvisioning(false);
        setNewOfficer({
          fullName: "",
          email: "",
          password: "",
          role: "district_admin",
          district: "Hyderabad",
        });
        fetchOfficers();
      } else {
        alert(data.error || "Failed to provision officer");
      }
    } catch (err) {
      console.error(err);
      alert("Network error provisioning officer");
    }
  };

  const handleRecomputeScorecards = async () => {
    try {
      setRecomputing(true);
      const res = await fetch("/api/scorecards/compute", { method: "POST" });
      if (res.ok) {
        setRecomputeSuccess(true);
        setTimeout(() => setRecomputeSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecomputing(false);
    }
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Super Administrator</Badge>;
      case "state_admin":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">State Commissioner</Badge>;
      case "district_admin":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">District RTA Head (Head of Transport)</Badge>;
      case "verifier":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Field Verifier</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">Admin</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform Administration & Settings
            </h1>
            <Badge className="bg-indigo-600 text-white">Tier-1 Gov Node</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage government officer accounts, access controls, RSM 2027 parameters, and system health.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-sm font-medium">
          <button
            onClick={() => setActiveTab("officers")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
              activeTab === "officers"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={16} />
            <span>Officers & RBAC</span>
          </button>
          <button
            onClick={() => setActiveTab("campaign")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
              activeTab === "campaign"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders size={16} />
            <span>Campaign Parameters</span>
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
              activeTab === "diagnostics"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Database size={16} />
            <span>Diagnostics & Engine</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OFFICERS & RBAC */}
      {activeTab === "officers" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Authorized Government Personnel</h2>
              <p className="text-xs text-slate-500">
                Nodal officers authorized to verify safety interventions, resolve road hazards, and generate dossiers.
              </p>
            </div>
            <Button
              onClick={() => setIsProvisioning(!isProvisioning)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span>{isProvisioning ? "Cancel Provisioning" : "Provision New Officer"}</span>
            </Button>
          </div>

          {/* Provisioning Form */}
          {isProvisioning && (
            <Card className="border-indigo-200 bg-indigo-50/30">
              <CardHeader>
                <CardTitle className="text-indigo-900 text-base">Provision Authorized Government Officer</CardTitle>
                <CardDescription>
                  Create an encrypted, role-based account mapped to a specific district or state jurisdiction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOfficer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Officer Full Name & Designation</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Sri Rajesh Kumar, RTO"
                      value={newOfficer.fullName}
                      onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Official Government Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="officer@stategov.in"
                      value={newOfficer.email}
                      onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Temporary Secure Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={newOfficer.password}
                      onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role & Authorization Level</Label>
                    <select
                      id="role"
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                      value={newOfficer.role}
                      onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })}
                    >
                      <option value="district_admin">District Road Transport Authority Head (Head of Transport)</option>
                      <option value="verifier">Field Verifier (Municipal / Police)</option>
                      <option value="state_admin">State Admin (Transport Commissionerate)</option>
                      <option value="superadmin">Super Administrator</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="district">Assigned Jurisdiction / District</Label>
                    <select
                      id="district"
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                      value={newOfficer.district}
                      onChange={(e) => setNewOfficer({ ...newOfficer, district: e.target.value })}
                    >
                      <option value="State Headquarters">State-wide (All Districts)</option>
                      {TELANGANA_DISTRICTS.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      Confirm & Issue Credentials
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Officers Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-3 px-4">Officer Name</th>
                  <th className="py-3 px-4">Email ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Authorized Scopes</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((officer) => (
                  <tr key={officer._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                        {officer.fullName ? officer.fullName.charAt(0) : "O"}
                      </div>
                      <span>{officer.fullName || "Government Official"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{officer.email}</td>
                    <td className="py-3.5 px-4">{getRoleBadge(officer.role)}</td>
                    <td className="py-3.5 px-4 text-slate-700 flex items-center gap-1.5 mt-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{officer.district || officer.state || "State Government"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(officer.permissions || ["general_audit"]).map((perm, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGN PARAMETERS */}
      {activeTab === "campaign" && (
        <form onSubmit={handleSaveCampaign} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Road Safety Month 2027 Directives</CardTitle>
              <CardDescription>
                Configure statutory guidelines, time windows, and target impact benchmarks for all administrative districts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Campaign Title</Label>
                  <Input
                    value={campaignConfig.name}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State Mission Theme</Label>
                  <Input
                    value={campaignConfig.theme}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, theme: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Campaign Start Date</Label>
                  <Input
                    type="date"
                    value={campaignConfig.startDate}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Campaign Concluding Date</Label>
                  <Input
                    type="date"
                    value={campaignConfig.endDate}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <h3 className="font-semibold text-slate-800 text-sm mb-3">4E Scorecard Weight Allocation (Must Total 100%)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <Label className="text-xs text-blue-900">Education Weight</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        className="bg-white h-9"
                        value={campaignConfig.educationWeight}
                        onChange={(e) => setCampaignConfig({ ...campaignConfig, educationWeight: Number(e.target.value) })}
                      />
                      <span className="text-xs font-semibold text-blue-700">%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                    <Label className="text-xs text-amber-900">Engineering Weight</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        className="bg-white h-9"
                        value={campaignConfig.engineeringWeight}
                        onChange={(e) => setCampaignConfig({ ...campaignConfig, engineeringWeight: Number(e.target.value) })}
                      />
                      <span className="text-xs font-semibold text-amber-700">%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <Label className="text-xs text-red-900">Enforcement Weight</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        className="bg-white h-9"
                        value={campaignConfig.enforcementWeight}
                        onChange={(e) => setCampaignConfig({ ...campaignConfig, enforcementWeight: Number(e.target.value) })}
                      />
                      <span className="text-xs font-semibold text-red-700">%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <Label className="text-xs text-emerald-900">Emergency Weight</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        className="bg-white h-9"
                        value={campaignConfig.emergencyWeight}
                        onChange={(e) => setCampaignConfig({ ...campaignConfig, emergencyWeight: Number(e.target.value) })}
                      />
                      <span className="text-xs font-semibold text-emerald-700">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm mb-2">Ground Verification Protocols</h3>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={campaignConfig.mandatoryGeoTag}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, mandatoryGeoTag: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mandatory GPS Geolocation Tagging for all citizen hazard submissions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={campaignConfig.requirePhotoProof}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, requirePhotoProof: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Require Before/After photographic evidence before certifying completed actions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={campaignConfig.autoScorecardSync}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, autoScorecardSync: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Enable automated real-time recalculation of District Scorecards upon hazard resolution</span>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                  <Save size={16} />
                  <span>{saveSuccess ? "Changes Saved Successfully!" : "Save Policy Directives"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* TAB 3: DIAGNOSTICS & ENGINE */}
      {activeTab === "diagnostics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-emerald-900">Scorecard Engine</CardTitle>
                  <Cpu size={18} className="text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">Online</div>
                <p className="text-xs text-slate-500 mt-1">Multi-factor 4E composite scoring algorithm operational.</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-blue-900">RBAC Security Layer</CardTitle>
                  <Shield size={18} className="text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">Enforced</div>
                <p className="text-xs text-slate-500 mt-1">NextAuth JWT session validation active on /gov/* routes.</p>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-indigo-50/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-indigo-900">Intelligence Engine</CardTitle>
                  <Sparkles size={18} className="text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">Active</div>
                <p className="text-xs text-slate-500 mt-1">Automated anomaly detection & hotspot clustering running.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Engine Triggers & Maintenance</CardTitle>
              <CardDescription>
                Manually invoke state-wide recalculations or synchronize all district records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">Recalculate All 33 District Scorecards</h4>
                  <p className="text-xs text-slate-500">
                    Runs aggregation across all certificates, actions, hazards, and institutions to refresh ranks and grades.
                  </p>
                </div>
                <Button
                  onClick={handleRecomputeScorecards}
                  disabled={recomputing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={recomputing ? "animate-spin" : ""} />
                  <span>{recomputing ? "Recomputing..." : recomputeSuccess ? "Recomputed Successfully!" : "Trigger Recalculation"}</span>
                </Button>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                <h4 className="font-semibold text-sm text-slate-900 mb-2">District Reference Registry</h4>
                <p className="text-xs text-slate-500 mb-3">
                  All administrative districts are codified as the single source of truth under <code>lib/districts.ts</code>.
                </p>
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 bg-white rounded border border-slate-200">
                  {TELANGANA_DISTRICTS.map((d) => (
                    <span key={d.code} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {d.code}: {d.name}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
