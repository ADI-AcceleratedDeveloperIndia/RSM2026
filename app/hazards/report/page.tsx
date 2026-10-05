"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  AlertTriangle, ArrowLeft, CheckCircle2, 
  MapPin, Camera, AlertCircle, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DISTRICT_NAMES } from "@/lib/districts";

export default function ReportHazardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pothole",
    severity: "medium",
    district: "Hyderabad",
    location: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    reportedBy: "",
    reporterContact: "",
    photoUrl: "",
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          location: prev.location || `Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        setGeoLoading(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        alert("Could not retrieve GPS coordinates. Please type the location manually.");
        setGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/hazards/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: formData.photoUrl ? [formData.photoUrl] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit hazard report");
      }

      setSuccess(data.hazardId);
      setTimeout(() => {
        router.push(`/hazards/${data.hazardId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-12 max-w-2xl">
      <Link href="/hazards" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Hazard Tracker
      </Link>

      <div className="space-y-6">
        <div>
          <span className="rs-chip bg-red-100 text-red-900">Ground Incident Report</span>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Report a Road Safety Hazard</h1>
          <p className="text-slate-600 text-sm mt-1">
            Provide details of the road danger. Your report is directly relayed to district transport authorities and municipal engineers for rectification.
          </p>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">Hazard Report Successfully Registered!</p>
              <p className="text-sm font-mono mt-0.5">Tracking ID: {success}. Redirecting to tracking view...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Hazard Details</CardTitle>
            <CardDescription>Select severity and pinpoint the exact road location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Hazard Headline *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Deep pothole near Begumpet flyover, Broken signal at junction"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Hazard Type *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 h-10"
                    required
                  >
                    <option value="pothole">Pothole / Crater</option>
                    <option value="broken_signal">Broken Traffic Light</option>
                    <option value="missing_sign">Missing / Damaged Sign</option>
                    <option value="poor_visibility">Poor Visibility / Streetlight</option>
                    <option value="dangerous_curve">Dangerous Blind Curve</option>
                    <option value="no_footpath">No Footpath / Pedestrian Risk</option>
                    <option value="no_divider">Missing Median Divider</option>
                    <option value="flooding">Waterlogging / Drainage</option>
                    <option value="encroachment">Footpath Encroachment</option>
                    <option value="other">Other Road Hazard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Risk Severity *</Label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 h-10"
                    required
                  >
                    <option value="critical">Critical (Immediate accident risk)</option>
                    <option value="high">High (Major road obstacle)</option>
                    <option value="medium">Medium (Moderate traffic impediment)</option>
                    <option value="low">Low (Minor maintenance defect)</option>
                  </select>
                </div>
              </div>

              {/* Location & GPS */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="location">Location & Landmark *</Label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    className="text-xs text-red-600 font-semibold hover:text-red-700 flex items-center gap-1"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    {geoLoading ? "Detecting GPS..." : "Auto-Detect My GPS"}
                  </button>
                </div>
                <Input
                  id="location"
                  placeholder="Specific street name, kilometer stone, or near landmark"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="border-slate-300"
                />

                {formData.latitude && (
                  <p className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> GPS Pin: {formData.latitude}, {formData.longitude}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <select
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 h-10"
                    required
                  >
                    {DISTRICT_NAMES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe the exact danger (e.g. 2-feet deep waterfilled pothole right before bus stop, causing 2-wheeler skidding)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Photo Link */}
              <div className="space-y-2">
                <Label htmlFor="photoUrl">Photo / Image Link (Optional)</Label>
                <Input
                  id="photoUrl"
                  placeholder="https://drive.google.com/... or public image URL"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="border-slate-300"
                />
              </div>

              {/* Reporter Info */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-2">
                  <Label htmlFor="reportedBy">Your Name *</Label>
                  <Input
                    id="reportedBy"
                    placeholder="Citizen / Commuter Name"
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    required
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterContact">Mobile / Email (Optional)</Label>
                  <Input
                    id="reporterContact"
                    placeholder="For status updates"
                    value={formData.reporterContact}
                    onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Link href="/hazards">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                  {loading ? "Submitting Report..." : "Submit Hazard Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
