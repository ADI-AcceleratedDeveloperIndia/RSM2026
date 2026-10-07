"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { 
  CalendarCheck, ArrowLeft, PlusCircle, CheckCircle2, 
  MapPin, Calendar, Building, Copy, Check, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISTRICT_NAMES } from "@/lib/districts";

export default function CreateEventPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    organizerId: "",
    date: new Date().toISOString().slice(0, 10),
    location: "",
    institution: "",
    eventType: "regional" as "statewide" | "regional",
    eventContext: "offline" as "online" | "offline",
    district: "Karimnagar",
  });

  useEffect(() => {
    // Pre-fill from active organizer session if available
    try {
      const stored = localStorage.getItem("rsm_organizer");
      if (stored) {
        const org = JSON.parse(stored);
        setFormData((prev) => ({
          ...prev,
          organizerId: org.finalId || org.temporaryId || prev.organizerId,
          institution: org.institution || prev.institution,
          district: org.district || prev.district,
          location: org.district || prev.location,
        }));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      setSuccess(true);
      setCreatedEventId(data.referenceId);
    } catch (err: any) {
      console.error("Create event error:", err);
      setErrorMsg(err.message || "Failed to create event. Please verify organizer details.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rs-container py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/organizer/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Organizer Dashboard</span>
        </Link>
        <Link 
          href="/events" 
          className="text-xs text-emerald-700 hover:underline font-medium"
        >
          View Public Events
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <span className="rs-chip bg-emerald-100 text-emerald-800">Ground Action</span>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Register Road Safety Event
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Conduct a student rally, awareness lecture, helmet enforcement drive, or safety pledge campaign.
          </p>
        </div>

        {success && createdEventId && (
          <Card className="border-emerald-300 bg-emerald-50/70 shadow-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-emerald-950 text-base">
                    Event Registered Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Use this official Event Reference ID to tag participant certificates and upload group photographs.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                <code className="font-mono text-sm font-bold text-emerald-900 select-all">
                  {createdEventId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdEventId)}
                  className="h-8 text-xs border-emerald-300 text-emerald-800"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy ID
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link href={`/events/${createdEventId}`} className="flex-1">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1">
                    <span>View Event & Participant Roster</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/organizer/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full text-xs border-slate-300">
                    Organizer Hub
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
            {errorMsg}
          </div>
        )}

        {!success && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-slate-900">Event Details</CardTitle>
              <CardDescription className="text-xs">
                Fill in the details for your institutional or regional road safety drive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g. Campus Helmet Safety Drive & Pledge Campaign"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-slate-300 h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="organizerId" className="text-xs font-semibold text-slate-700">
                    Organizer ID (Final or Temporary) *
                  </Label>
                  <Input
                    id="organizerId"
                    required
                    placeholder="e.g. KRMR-RSM-2027-RTA-DTO-ORGANIZER-00001 or TEMP-ORG-..."
                    value={formData.organizerId}
                    onChange={(e) => setFormData({ ...formData, organizerId: e.target.value })}
                    className="border-slate-300 h-10 text-sm font-mono"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="institution" className="text-xs font-semibold text-slate-700">
                      Host Institution / Organization
                    </Label>
                    <Input
                      id="institution"
                      placeholder="e.g. Delhi Public School / CBIT Hyderabad"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="border-slate-300 h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-semibold text-slate-700">
                      Event Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="border-slate-300 h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="eventType" className="text-xs font-semibold text-slate-700">
                      Scope
                    </Label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                      className="w-full h-10 border border-slate-300 rounded-md text-xs px-2 bg-white text-slate-800"
                    >
                      <option value="regional">Regional District</option>
                      <option value="statewide">Statewide</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="eventContext" className="text-xs font-semibold text-slate-700">
                      Mode
                    </Label>
                    <select
                      id="eventContext"
                      value={formData.eventContext}
                      onChange={(e) => setFormData({ ...formData, eventContext: e.target.value as any })}
                      className="w-full h-10 border border-slate-300 rounded-md text-xs px-2 bg-white text-slate-800"
                    >
                      <option value="offline">Offline (Physical Event)</option>
                      <option value="online">Online Assessment Drive</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="district" className="text-xs font-semibold text-slate-700">
                      District *
                    </Label>
                    <select
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full h-10 border border-slate-300 rounded-md text-xs px-2 bg-white text-slate-800"
                    >
                      {DISTRICT_NAMES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-semibold text-slate-700">
                    Location / Campus Venue
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Main Auditorium, Karimnagar District Headquarters"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border-slate-300 h-10 text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-sm font-semibold shadow-md mt-2"
                >
                  {loading ? "Registering Event..." : "Create Road Safety Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
