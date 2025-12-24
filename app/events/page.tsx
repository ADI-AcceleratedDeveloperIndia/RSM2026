"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Loader2, CalendarCheck, CheckCircle2, MapPin, Users, Calendar } from "lucide-react";

const DUMMY_EVENTS = [
  {
    id: "evt_krm_001",
    title: "Road Safety Rally - Students for Safe Roads",
    organiser: "Karimnagar Polytechnic",
    date: "2026-01-03",
    location: "Karimnagar Town Hall",
    district: "Karimnagar",
    participants: 1200,
    type: "Rally",
  },
  {
    id: "evt_src_001",
    title: "First Aid Training for Road Accidents",
    organiser: "Sircilla Medical College",
    date: "2026-01-05",
    location: "Sircilla District Hospital",
    district: "Rajanna Sircilla",
    participants: 350,
    type: "Training",
  },
  {
    id: "evt_hyd_001",
    title: "Helmet Safety Awareness Campaign",
    organiser: "Hyderabad Traffic Police",
    date: "2026-01-07",
    location: "Gachibowli Stadium",
    district: "Hyderabad",
    participants: 850,
    type: "Awareness Campaign",
  },
  {
    id: "evt_wgl_001",
    title: "School Zone Safety Workshop",
    organiser: "Warangal Education Department",
    date: "2026-01-10",
    location: "Warangal Public School",
    district: "Warangal",
    participants: 520,
    type: "Workshop",
  },
  {
    id: "evt_nzb_001",
    title: "Two-Wheeler Safety Pledge Drive",
    organiser: "Nizamabad Youth Forum",
    date: "2026-01-12",
    location: "Nizamabad Central Park",
    district: "Nizamabad",
    participants: 680,
    type: "Pledge Drive",
  },
  {
    id: "evt_krm_002",
    title: "Drunk Driving Awareness Seminar",
    organiser: "Karimnagar RTA Office",
    date: "2026-01-15",
    location: "Karimnagar Community Center",
    district: "Karimnagar",
    participants: 420,
    type: "Seminar",
  },
  {
    id: "evt_src_002",
    title: "Emergency Response Training for Drivers",
    organiser: "Sircilla Transport Association",
    date: "2026-01-18",
    location: "Sircilla Bus Depot",
    district: "Rajanna Sircilla",
    participants: 280,
    type: "Training",
  },
  {
    id: "evt_khm_001",
    title: "Pedestrian Safety Awareness Program",
    organiser: "Khammam Municipal Corporation",
    date: "2026-01-22",
    location: "Khammam City Center",
    district: "Khammam",
    participants: 390,
    type: "Awareness Program",
  },
  {
    id: "evt_adb_001",
    title: "Road Safety Exhibition for Schools",
    organiser: "Adilabad Education Board",
    date: "2026-01-25",
    location: "Adilabad Exhibition Grounds",
    district: "Adilabad",
    participants: 610,
    type: "Exhibition",
  },
];

