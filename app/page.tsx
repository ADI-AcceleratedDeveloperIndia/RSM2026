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
} from "lucide-react";

export default function Home() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const leadershipProfiles = [
    {
      title: tc("honChiefMinister"),
      name: tc("chiefMinisterName"),
      image: "/assets/leadership/CM.png",
      alt: tc("chiefMinisterAlt"),
    },
    {
      title: tc("honTransportMinister"),
      name: tc("transportMinisterName"),
      image: "/assets/minister/Sri-Ponnam-Prabhakar.jpg",
      alt: tc("transportMinisterAlt"),
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
        <div className="rs-container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">
            <div className="flex-1 space-y-4 text-white">
              <span className="rs-chip" style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}>
                {tc("governmentOfTelangana")}
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                {tc("togetherForSaferRoads")}
              </h1>
              <p className="text-base md:text-lg text-white/80 max-w-xl">
                {tc("roadSafetySharedResponsibility")}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/quiz" className="rs-btn-secondary">
                  <ShieldCheck className="h-5 w-5" />
                  {tc("takeQuizChallenge")}
                </Link>
                <Link href="/simulation" className="rs-btn-primary">
                  <BrainCircuit className="h-5 w-5" />
                  {tc("launchSimulationLab")}
                </Link>
              </div>
            </div>
            <div className="relative flex-1 min-w-[280px]">
              <div className="rs-roadstrap flex flex-col items-center gap-8 p-8 md:p-10 relative overflow-hidden" style={{ background: 'transparent' }}>
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
                
                <div className="grid w-full max-w-md grid-cols-1 gap-6 sm:grid-cols-2" style={{ position: 'relative', zIndex: 10 }}>
                  {leadershipProfiles.map((leader) => (
                    <div
                      key={leader.name}
                      className="flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/95 p-6 text-emerald-900 backdrop-blur-lg shadow-[0_18px_38px_rgba(0,0,0,0.22)]"
                    >
                      <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-[0_16px_28px_rgba(0,0,0,0.18)]">
                        <Image
                          src={leader.image}
                          alt={leader.alt}
                          width={320}
                          height={320}
                          className="h-full w-full object-cover"
                          priority
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs uppercase tracking-wide text-emerald-500">{leader.title}</p>
                        <p className="text-lg font-semibold text-emerald-900">{leader.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-white relative z-10">
                  <p className="text-xs uppercase tracking-[0.35em] text-black font-bold">{tc("liveDashboard")}</p>
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
              <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg">
                <img
                  src="/assets/minister/Sri-Ponnam-Prabhakar.jpg"
                  alt={tc("transportMinisterAlt")}
                  className="h-full w-full object-cover"
                />
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
