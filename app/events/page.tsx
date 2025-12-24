"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Loader2, CalendarCheck, CheckCircle2, MapPin, Calendar, Clock } from "lucide-react";

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

export default function EventsPage() {
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [organizerId, setOrganizerId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    organizerId: "",
    date: "",
    location: "Karimnagar",
  });

  useEffect(() => {
    fetch("/api/events/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
        setLoadingEvents(false);
      })
      .catch(() => {
        setLoadingEvents(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setReferenceId(null);

    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizerId: organizerId || formData.organizerId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setReferenceId(data.referenceId);
        setFormData({
          title: "",
          organizerId: "",
          date: "",
          location: "Karimnagar",
        });
        setOrganizerId("");
        // Refresh events list
        fetch("/api/events/list")
          .then((res) => res.json())
          .then((data) => {
            if (data.events) setEvents(data.events);
          });
      } else {
        alert(data.error || "Failed to create event");
      }
    } catch (error) {
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="rs-chip flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" /> {t("events")}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">
            {i18n.language === "te"
              ? "రోడ్ సేఫ్టీ ఈవెంట్‌లు - కరీంనగర్"
              : "Road Safety Events - Karimnagar"}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {i18n.language === "te"
              ? "కరీంనగర్ జిల్లాలో జరిగే రోడ్ సేఫ్టీ ఈవెంట్‌లను చూడండి. మీ ఈవెంట్‌ను లాగ్ చేయడానికి ఆర్గనైజర్ ID అవసరం."
              : "Browse approved road safety events in Karimnagar district. Organizer ID required to create events."}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-emerald-900">
          {i18n.language === "te" ? "ఆమోదించబడిన ఈవెంట్‌లు" : "Approved Events"}
        </h2>
        {loadingEvents ? (
          <div className="text-center py-8 text-slate-600">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            {i18n.language === "te"
              ? "ఇంకా ఈవెంట్‌లు లేవు"
              : "No events yet"}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.referenceId} className="rs-card p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-emerald-900 leading-tight">{event.title}</h3>
                    {event.approved ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-emerald-700 font-medium">{event.organizerName}</p>
                  <p className="text-xs text-slate-600">{event.institution}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-100">
                  <p className="text-xs font-mono text-slate-500">{event.referenceId}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Form - Only for approved organizers */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rs-card p-8 bg-gradient-to-br from-amber-50 to-white">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-emerald-900">
              {i18n.language === "te" ? "మీ రోడ్ సేఫ్టీ ఈవెంట్‌ను లాగ్ చేయండి" : "Log Your Road Safety Event"}
            </h2>
            <p className="text-slate-600">
              {i18n.language === "te"
                ? "మీ సంస్థ యొక్క రోడ్ సేఫ్టీ మాస్ కార్యకలాపాలను సమర్పించండి. ఆమోదించబడిన ప్రతి ఎంట్రీ ఒక రిఫరెన్స్ ID ను ఉత్పత్తి చేస్తుంది."
                : "Submit your institution's Road Safety Month activities. Every approved entry generates a reference ID. You must be an approved organizer."}
            </p>
          </div>
        </div>

        <div className="rs-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organizerId" className="text-sm font-semibold text-emerald-900">
                {i18n.language === "te" ? "ఆర్గనైజర్ ID" : "Organizer ID"} *
              </Label>
              <Input
                id="organizerId"
                value={organizerId || formData.organizerId}
                onChange={(e) => {
                  setOrganizerId(e.target.value);
                  setFormData({ ...formData, organizerId: e.target.value });
                }}
                placeholder="KRMR-RSM-2026-PDL-RHL-ORGANIZER-00001"
                required
                className="h-11 rounded-lg border border-emerald-200"
              />
              <p className="text-xs text-slate-500">
                {i18n.language === "te"
                  ? "మీ ఫైనల్ ఆర్గనైజర్ ID ను నమోదు చేయండి"
                  : "Enter your Final Organizer ID from organizer registration"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-emerald-900">
                {tc("eventTitle") || "Event Title"} *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="h-11 rounded-lg border border-emerald-200"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-emerald-900">
                  {tc("eventDate") || "Event Date"} *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="h-11 rounded-lg border border-emerald-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold text-emerald-900">
                  {tc("location") || "Location"}
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-11 rounded-lg border border-emerald-200"
                />
              </div>
            </div>

            <Button type="submit" className="rs-btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {tc("submitting") || "Submitting..."}
                </>
              ) : (
                tc("submitEvent") || "Submit Event"
              )}
            </Button>

            {success && (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-lg space-y-2">
                <p className="text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />{" "}
                  {i18n.language === "te"
                    ? "ఈవెంట్ విజయవంతంగా లాగ్ చేయబడింది!"
                    : "Event logged successfully!"}
                </p>
                {referenceId && (
                  <p className="text-sm text-emerald-900">
                    {i18n.language === "te" ? "రిఫరెన్స్ ID" : "Reference ID"}:{" "}
                    <span className="font-mono font-semibold">{referenceId}</span>
                  </p>
                )}
                <p className="text-xs text-emerald-800">
                  {i18n.language === "te"
                    ? "ఈ ID ని పాల్గొనేవారు తమ సర్టిఫికేట్‌లను ఉత్పత్తి చేయడానికి ఉపయోగించవచ్చు. ఈవెంట్ అడ్మిన్ ఆమోదం తర్వాత ప్రదర్శించబడుతుంది."
                    : "Participants can use this ID to generate certificates. Event will be visible after admin approval."}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