export default function EventsPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const getEventTypeTranslation = (type: string): string => {
    const typeMap: Record<string, string> = {
      "Rally": tc("eventTypeRally"),
      "Training": tc("eventTypeTraining"),
      "Awareness Campaign": tc("eventTypeAwarenessCampaign"),
      "Workshop": tc("eventTypeWorkshop"),
      "Pledge Drive": tc("eventTypePledgeDrive"),
      "Seminar": tc("eventTypeSeminar"),
      "Awareness Program": tc("eventTypeAwarenessProgram"),
      "Exhibition": tc("eventTypeExhibition"),
    };
    return typeMap[type] || type;
  };

  // Sort events: Karimnagar and Sircilla first, then alphabetically
  const sortedEvents = useMemo(() => {
    const priority = ['Karimnagar', 'Rajanna Sircilla'];
    const priorityEvents = DUMMY_EVENTS.filter(e => priority.includes(e.district));
    const otherEvents = DUMMY_EVENTS
      .filter(e => !priority.includes(e.district))
      .sort((a, b) => a.district.localeCompare(b.district));
    return [...priorityEvents, ...otherEvents];
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setReferenceId(null);

    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a reference ID
    const refId = `EVT-${Date.now().toString(36).toUpperCase()}`;
    
    setSuccess(true);
    setReferenceId(refId);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
  };

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="rs-chip flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" /> {t("events")}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">{tc("roadSafetyEventsAcrossTelangana") || "Road Safety Events Across Telangana"}</h1>
          <p className="text-slate-600 max-w-2xl">
            {tc("browseOngoingEvents") || "Browse ongoing road safety events, rallies, workshops, and campaigns across all districts. Join or log your own event."}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-emerald-900">{tc("upcomingRecentEvents") || "Upcoming & Recent Events"}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map((event) => (
            <div key={event.id} className="rs-card p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-emerald-900 leading-tight">{event.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    {getEventTypeTranslation(event.type)}
                  </span>
                </div>
                <p className="text-sm text-emerald-700 font-medium">{event.organiser}</p>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>{event.location}, {event.district}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>{event.participants} {tc("participants")}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-100">
                <p className="text-xs text-slate-500">{tc("eventId")}: {event.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Event Form */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rs-card p-8 bg-gradient-to-br from-amber-50 to-white">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-emerald-900">{tc("logYourRoadSafetyEvent") || "Log Your Road Safety Event"}</h2>
            <p className="text-slate-600">
              {tc("submitInstitutionActivities") || "Submit your institution's Road Safety Month activities, workshops, and campaigns. Every approved entry generates a reference ID to help participants earn certificates."}
            </p>
          </div>
        </div>

      <div className="rs-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-emerald-900">{tc("eventTitle") || "Event Title"} *</Label>
            <Input id="title" name="title" required className="h-11 rounded-lg border border-emerald-200" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organiserName" className="text-sm font-semibold text-emerald-900">{tc("organiserName") || "Organiser Name"} *</Label>
              <Input id="organiserName" name="organiserName" required className="h-11 rounded-lg border border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organiserRole" className="text-sm font-semibold text-emerald-900">{tc("organiserRole") || "Organiser Role"}</Label>
              <Input
                id="organiserRole"
                name="organiserRole"
                placeholder={tc("principalHodEtc") || "Principal, HOD, etc."}
                className="h-11 rounded-lg border border-emerald-200"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-semibold text-emerald-900">{t("institution")}</Label>
              <Input id="institution" name="institution" className="h-11 rounded-lg border border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-emerald-900">{tc("eventDate") || "Event Date"} *</Label>
              <Input id="date" name="date" type="date" required className="h-11 rounded-lg border border-emerald-200" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-emerald-900">{tc("location") || "Location"}</Label>
              <Input id="location" name="location" className="h-11 rounded-lg border border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regionCode" className="text-sm font-semibold text-emerald-900">{tc("regionCode") || "Region Code"}</Label>
              <Input
                id="regionCode"
                name="regionCode"
                placeholder="HYD-01"
                className="h-11 rounded-lg border border-emerald-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-emerald-900">
              {tc("highlightsOptional") || "Highlights (optional)"}
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder={tc("keyOutcomesPlaceholder") || "Key outcomes, number of participants, collaborations..."}
              rows={4}
              className="border border-emerald-200"
            />
          </div>

          <Button type="submit" className="rs-btn-primary w-full justify-center" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {tc("submitting")}
              </>
            ) : (
              tc("submitEvent") || "Submit Event"
            )}
          </Button>

          {success && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-lg space-y-2">
              <p className="text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> {tc("eventLoggedSuccessfully") || "Event logged successfully!"}
              </p>
              {referenceId && (
                <p className="text-sm text-emerald-900">
                  {tc("referenceId")}: <span className="font-semibold">{referenceId}</span>
                </p>
              )}
              <p className="text-xs text-emerald-800">{tc("shareIdForCertificates") || "Share this ID so participants can generate or verify their certificates."}</p>
            </div>
          )}
        </form>
      </div>
      </div>
    </div>
  );
}








