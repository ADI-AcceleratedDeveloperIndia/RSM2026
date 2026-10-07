"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, CheckCircle2, Clock, Upload, X, Plus, Loader2, Trash2, Users, Award, ExternalLink, Building, FileText } from "lucide-react";

type Participant = {
  certificateId: string;
  name: string;
  institution: string;
  type?: string;
  score?: number;
  total?: number;
  percentage?: number;
  activityType?: string;
  certificateDate?: string;
};

type Event = {
  referenceId: string;
  title: string;
  date: string;
  location: string;
  organizerName: string;
  institution: string;
  approved: boolean;
  organizerId?: string;
  eventType?: "statewide" | "regional";
  eventContext?: "online" | "offline";
  district?: string;
  groupPhoto?: string;
  youtubeVideos?: string[];
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizerId, setOrganizerId] = useState("");
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingVideos, setUpdatingVideos] = useState(false);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  useEffect(() => {
    // Fetch event details
    fetch(`/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          setEvent(data.event);
          setYoutubeUrls(data.event.youtubeVideos || []);
          if (data.event.groupPhoto) {
            setPhotoPreview(`/api/events/get-photo?photoId=${data.event.groupPhoto}`);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch participant roster
    fetch(`/api/events/participants?eventReferenceId=${encodeURIComponent(eventId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.participants) {
          setParticipants(data.participants);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingParticipants(false));
  }, [eventId]);

  const handleOrganizerCheck = () => {
    if (!organizerId.trim()) {
      alert(i18n.language === "te" ? "దయచేసి ఆర్గనైజర్ ID నమోదు చేయండి" : "Please enter Organizer ID");
      return;
    }
    if (event && event.organizerId) {
      // Directly check if entered organizerId matches event's organizerId
      if (organizerId.trim() === event.organizerId) {
        setIsOrganizer(true);
      } else {
        alert(i18n.language === "te" ? "ఈ ఈవెంట్‌కు మీరు ఆర్గనైజర్ కాదు" : "You are not the organizer of this event");
      }
    } else {
      alert(i18n.language === "te" ? "ఈవెంట్ వివరాలు లోడ్ కావడంలో లోపం" : "Error loading event details");
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      alert(i18n.language === "te" ? "ఫైల్ పరిమాణం 1MB కంటే తక్కువగా ఉండాలి" : "File size must be less than 1MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert(i18n.language === "te" ? "కేవలం చిత్ర ఫైళ్లు అనుమతించబడతాయి" : "Only image files are allowed");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !event) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("eventReferenceId", event.referenceId);
    formData.append("file", photoFile);

    try {
      const res = await fetch("/api/events/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(i18n.language === "te" ? "ఫోటో విజయవంతంగా అప్‌లోడ్ చేయబడింది" : "Photo uploaded successfully");
        if (data.photoId) {
          setPhotoPreview(`/api/events/get-photo?photoId=${data.photoId}`);
          setEvent({ ...event, groupPhoto: data.photoId });
        }
        setPhotoFile(null);
      } else {
        alert(data.error || (i18n.language === "te" ? "అప్‌లోడ్ విఫలమైంది" : "Upload failed"));
      }
    } catch (error) {
      alert(i18n.language === "te" ? "అప్‌లోడ్ విఫలమైంది" : "Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!event || !event.groupPhoto) return;

    // Confirm deletion
    const confirmMessage = i18n.language === "te" 
      ? "మీరు ఈ ఫోటోను తొలగించాలని ఖచ్చితంగా ఉన్నారా?"
      : "Are you sure you want to delete this photo?";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Use stored organizerId if organizer is verified, otherwise use entered organizerId
    const currentOrganizerId = isOrganizer && event.organizerId 
      ? event.organizerId 
      : organizerId.trim();

    // Verify organizer ID is available
    if (!currentOrganizerId) {
      alert(i18n.language === "te" 
        ? "దయచేసి మీ ఆర్గనైజర్ ID నమోదు చేయండి మరియు ధృవీకరించండి" 
        : "Please enter and verify your Organizer ID");
      return;
    }

    // Verify organizer matches (if not already verified)
    if (!isOrganizer && event.organizerId && currentOrganizerId !== event.organizerId) {
      alert(i18n.language === "te" 
        ? "ఈ ఈవెంట్‌కు మీరు ఆర్గనైజర్ కాదు" 
        : "You are not the organizer of this event");
      return;
    }

    setDeletingPhoto(true);
    try {
      const res = await fetch("/api/events/delete-photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventReferenceId: event.referenceId,
          organizerId: currentOrganizerId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(i18n.language === "te" ? "ఫోటో విజయవంతంగా తొలగించబడింది" : "Photo deleted successfully");
        setPhotoPreview(null);
        setEvent({ ...event, groupPhoto: undefined });
      } else {
        alert(data.error || (i18n.language === "te" ? "తొలగింపు విఫలమైంది" : "Delete failed"));
      }
    } catch (error) {
      alert(i18n.language === "te" ? "తొలగింపు విఫలమైంది" : "Delete failed");
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleVideoUrlChange = (index: number, value: string) => {
    const newUrls = [...youtubeUrls];
    newUrls[index] = value;
    setYoutubeUrls(newUrls);
  };

  const handleAddVideo = () => {
    if (youtubeUrls.length >= 5) {
      alert(i18n.language === "te" ? "గరిష్టంగా 5 వీడియోలు మాత్రమే" : "Maximum 5 videos allowed");
      return;
    }
    setYoutubeUrls([...youtubeUrls, ""]);
  };

  const handleRemoveVideo = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const handleDeleteVideo = async (index: number) => {
    if (!event || !event.youtubeVideos) return;

    // Confirm deletion
    const confirmMessage = i18n.language === "te" 
      ? "మీరు ఈ వీడియోను తొలగించాలని ఖచ్చితంగా ఉన్నారా?"
      : "Are you sure you want to delete this video?";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Use stored organizerId if organizer is verified, otherwise use entered organizerId
    const currentOrganizerId = isOrganizer && event.organizerId 
      ? event.organizerId 
      : organizerId.trim();

    // Verify organizer ID is available
    if (!currentOrganizerId) {
      alert(i18n.language === "te" 
        ? "దయచేసి మీ ఆర్గనైజర్ ID నమోదు చేయండి మరియు ధృవీకరించండి" 
        : "Please enter and verify your Organizer ID");
      return;
    }

    // Verify organizer matches (if not already verified)
    if (!isOrganizer && event.organizerId && currentOrganizerId !== event.organizerId) {
      alert(i18n.language === "te" 
        ? "ఈ ఈవెంట్‌కు మీరు ఆర్గనైజర్ కాదు" 
        : "You are not the organizer of this event");
      return;
    }

    // Remove video from event's youtubeVideos array
    const updatedVideos = event.youtubeVideos.filter((_, i) => i !== index);

    // Save updated list
    setUpdatingVideos(true);
    try {
      const res = await fetch("/api/events/update-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventReferenceId: event.referenceId,
          youtubeVideos: updatedVideos,
          organizerId: currentOrganizerId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(i18n.language === "te" ? "వీడియో విజయవంతంగా తొలగించబడింది" : "Video deleted successfully");
        setEvent({ ...event, youtubeVideos: data.youtubeVideos });
        setYoutubeUrls(data.youtubeVideos);
      } else {
        alert(data.error || (i18n.language === "te" ? "తొలగింపు విఫలమైంది" : "Delete failed"));
      }
    } catch (error) {
      alert(i18n.language === "te" ? "తొలగింపు విఫలమైంది" : "Delete failed");
    } finally {
      setUpdatingVideos(false);
    }
  };

  const handleSaveVideos = async () => {
    if (!event) return;

    // Use stored organizerId if organizer is verified, otherwise use entered organizerId
    const currentOrganizerId = isOrganizer && event.organizerId 
      ? event.organizerId 
      : organizerId.trim();

    // Verify organizer ID is available
    if (!currentOrganizerId) {
      alert(i18n.language === "te" 
        ? "దయచేసి మీ ఆర్గనైజర్ ID నమోదు చేయండి మరియు ధృవీకరించండి" 
        : "Please enter and verify your Organizer ID");
      return;
    }

    // Verify organizer matches (if not already verified)
    if (!isOrganizer && event.organizerId && currentOrganizerId !== event.organizerId) {
      alert(i18n.language === "te" 
        ? "ఈ ఈవెంట్‌కు మీరు ఆర్గనైజర్ కాదు" 
        : "You are not the organizer of this event");
      return;
    }

    setUpdatingVideos(true);
    try {
      const res = await fetch("/api/events/update-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventReferenceId: event.referenceId,
          youtubeVideos: youtubeUrls.filter((url) => url.trim()),
          organizerId: currentOrganizerId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(i18n.language === "te" ? "వీడియోలు విజయవంతంగా నవీకరించబడ్డాయి" : "Videos updated successfully");
        setEvent({ ...event, youtubeVideos: data.youtubeVideos });
        setYoutubeUrls(data.youtubeVideos);
      } else {
        alert(data.error || (i18n.language === "te" ? "నవీకరణ విఫలమైంది" : "Update failed"));
      }
    } catch (error) {
      alert(i18n.language === "te" ? "నవీకరణ విఫలమైంది" : "Update failed");
    } finally {
      setUpdatingVideos(false);
    }
  };

  if (loading) {
    return (
      <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-slate-600">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rs-container py-20 text-center">
        <p className="text-slate-600">Event not found</p>
        <Button onClick={() => router.push("/events")} className="mt-4">
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="rs-container py-14 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-emerald-900">{event.title}</CardTitle>
              <p className="text-emerald-700 font-medium">{event.organizerName}</p>
              <p className="text-sm text-slate-600">{event.institution}</p>
            </div>
            {event.approved ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Event Type and Reference ID */}
          <div className="space-y-2 pt-2 border-t border-emerald-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600 font-medium">
                {i18n.language === "te" ? "ఈవెంట్ రకం" : "Event Type"}:
              </span>
              {event.eventType === "statewide" && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {i18n.language === "te" ? "రాష్ట్రవ్యాప్త" : "Statewide Event"}
                </span>
              )}
              {event.eventType === "regional" && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                  {i18n.language === "te" ? "ప్రాంతీయ" : "Regional Event"}
                </span>
              )}
              {event.eventContext && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  event.eventContext === "online" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-orange-100 text-orange-800"
                }`}>
                  {i18n.language === "te" 
                    ? (event.eventContext === "online" ? "ఆన్లైన్" : "ఆఫ్‌లైన్")
                    : (event.eventContext === "online" ? "Online" : "Offline")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600 font-medium">
                {i18n.language === "te" ? "ఈవెంట్ రిఫరెన్స్ ID" : "Event Reference ID"}:
              </span>
              <span className="font-mono text-xs text-emerald-700">{event.referenceId}</span>
            </div>
          </div>

          {/* Organizer Verification */}
          {!isOrganizer && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-800 mb-4">
                  {i18n.language === "te"
                    ? "ఈ ఈవెంట్‌కు మీడియాను అప్‌లోడ్ చేయడానికి, దయచేసి మీ ఆర్గనైజర్ ID ను నమోదు చేయండి"
                    : "To upload media for this event, please enter your Organizer ID"}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={organizerId}
                    onChange={(e) => setOrganizerId(e.target.value)}
                    placeholder="KRMR-RSM-2027-RTA-DTO-ORGANIZER-00001"
                    className="flex-1"
                  />
                  <Button onClick={handleOrganizerCheck}>Verify</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Group Photo Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-900">
              {i18n.language === "te" ? "గ్రూప్ ఫోటో" : "Group Photo"}
            </h3>
            {photoPreview ? (
              <div className="space-y-2">
                <div className="relative w-full max-w-2xl aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  {/* Use regular img tag for API routes with query parameters */}
                  <img
                    src={photoPreview}
                    alt="Group Photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                {isOrganizer && (
                  <Button
                    onClick={handlePhotoDelete}
                    disabled={deletingPhoto}
                    variant="destructive"
                    className="w-full md:w-auto"
                  >
                    {deletingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {i18n.language === "te" ? "తొలగిస్తోంది..." : "Deleting..."}
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {i18n.language === "te" ? "ఫోటో తొలగించండి" : "Delete Photo"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {i18n.language === "te" ? "ఫోటో అప్‌లోడ్ చేయబడలేదు" : "No photo uploaded"}
              </p>
            )}
            {isOrganizer && (
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-sm font-semibold">
                  {i18n.language === "te" ? "గ్రూప్ ఫోటో అప్‌లోడ్ చేయండి (గరిష్టం 1MB)" : "Upload Group Photo (Max 1MB)"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="flex-1"
                  />
                  <Button
                    onClick={handlePhotoUpload}
                    disabled={!photoFile || uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {i18n.language === "te" ? "అప్‌లోడ్ అవుతోంది..." : "Uploading..."}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {i18n.language === "te" ? "అప్‌లోడ్" : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* YouTube Videos Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-900">
              {i18n.language === "te" ? "యూట్యూబ్ వీడియోలు" : "YouTube Videos"}
            </h3>
            {event.youtubeVideos && event.youtubeVideos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {event.youtubeVideos.map((videoUrl, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                      <iframe
                        src={videoUrl}
                        title={`Video ${index + 1}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {isOrganizer && (
                      <Button
                        onClick={() => handleDeleteVideo(index)}
                        disabled={updatingVideos}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        {updatingVideos ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {i18n.language === "te" ? "తొలగిస్తోంది..." : "Deleting..."}
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {i18n.language === "te" ? "వీడియో తొలగించండి" : "Delete Video"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {i18n.language === "te" ? "వీడియోలు జోడించబడలేదు" : "No videos added"}
              </p>
            )}
            {isOrganizer && (
              <div className="space-y-3">
                {youtubeUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveVideo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  {youtubeUrls.length < 5 && (
                    <Button variant="outline" onClick={handleAddVideo}>
                      <Plus className="h-4 w-4 mr-2" />
                      {i18n.language === "te" ? "వీడియో జోడించండి" : "Add Video"}
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveVideos}
                    disabled={updatingVideos}
                    className="rs-btn-primary"
                  >
                    {updatingVideos ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {i18n.language === "te" ? "సేవ్ అవుతోంది..." : "Saving..."}
                      </>
                    ) : (
                      i18n.language === "te" ? "వీడియోలు సేవ్ చేయండి" : "Save Videos"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  {i18n.language === "te"
                    ? "గరిష్టంగా 5 యూట్యూబ్ వీడియోలు. YouTube URL లను నమోదు చేయండి"
                    : "Maximum 5 YouTube videos. Enter YouTube URLs"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participant Roster & Issued Certificates Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-xl text-slate-900">
                {i18n.language === "te" ? "హాజరైన ప్రతినిధులు & సర్టిఫికెట్లు" : "Participant Roster & Verified Certificates"}
              </CardTitle>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {participants.length} {i18n.language === "te" ? "ధృవీకరించబడినవి" : "Verified"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {i18n.language === "te"
                ? `ఈ ఈవెంట్ లో పాల్గొని ప్రభుత్వ అధికారిక సర్టిఫికెట్ అందుకున్న ప్రతినిధుల జాబితా (${event.institution}).`
                : `Verified participants who completed safety drives and assessments under ${event.institution}.`}
            </p>
          </div>

          <a
            href={`/certificates/generate?ref=${encodeURIComponent(event.referenceId)}&event=${encodeURIComponent(event.title)}&institution=${encodeURIComponent(event.institution || "")}&district=${encodeURIComponent(event.district || "")}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-sm whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{i18n.language === "te" ? "సర్టిఫికెట్ జారీ చేయండి" : "Issue / Earn Certificate"}</span>
          </a>
        </CardHeader>

        <CardContent className="pt-5">
          {loadingParticipants ? (
            <div className="py-8 text-center flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>{i18n.language === "te" ? "పార్టిసిపెంట్లు లోడ్ అవుతున్నారు..." : "Loading participant roster..."}</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="py-10 text-center space-y-3 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {i18n.language === "te" ? "ఇంకా పార్టిసిపెంట్లు నమోదు కాలేదు" : "No certificates issued for this event yet"}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {i18n.language === "te"
                  ? "ఈ ఈవెంట్ కోసం మీ పాఠశాల లేదా కళాశాల విద్యార్థులకు సర్టిఫికెట్లు జారీ చేయండి."
                  : `Participants who complete activities tagged with this Event Reference ID (${event.referenceId}) will automatically appear in this roster.`}
              </p>
              <a
                href={`/certificates/generate?ref=${encodeURIComponent(event.referenceId)}&event=${encodeURIComponent(event.title)}&institution=${encodeURIComponent(event.institution || "")}&district=${encodeURIComponent(event.district || "")}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline mt-1"
              >
                <span>{i18n.language === "te" ? "మొదటి సర్టిఫికెట్ రూపొందించండి →" : "Generate First Certificate for this Event →"}</span>
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-3 px-3">Participant Name</th>
                    <th className="py-3 px-3">Institution / Organisation</th>
                    <th className="py-3 px-3">Activity & Score</th>
                    <th className="py-3 px-3">Certificate ID</th>
                    <th className="py-3 px-3 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participants.map((p) => (
                    <tr key={p.certificateId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Building className="h-3 w-3 text-emerald-700" />
                          {p.institution || event.institution || "Road Safety Club"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="capitalize font-medium text-slate-800">{p.activityType || "Participation"}</span>
                        {p.score !== undefined && p.total !== undefined && p.total > 0 && (
                          <span className="ml-1 text-[11px] text-emerald-700 font-bold">
                            ({p.score}/{p.total})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {p.certificateId}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={`/certificates/preview?certId=${encodeURIComponent(p.certificateId)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium"
                        >
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
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
  );
}

