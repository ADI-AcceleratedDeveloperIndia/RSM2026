"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  BrainCircuit,
  GraduationCap,
  Activity,
  Award,
  Compass,
  Users,
  BookOpenCheck,
  ArrowRight,
  TrafficCone,
  AlertTriangle,
  Footprints,
  Music,
  BookOpen,
  Download,
  Trophy,
  HeartHandshake,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import AudioGuide from "@/components/AudioGuide";
import ParentsPledgeModal from "@/components/ParentsPledgeModal";
import MinisterMessageModal from "@/components/MinisterMessageModal";

export default function Home() {
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const isTe = i18n.language === "te";
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [ministerMessageModalOpen, setMinisterMessageModalOpen] = useState(false);

  // Check if anthem was playing when component mounts
  useEffect(() => {
    const wasPlaying = sessionStorage.getItem("anthemPlaying") === "true";
    if (wasPlaying) {
      // Show "Stop Anthem" button (audio stopped when navigating away, but button state persists)
      setIsPlaying(true);
      // Initialize audio ref so we can stop it if needed
      if (!audioRef.current) {
        audioRef.current = new Audio("/assets/ROADSAFETY3.wav");
        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
          sessionStorage.removeItem("anthemPlaying");
        });
      }
    }
  }, []);

  const handleAnthemClick = () => {
    if (isPlaying) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      sessionStorage.removeItem("anthemPlaying");
    } else {
      // Start playing
      if (!audioRef.current) {
        audioRef.current = new Audio("/assets/ROADSAFETY3.wav");
        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
          sessionStorage.removeItem("anthemPlaying");
        });
      }
      audioRef.current.play().catch((err) => {
        console.error("Error playing anthem:", err);
        setIsPlaying(false);
        sessionStorage.removeItem("anthemPlaying");
      });
      setIsPlaying(true);
      sessionStorage.setItem("anthemPlaying", "true");
    }
  };
  const leadershipProfiles = [
    {
      title: "Hon'ble Chief Minister",
      name: "[Chief Minister]",
      image: "/assets/leadership/chief-minister-placeholder.svg",
      alt: "Hon'ble Chief Minister",
      isMinister: false,
    },
    {
      title: "Hon'ble Transport Minister",
      name: "[Minister for Transport]",
      image: "/assets/leadership/transport-minister-placeholder.svg",
      alt: "Hon'ble Transport Minister",
      isMinister: true,
    },
  ];
  
  const rulesSections = [
    {
      title: tc("helmetProtocol"),
      icon: <TrafficCone className="h-6 w-6" />,
      description: tc("helmetProtocolDesc"),
    },
    {
      title: tc("seatbeltDiscipline"),
      icon: <ShieldCheck className="h-6 w-6" />,
      description: tc("seatbeltDisciplineDesc"),
    },
    {
      title: tc("speedAwareness"),
      icon: <AlertTriangle className="h-6 w-6" />,
      description: tc("speedAwarenessDesc"),
    },
    {
      title: tc("pedestrianPriority"),
      icon: <Footprints className="h-6 w-6" />,
      description: tc("pedestrianPriorityDesc"),
    },
  ];

  const featureCards = [
    {
      title: t("roadSafety"),
      description: tc("roadSafetyComprehensiveGuides"),
      href: "/road-safety",
      icon: <BookOpenCheck className="h-6 w-6" />,
      accent: "bg-yellow-100 text-yellow-800",
    },
  ];

  const engagementHighlights = [
    {
      label: tc("quizArena"),
      description: tc("quizArenaDesc"),
      href: "/quiz",
      icon: <GraduationCap className="h-6 w-6" />,
    },
    {
      label: tc("simulationLab"),
      description: tc("simulationLabDesc"),
      href: "/simulation",
      icon: <BrainCircuit className="h-6 w-6" />,
    },
    {
      label: tc("certificatesHub"),
      description: tc("certificatesHubDesc"),
      href: "/certificates",
      icon: <Award className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-24">
      <section className="rs-hero-pattern">
        <div className="rs-container py-6 sm:py-8 md:py-12 w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-8 lg:gap-12 w-full">
            <div className="flex-1 space-y-4 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rs-chip" style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}>
                  State Government • Transport Department
                </span>
                <span className="rs-chip" style={{ background: "rgba(99, 102, 241, 0.35)", color: "#ffffff", border: "1px solid rgba(165, 180, 252, 0.4)" }}>
                  RSM 2027 • National Action & Impact Platform
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                {tc("togetherForSaferRoads")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-xl">
                {tc("roadSafetySharedResponsibility")}
              </p>
              {/* Citizen Action Launchpad (Mobile-First 2-Tier Responsive UX) */}
              <div className="space-y-3 pt-2 w-full">
                {/* Tier 1: Primary Citizen Interactive Actions (3 High-Impact Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* 1. Quiz Challenge */}
                  <Link
                    href="/quiz"
                    className="group relative flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-600/20 to-amber-950/40 border border-amber-400/50 hover:border-amber-300 text-white shadow-lg shadow-amber-950/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-amber-500/20 min-h-[56px]"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 group-hover:bg-amber-400 group-hover:text-amber-950 transition-colors shrink-0">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                          {isTe ? "క్విజ్ ఛాలెంజ్" : "Take Quiz Challenge"}
                        </div>
                        <div className="text-[11px] text-amber-200/90 font-medium">
                          {isTe ? "మెరిట్ సర్టిఫికేట్" : "Earn Merit Certificate"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-300 sm:self-end transition-transform group-hover:translate-x-1 shrink-0" />
                  </Link>

                  {/* 2. Parents Safety Pledge */}
                  <button
                    type="button"
                    onClick={() => setPledgeModalOpen(true)}
                    className="group relative flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-teal-600/20 to-emerald-950/40 border border-emerald-400/50 hover:border-emerald-300 text-white shadow-lg shadow-emerald-950/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-500/20 text-left w-full min-h-[56px]"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-colors shrink-0">
                        <HeartHandshake className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                          {isTe ? "తల్లిదండ్రుల ప్రతిజ్ఞ" : "Parents Safety Pledge"}
                        </div>
                        <div className="text-[11px] text-emerald-200/90 font-medium">
                          {isTe ? "కుటుంబ రక్షణ కార్డ్" : "Family Safety Card"}
                        </div>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/30 self-end">
                      {isTe ? "ప్రతిజ్ఞ తీసుకోండి" : "Sign Pledge"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-emerald-300 sm:hidden shrink-0" />
                  </button>

                  {/* 3. Simulation Lab */}
                  <Link
                    href="/simulation"
                    className="group relative flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/25 via-blue-600/20 to-slate-900/40 border border-indigo-400/50 hover:border-indigo-300 text-white shadow-lg shadow-indigo-950/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-500/20 min-h-[56px]"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-400/20 text-cyan-300 border border-indigo-400/30 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors shrink-0">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                          {isTe ? "సిమ్యులేషన్ ల్యాబ్" : "Simulation Lab"}
                        </div>
                        <div className="text-[11px] text-cyan-200/90 font-medium">
                          {isTe ? "ఇంటరాక్టివ్ అభ్యాసం" : "Fix Road Violations"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-cyan-300 sm:self-end transition-transform group-hover:translate-x-1 shrink-0" />
                  </Link>
                </div>

                {/* Tier 2: Citizen Utilities & Resources Strip (3 Refined Touch-Friendly Pills) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Utility 1: Traffic Basics & Rules Test */}
                  <Link
                    href="/basics"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all backdrop-blur-md shadow-sm min-h-[44px]"
                    title="Road Safety Rules & Learning Test"
                  >
                    <BookOpen className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span>{isTe ? "ట్రాఫిక్ రూల్స్ టెస్ట్" : "Traffic Rules Test"}</span>
                  </Link>

                  {/* Utility 2: Campaign Anthem (Play/Stop + 1-Touch Download) */}
                  <div className="flex items-stretch rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all backdrop-blur-md shadow-sm overflow-hidden min-h-[44px]">
                    <button
                      type="button"
                      onClick={handleAnthemClick}
                      className="flex-1 flex items-center justify-center gap-2 px-2.5 py-2 text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
                      aria-label="Play or Stop Road Safety Anthem"
                    >
                      <Music className={`h-4 w-4 shrink-0 ${isPlaying ? "text-amber-300 animate-bounce" : "text-emerald-300"}`} />
                      <span className="truncate">
                        {isPlaying
                          ? (isTe ? "ఆపండి ⏹" : "Stop Anthem ⏹")
                          : (isTe ? "రోడ్ సేఫ్టీ గీతం" : "Safety Anthem")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = "/assets/ROADSAFETY3.wav";
                        link.download = "Road-Safety-Anthem.wav";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-2.5 py-2 flex items-center justify-center border-l border-white/20 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                      aria-label="Download Anthem Audio"
                      title="Download Anthem Audio"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                    </button>
                  </div>

                  {/* Utility 3: Download Official Poster */}
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/assets/Road-Safety-Month-Poster.png";
                      link.download = "Road-Safety-Month-Poster.png";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all backdrop-blur-md shadow-sm min-h-[44px]"
                    aria-label="Download Official Road Safety Poster"
                  >
                    <Download className="h-4 w-4 text-cyan-300 shrink-0" />
                    <span>{isTe ? "అధికారిక పోస్టర్ (HD)" : "Official Poster (HD)"}</span>
                  </button>
                </div>
              </div>
            </div>
            <ParentsPledgeModal open={pledgeModalOpen} onOpenChange={setPledgeModalOpen} />
            <div className="relative flex-1 min-w-[280px] w-full">
              <div className="rs-roadstrap flex flex-col items-center gap-4 sm:gap-6 md:gap-8 p-3 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden" style={{ background: 'transparent' }}>
                {/* Video Background */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 1 }}
                >
                  <source src="/assets/herosection-photocontainer-background.mp4" type="video/mp4" />
                </video>

                {/* Semi-transparent overlay to make video visible but not too bright */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.3)', zIndex: 1 }}></div>
                
                <div className="grid w-full max-w-md grid-cols-2 gap-2.5 sm:gap-6" style={{ position: 'relative', zIndex: 10 }}>
                  {leadershipProfiles.map((leader, index) => {
                    const isMinister = (leader as any).isMinister;
                    return (
                      <div
                        key={leader.name}
                        className="flex flex-col items-center gap-2 sm:gap-4 rounded-2xl sm:rounded-3xl border border-white/70 bg-white/95 p-2.5 sm:p-6 text-emerald-900 backdrop-blur-lg shadow-[0_18px_38px_rgba(0,0,0,0.22)] text-center"
                      >
                        <div className="relative">
                          {isMinister && (
                            <button
                              onClick={() => setMinisterMessageModalOpen(true)}
                              className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md transition-colors whitespace-nowrap"
                              aria-label="View Minister Message"
                            >
                              Message
                            </button>
                          )}
                          <div className="relative h-20 w-20 sm:h-36 sm:w-36 md:h-40 md:w-40 overflow-hidden rounded-full border-2 sm:border-4 border-white shadow-[0_16px_28px_rgba(0,0,0,0.18)]">
                            <Image
                              src={leader.image}
                              alt={leader.alt}
                              width={320}
                              height={320}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="text-center space-y-0.5 sm:space-y-1 w-full">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wide text-emerald-600 font-semibold truncate">{leader.title}</p>
                          <p className="text-xs sm:text-lg font-bold text-emerald-900 leading-tight truncate">{leader.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-white relative z-10">
                  <p className="text-xs uppercase tracking-[0.35em] text-black font-bold flex items-center justify-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-blink"></span>
                    {tc("liveDashboard")}
                  </p>
                  <p className="text-sm font-bold text-black">{tc("updatedEveryHour")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rs-section rs-grid-bg">
        <div className="rs-container space-y-10">
          <div className="space-y-3 text-center">
            <span className="rs-chip">{tc("transportApprovedRegulations")}</span>
            <h2 className="text-3xl font-semibold text-emerald-900">{tc("roadSafetyRulesForEveryCitizen")}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {tc("telanganaMandatesStrictAdherence")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {rulesSections.map((rule) => (
              <div key={rule.title} className="rs-card p-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  {rule.icon}
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">{rule.title}</h3>
                <p className="text-sm text-slate-600">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="rs-chip">{tc("learnMore")}</span>
              <h2 className="text-3xl font-semibold text-emerald-900 mt-3">{tc("comprehensiveRoadSafetyResources")}</h2>
              <p className="text-slate-600 max-w-2xl">
                {tc("diveDeeperIntoInteractiveGuides")}
              </p>
            </div>
            <Link href="/events" className="rs-btn-secondary">
              <ArrowRight className="h-4 w-4" /> {tc("logARoadSafetyEvent")}
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            {featureCards.map((card) => (
              <Link key={card.title} href={card.href} className="rs-card block h-full p-8">
                <div className="flex items-center gap-6">
                  <div className={`${card.accent} inline-flex h-16 w-16 items-center justify-center rounded-xl flex-shrink-0`}>{card.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-emerald-900 mb-2">{card.title}</h3>
                    <p className="text-base text-slate-600" dangerouslySetInnerHTML={{ __html: card.description }} />
                  </div>
                  <ArrowRight className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="rs-chip">{tc("engagementHub")}</span>
              <h2 className="text-3xl font-semibold text-emerald-900 mt-3">{tc("playLearnEarnRoadSafetyPoints")}</h2>
            </div>
            <p className="text-slate-600 max-w-2xl">
              {tc("earnBadgesUnlockCertificates")}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {engagementHighlights.map((item) => (
              <div key={item.label} className="rs-card p-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">{item.label}</h3>
                <p className="text-sm text-slate-600 mb-5">{item.description}</p>
                <Link href={item.href} className="inline-flex items-center text-sm font-semibold text-emerald-700 gap-2">
                  {tc("goTo")} {item.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container grid gap-10 md:grid-cols-[1.4fr_1fr] items-center">
          <div className="space-y-5">
            <span className="rs-chip">{tc("ministersMessage")}</span>
            <h2 className="text-3xl font-semibold text-emerald-900">{tc("roadSafetyIsSharedPromise")}</h2>
            <p className="text-slate-700 text-lg">
              "{tc("roadSafetySharedResponsibilityQuote")}"
            </p>
            <p className="text-sm text-slate-600">{tc("honTransportBCWelfareMinister")}</p>
          </div>
          <div className="rs-card overflow-hidden p-0">
            <div className="flex flex-col items-center gap-4 p-6 bg-white">
              <div className="relative">
                <button
                  onClick={() => setMinisterMessageModalOpen(true)}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded-full shadow-md transition-colors"
                  aria-label="View Minister Message"
                >
                  Message
                </button>
                <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg">
                  <img
                    src="/assets/leadership/transport-minister-placeholder.svg"
                    alt={tc("transportMinisterAlt")}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-emerald-900">{tc("transportMinisterName")}</p>
                <p className="text-sm text-slate-600">{tc("honMinisterTransportBCWelfare")}</p>
              </div>
              <p className="text-sm text-slate-600 text-center">
                {tc("joinInstitutionsAcrossTelangana")}
              </p>
            </div>
          </div>
          <MinisterMessageModal open={ministerMessageModalOpen} onClose={() => setMinisterMessageModalOpen(false)} />
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-container grid gap-6 md:grid-cols-3">
          <div className="rs-card p-6">
            <h3 className="text-lg font-semibold text-emerald-900">{tc("studentFriendly")}</h3>
            <p className="text-sm text-slate-600">
              {tc("studentFriendlyDesc")}
            </p>
          </div>
          <div className="rs-card p-6">
            <h3 className="text-lg font-semibold text-emerald-900">{tc("governmentEndorsed")}</h3>
            <p className="text-sm text-slate-600">
              {tc("governmentEndorsedDesc")}
            </p>
          </div>
          <div className="rs-card p-6">
            <h3 className="text-lg font-semibold text-emerald-900">{tc("communityDriven")}</h3>
            <p className="text-sm text-slate-600">
              {tc("communityDrivenDesc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
