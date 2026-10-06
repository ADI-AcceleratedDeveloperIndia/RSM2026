"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Shield, Users, UserPlus, Sliders, Database, CheckCircle2,
  AlertTriangle, RefreshCw, Lock, Mail, MapPin, Building,
  Key, Save, Cpu, Sparkles, Check, FileSpreadsheet, UploadCloud,
  Download, Trash2, Plus, Search, FileUp, Share2, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATE_DISTRICTS } from "@/lib/districts";

interface Officer {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  state: string;
  district?: string;
  permissions?: string[];
}

interface DistrictRecord {
  code: string;
  name: string;
  state: string;
  totalParticipants?: number;
  totalEvents?: number;
  totalActions?: number;
  totalHazards?: number;
}

export default function GovSettingsPage() {
  const [activeTab, setActiveTab] = useState<"jurisdiction" | "officers" | "campaign" | "diagnostics">("jurisdiction");
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeSuccess, setRecomputeSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State Jurisdiction settings
  const [stateName, setStateName] = useState("State Government");
  const [stateCode, setStateCode] = useState("SG");
  const [districtsList, setDistrictsList] = useState<DistrictRecord[]>([]);
  const [districtSearch, setDistrictSearch] = useState("");
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictCode, setNewDistrictCode] = useState("");
  const [savingState, setSavingState] = useState(false);
  const [addingDistrict, setAddingDistrict] = useState(false);
  const [stateSuccessMsg, setStateSuccessMsg] = useState("");

  // Excel bulk upload state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<Array<{ name: string; code: string; state?: string }>>([]);
  const [detectedState, setDetectedState] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importingExcel, setImportingExcel] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState("");

  // Officer form state
  const [newOfficer, setNewOfficer] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "district_admin",
    district: "Adilabad",
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

  // Social Media Sharing & Hashtags state
  const [socialHashtagsInput, setSocialHashtagsInput] = useState(
    "#RoadSafetyMonth2027 #SadakSurakshaJeevanRaksha #StateTransport #SafeRoadsSaveLives #ZeroAccidents2027"
  );
  const [socialShareMessageInput, setSocialShareMessageInput] = useState(
    "I am proud to receive the official Road Safety Certificate from the Government Transport Department! Let us commit to responsible road behaviour and zero accidents."
  );
  const [savingSocial, setSavingSocial] = useState(false);

  useEffect(() => {
    fetchOfficers();
    fetchSetupDistricts();
    fetchSocialConfig();
  }, []);

  const fetchSocialConfig = async () => {
    try {
      const res = await fetch("/api/config/social");
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.socialHashtags) && data.socialHashtags.length > 0) {
          setSocialHashtagsInput(data.socialHashtags.join(" "));
        }
        if (data.socialShareMessage) {
          setSocialShareMessageInput(data.socialShareMessage);
        }
      }
    } catch (err) {
      console.error("Error loading social config:", err);
    }
  };

  const fetchSetupDistricts = async () => {
    try {
      const res = await fetch("/api/gov/setup/districts");
      const data = await res.json();
      if (data.success) {
        if (data.stateName) setStateName(data.stateName);
        if (data.stateCode) setStateCode(data.stateCode);
        if (data.districts) setDistrictsList(data.districts);
      }
    } catch (err) {
      console.error("Error loading setup districts:", err);
    }
  };

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

  const handleSaveState = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingState(true);
    try {
      const res = await fetch("/api/gov/setup/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateName, stateCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setStateSuccessMsg("State profile saved successfully!");
        setTimeout(() => setStateSuccessMsg(""), 3500);
        fetchSetupDistricts();
      } else {
        alert(data.error || "Failed to update state");
      }
    } catch (err) {
      alert("Network error updating state profile");
    } finally {
      setSavingState(false);
    }
  };

  const handleAddSingleDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName.trim()) {
      alert("District name is required.");
      return;
    }
    setAddingDistrict(true);
    try {
      const res = await fetch("/api/gov/setup/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateName,
          stateCode,
          districts: [{ name: newDistrictName.trim(), code: newDistrictCode.trim() }],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewDistrictName("");
        setNewDistrictCode("");
        fetchSetupDistricts();
      } else {
        alert(data.error || "Failed to add district");
      }
    } catch (err) {
      alert("Network error adding district");
    } finally {
      setAddingDistrict(false);
    }
  };

  const handleDeleteDistrict = async (code: string, name: string) => {
    if (!confirm(`Are you sure you want to remove district '${name}' (${code})?`)) return;
    try {
      const res = await fetch(`/api/gov/setup/districts?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        fetchSetupDistricts();
      } else {
        alert(data.error || "Failed to delete district");
      }
    } catch (err) {
      alert("Network error deleting district");
    }
  };

  const handleDownloadSampleExcel = () => {
    const wsData = [
      ["State Name", "District Name", "District Code"],
      [stateName || "State Government", "Adilabad", "ADLB"],
      [stateName || "State Government", "Bhadradri Kothagudem", "BHDK"],
      [stateName || "State Government", "Hyderabad", "HYDR"],
      [stateName || "State Government", "Jagtial", "JAGT"],
      [stateName || "State Government", "Karimnagar", "KRMR"],
      [stateName || "State Government", "Khammam", "KHMM"],
      [stateName || "State Government", "Medchal-Malkajgiri", "MDML"],
      [stateName || "State Government", "Nizamabad", "NZBD"],
      [stateName || "State Government", "Warangal", "WRGL"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Districts");
    XLSX.writeFile(wb, "RSM2027_Districts_Template.xlsx");
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (jsonData.length === 0) {
          alert("The uploaded Excel sheet contains no rows.");
          return;
        }

        let detectedStateVal = "";
        const parsed: Array<{ name: string; code: string; state?: string }> = [];

        jsonData.forEach((row: any) => {
          const sName =
            row["State Name"] || row["State"] || row["STATE"] || row["state"] || "";
          if (sName && !detectedStateVal) {
            detectedStateVal = String(sName).trim();
          }

          const dName =
            row["District Name"] ||
            row["District"] ||
            row["DISTRICT"] ||
            row["Name"] ||
            row["name"] ||
            "";

          const dCode =
            row["District Code"] ||
            row["Code"] ||
            row["CODE"] ||
            row["DistrictCode"] ||
            "";

          if (dName && String(dName).trim()) {
            parsed.push({
              name: String(dName).trim(),
              code: String(dCode).trim(),
              state: sName ? String(sName).trim() : undefined,
            });
          }
        });

        if (detectedStateVal) {
          setDetectedState(detectedStateVal);
        }
        setExcelPreview(parsed);
      } catch (error) {
        console.error("Excel parse error:", error);
        alert("Failed to parse spreadsheet. Please ensure it is a valid .xlsx, .xls, or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportExcelDistricts = async () => {
    if (excelPreview.length === 0) {
      alert("No districts to import. Please select an Excel file first.");
      return;
    }
    setImportingExcel(true);
    try {
      const finalStateName = (detectedState || stateName).trim();
      const res = await fetch("/api/gov/setup/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateName: finalStateName,
          stateCode: stateCode,
          districts: excelPreview,
          mode: importMode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportSuccessMsg(
          `Successfully deployed ${data.districtsCount} districts for ${data.stateName}!`
        );
        setExcelFile(null);
        setExcelPreview([]);
        fetchSetupDistricts();
        setTimeout(() => setImportSuccessMsg(""), 5000);
      } else {
        alert(data.error || "Failed to import districts");
      }
    } catch (err) {
      alert("Network error importing districts");
    } finally {
      setImportingExcel(false);
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
          district: districtsList[0]?.name || "Adilabad",
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

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      const res = await fetch("/api/config/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialHashtags: socialHashtagsInput,
          socialShareMessage: socialShareMessageInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        alert(data.error || "Failed to save campaign settings");
      }
    } catch (err) {
      console.error(err);
      alert("Network error saving campaign parameters");
    } finally {
      setSavingSocial(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Super Administrator</Badge>;
      case "state_admin":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">State Commissioner</Badge>;
      case "district_admin":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">District Road Transport Authority Head</Badge>;
      case "verifier":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Field Verifier</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">Admin</Badge>;
    }
  };

  const filteredDistricts = districtsList.filter(
    (d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform Administration & Setup
            </h1>
            <Badge className="bg-indigo-600 text-white">Superadmin Control</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure State jurisdiction, bulk import districts via Excel, provision RTA heads, and configure campaign policies.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab("jurisdiction")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === "jurisdiction"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin size={15} />
            <span>State & Districts (Excel)</span>
          </button>
          <button
            onClick={() => setActiveTab("officers")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === "officers"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={15} />
            <span>Officers & RBAC</span>
          </button>
          <button
            onClick={() => setActiveTab("campaign")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === "campaign"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders size={15} />
            <span>Campaign Parameters</span>
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === "diagnostics"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Database size={15} />
            <span>Diagnostics & Engine</span>
          </button>
        </div>
      </div>

      {/* TAB 0: JURISDICTION & EXCEL BULK IMPORT */}
      {activeTab === "jurisdiction" && (
        <div className="space-y-6">
          {stateSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{stateSuccessMsg}</span>
            </div>
          )}

          {importSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {/* Top row: State Configuration & Add Single District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: State Profile */}
            <Card className="border-indigo-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  <Building size={18} className="text-indigo-600" />
                  State Jurisdiction Setting
                </CardTitle>
                <CardDescription className="text-xs">
                  Define the administering State Government name and short code displayed on official certificates and dossiers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveState} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="stateNameInput" className="text-xs font-semibold text-slate-700">
                      State / Territorial Name *
                    </Label>
                    <Input
                      id="stateNameInput"
                      placeholder="e.g. State Government, Telangana, Karnataka, etc."
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      Default is generalized to "State Government" for multi-state readiness.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stateCodeInput" className="text-xs font-semibold text-slate-700">
                      State Code (2-4 uppercase letters) *
                    </Label>
                    <Input
                      id="stateCodeInput"
                      placeholder="e.g. SG, TG, KA, MH"
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                      maxLength={4}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={savingState}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 gap-1.5"
                  >
                    <Save size={14} />
                    <span>{savingState ? "Saving..." : "Save State Configuration"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Card 2: Add Single District */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  <Plus size={18} className="text-emerald-600" />
                  Add Single District
                </CardTitle>
                <CardDescription className="text-xs">
                  Quickly append an individual administrative district to the active platform registry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSingleDistrict} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newDistName" className="text-xs font-semibold text-slate-700">
                      District Name *
                    </Label>
                    <Input
                      id="newDistName"
                      placeholder="e.g. Hyderabad, Warangal, Rangareddy"
                      value={newDistrictName}
                      onChange={(e) => setNewDistrictName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newDistCode" className="text-xs font-semibold text-slate-700">
                      District Code (4 letters, auto-generated if blank)
                    </Label>
                    <Input
                      id="newDistCode"
                      placeholder="e.g. HYDR, WRGL (optional)"
                      value={newDistrictCode}
                      onChange={(e) => setNewDistrictCode(e.target.value.toUpperCase())}
                      maxLength={4}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addingDistrict}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
                  >
                    <Plus size={14} />
                    <span>{addingDistrict ? "Adding..." : "Add District to Jurisdiction"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Card 3: EXCEL / CSV BATCH IMPORT */}
          <Card className="border-emerald-200 bg-emerald-50/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base text-emerald-950 flex items-center gap-2">
                    <FileSpreadsheet size={20} className="text-emerald-600" />
                    Excel Spreadsheet Bulk Import
                  </CardTitle>
                  <CardDescription className="text-xs text-emerald-800">
                    Upload an Excel (`.xlsx`, `.xls`) or CSV file containing State Name and District Names to setup any state in seconds.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSampleExcel}
                  className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 gap-1.5 h-8 shrink-0"
                >
                  <Download size={14} />
                  <span>Download Sample Template</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File picker */}
                <div className="space-y-2">
                  <Label htmlFor="excelFileInput" className="text-xs font-semibold text-slate-700">
                    Select Excel / CSV File (.xlsx, .xls, .csv)
                  </Label>
                  <Input
                    id="excelFileInput"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleExcelFileChange}
                    className="bg-white border-slate-300 h-10 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  <p className="text-[11px] text-slate-500">
                    Expected columns: <strong>State Name</strong>, <strong>District Name</strong>, and optional <strong>District Code</strong>.
                  </p>
                </div>

                {/* Import options */}
                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                  <Label className="text-xs font-semibold text-slate-700">Import Mode</Label>
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="merge"
                        checked={importMode === "merge"}
                        onChange={() => setImportMode("merge")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span><strong>Merge / Append:</strong> Add new districts and update matching ones</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span><strong>Replace All:</strong> Wipe existing list and replace with uploaded spreadsheet</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Excel Preview */}
              {excelPreview.length > 0 && (
                <div className="mt-4 space-y-3 bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span>Detected {excelPreview.length} Districts from File</span>
                        {detectedState && (
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            State: {detectedState}
                          </Badge>
                        )}
                      </h4>
                    </div>
                    <Button
                      type="button"
                      onClick={handleImportExcelDistricts}
                      disabled={importingExcel}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 font-semibold shadow-sm"
                    >
                      <UploadCloud size={14} />
                      <span>{importingExcel ? "Deploying..." : "Deploy & Save Districts to System"}</span>
                    </Button>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">District Name</th>
                          <th className="py-2 px-3">District Code</th>
                          <th className="py-2 px-3">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelPreview.map((d, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-medium text-slate-900">{d.name}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">
                              {d.code || (d.name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X"))}
                            </td>
                            <td className="py-1.5 px-3 text-slate-500">{d.state || detectedState || stateName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: ACTIVE JURISDICTION DISTRICTS TABLE */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-slate-900">
                      Active Districts in {stateName}
                    </CardTitle>
                    <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-mono text-xs">
                      {districtsList.length} Total
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Live operational districts mapped to MongoDB. All metrics are aggregated 100% in real time.
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <Input
                    placeholder="Search active districts..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {districtsList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No districts configured yet. Use the Excel upload or manual form above to configure districts.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">District Name</th>
                        <th className="py-2.5 px-3">State Jurisdiction</th>
                        <th className="py-2.5 px-3 text-center">Participants</th>
                        <th className="py-2.5 px-3 text-center">Events</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                        <th className="py-2.5 px-3 text-center">Hazards</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDistricts.map((d) => (
                        <tr key={d.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-indigo-700">{d.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{d.name}</td>
                          <td className="py-2 px-3 text-slate-500">{d.state || stateName}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700">{d.totalParticipants || 0}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700">{d.totalEvents || 0}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700">{d.totalActions || 0}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700">{d.totalHazards || 0}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteDistrict(d.code, d.name)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                              title="Delete district"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 text-xs"
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
                      placeholder="e.g. Sri Rajesh Kumar, District RTA Head"
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
                      <option value="district_admin">District Road Transport Authority Head</option>
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
                      {districtsList.map((d) => (
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
                      <span>{officer.district || officer.state || stateName}</span>
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

              {/* Card: Social Media Hashtags & Viral Sharing Parameters */}
              <div className="border-t border-slate-200 pt-5 mt-5">
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <Share2 size={18} className="text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Official Social Media Hashtags & Citizen Sharing Configuration
                    </h3>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px]">
                      Viral Campaign
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define the statutory campaign hashtags and default captions automatically pre-filled when citizens, students, and organizations share their official certificates to Instagram (Post & Story), WhatsApp (Status & Chat), LinkedIn, X (Twitter), and Facebook.
                  </p>
                </div>

                <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Hash size={14} className="text-indigo-600" />
                      Official Campaign Hashtags (Space or Comma Separated) *
                    </Label>
                    <Input
                      value={socialHashtagsInput}
                      onChange={(e) => setSocialHashtagsInput(e.target.value)}
                      placeholder="#RoadSafetyMonth2027 #SadakSurakshaJeevanRaksha #StateTransport #SafeRoadsSaveLives #ZeroAccidents2027"
                      className="bg-white font-mono text-xs"
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      Enforced on all certificate share links for unified state-wide tracking.
                    </p>
                    {/* Live Hashtag Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {socialHashtagsInput
                        .split(/[\s,]+/)
                        .filter((t) => t.trim().length > 0)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-mono"
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Default Social Post Caption / Citation Text *
                    </Label>
                    <textarea
                      value={socialShareMessageInput}
                      onChange={(e) => setSocialShareMessageInput(e.target.value)}
                      rows={3}
                      className="w-full text-xs rounded-md border border-slate-200 bg-white p-2.5 focus:border-indigo-500 focus:outline-none leading-relaxed"
                      placeholder="I am proud to receive the official Road Safety Certificate from the Government Transport Department! Let us commit to responsible road behaviour and zero accidents."
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      Prefilled when participants click WhatsApp, Instagram, LinkedIn, Facebook, or X buttons.
                    </p>
                  </div>

                  {/* Social Media Live Preview */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Live Citizen Post Preview (How it appears on Social Media)
                    </span>
                    <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-800 space-y-1.5">
                      <p className="leading-relaxed whitespace-pre-wrap">{socialShareMessageInput}</p>
                      <p className="font-semibold text-indigo-600 font-mono text-[11px]">
                        {socialHashtagsInput
                          .split(/[\s,]+/)
                          .filter((t) => t.trim().length > 0)
                          .map((t) => (t.startsWith("#") ? t : `#${t}`))
                          .join(" ")}
                      </p>
                      <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">
                        🔗 https://rsm2027.gov.in/certificates/preview?certId=KRMR-RSM-2027-RTA-DTO-PAR-00001
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={savingSocial}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>
                    {savingSocial
                      ? "Saving Directives & Hashtags..."
                      : saveSuccess
                      ? "Directives & Hashtags Saved Successfully!"
                      : "Save Campaign & Social Directives"}
                  </span>
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
                  <h4 className="font-semibold text-sm text-slate-900">Recalculate All District Scorecards</h4>
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
                  All active administrative districts for <strong>{stateName}</strong>.
                </p>
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 bg-white rounded border border-slate-200">
                  {districtsList.map((d) => (
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
