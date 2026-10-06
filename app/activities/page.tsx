"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Scale,
  Cpu,
  ShieldCheck,
  GraduationCap,
  ShieldHalf,
  Users,
  Heart,
  ArrowRight,
  Sparkles,
  Award,
  Target,
  AlertTriangle
} from "lucide-react";

export default function ActivitiesPage() {
  const { i18n } = useTranslation("common");
  const isTe = i18n.language === "te";

  const activities = [
    {
      id: "basics",
      href: "/basics",
      title: isTe ? "రోడ్ సురక్ష బేసిక్స్" : "Road Safety Basics",
      audience: isTe ? "అందరికీ" : "For Everyone",
      audienceColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: isTe
        ? "ట్రాఫిక్ సంకేతాలు, హెల్మెట్ నిబంధనలు, సీట్‌బెల్ట్ ప్రాముఖ్యత మరియు పాదచారుల హక్కులపై ప్రాథమిక అవగాహన."
        : "Foundational knowledge on traffic signals, mandatory helmet rules, seatbelt laws, and pedestrian priority.",
      icon: Scale,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-700",
      cta: isTe ? "బేసిక్స్ చూడండి" : "Explore Basics",
    },
    {
      id: "simulation",
      href: "/simulation",
      title: isTe ? "సిమ్యులేషన్ ల్యాబ్" : "Interactive Simulation Lab",
      audience: isTe ? "పాఠశాల విద్యార్థులు" : "School Students",
      audienceColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: isTe
        ? "గేమిఫైడ్ దృశ్యాలలో ట్రాఫిక్ ఉల్లంఘనలను గుర్తించి సరిదిద్దే ఇంటరాక్టివ్ లెర్నింగ్ ల్యాబ్."
        : "Gamified violation correction lab: identify hazards, correct illegal maneuvers, and learn defensive behaviors.",
      icon: Cpu,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-700",
      cta: isTe ? "ల్యాబ్ ప్రారంభించండి" : "Launch Simulation",
    },
    {
      id: "quiz",
      href: "/quiz",
      title: isTe ? "రోడ్ సురక్ష క్విజ్ ఛాలెంజ్" : "Road Safety Quiz Challenge",
      audience: isTe ? "ఇంటర్ & జూనియర్ కాలేజ్" : "Junior College & Inter",
      audienceColor: "bg-purple-100 text-purple-800 border-purple-200",
      description: isTe
        ? "15 ప్రశ్నల క్విజ్ పూర్తి చేసి ≥60% స్కోర్ సాధించి అధికారిక మెరిట్ సర్టిఫికేట్ పొందండి."
        : "Answer 15 curated questions. Score 60% or higher to unlock the official State Government Merit Certificate.",
      icon: ShieldCheck,
      color: "from-purple-500 to-indigo-600",
      textColor: "text-purple-700",
      cta: isTe ? "క్విజ్ రాయండి" : "Take Quiz Challenge",
    },
    {
      id: "guides",
      href: "/guides",
      title: isTe ? "సురక్షిత డ్రైవింగ్ గైడ్స్" : "Defensive Commuter Guides",
      audience: isTe ? "అండర్ గ్రాడ్యుయేట్స్" : "Undergraduates & Youth",
      audienceColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: isTe
        ? "ద్విచక్ర వాహనాల తనిఖీ, బ్లైండ్ స్పాట్స్ నివారణ, మరియు వర్షాకాల రక్షణ మార్గదర్శకాలు."
        : "Actionable pre-ride checklists, mirror alignment, blind spot elimination, and night commuting advice.",
      icon: GraduationCap,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-700",
      cta: isTe ? "గైడ్స్ చదవండి" : "Read Safety Guides",
    },
    {
      id: "prevention",
      href: "/prevention",
      title: isTe ? "ప్రమాద నివారణ వ్యూహాలు" : "Accident Prevention Protocols",
      audience: isTe ? "గ్రాడ్యుయేట్స్ & వయోజనులు" : "Graduates & Adults",
      audienceColor: "bg-rose-100 text-rose-800 border-rose-200",
      description: isTe
        ? "హై-స్పీడ్ డ్రైవింగ్ నివారణ, వాహన నిర్వహణ అలవాట్లు మరియు గోల్డెన్ అవర్ ఎమర్జెన్సీ స్పందన."
        : "Risk mitigation checklists, tire upkeep habits, anti-distraction rules, and Golden Hour emergency drills.",
      icon: ShieldHalf,
      color: "from-rose-500 to-red-600",
      textColor: "text-rose-700",
      cta: isTe ? "నివారణ అలవాట్లు నేర్చుకోండి" : "Explore Prevention",
    },
    {
      id: "club",
      href: "/club",
      title: isTe ? "రోడ్ సురక్ష క్లబ్" : "Road Safety Club Network",
      audience: isTe ? "పాఠశాలలు & సంస్థలు" : "Schools & Institutions",
      audienceColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      description: isTe
        ? "మీ విద్యా సంస్థలో రోడ్ సురక్ష క్లబ్‌ను నమోదు చేసి అధికారిక అవగాహన కార్యక్రమాలను నడిపించండి."
        : "Register your educational institution's official safety club and orchestrate student-led campaigns.",
      icon: Users,
      color: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-700",
      cta: isTe ? "క్లబ్‌లో చేరండి" : "Join Safety Club",
    },
    {
      id: "special",
      href: "/special",
      title: isTe ? "తల్లిదండ్రుల సురక్ష ప్రతిజ్ఞ" : "Parents & Family Safety Pledge",
      audience: isTe ? "కుటుంబాలు & పౌరులు" : "Families & Citizens",
      audienceColor: "bg-red-100 text-red-800 border-red-200",
      description: isTe
        ? "పిల్లల భద్రత కోసం ప్రత్యేక ప్రతిజ్ఞ స్వీకరించి, డౌన్‌లోడ్ చేయదగిన ప్రతిజ్ఞ పత్రాన్ని పొందండి."
        : "Take the solemn commitment for safe family commuting and download a customized personalized pledge card.",
      icon: Heart,
      color: "from-red-500 to-rose-600",
      textColor: "text-red-700",
      cta: isTe ? "ప్రతిజ్ఞ తీసుకోండి" : "Take Family Pledge",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>National Road Safety Month 2027</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            {isTe ? "రోడ్ సురక్ష కార్యక్రమాలు & లెర్నింగ్ హబ్" : "Road Safety Activities & Learning Hub"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            {isTe
              ? "అన్ని వయసుల పౌరులు, విద్యార్థులు మరియు విద్యాసంస్థల కోసం రూపొందించబడిన ఇంటరాక్టివ్ మోడ్యూల్స్, క్విజ్‌లు మరియు అవగాహన కార్యక్రమాలు."
              : "Explore interactive gamified simulations, knowledge challenges, defensive commuting guides, and civic pledges designed for all age groups."}
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-200 overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${act.audienceColor}`}>
                      {act.audience}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {act.title}
                    </h2>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <Link
                    href={act.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-1 transition-all"
                  >
                    <span>{act.cta}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Related Platforms Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
                Official Certification & Governance
              </span>
              <h2 className="text-2xl font-bold text-white">
                Completed an activity? Claim your official certificate.
              </h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Every quiz score ≥60%, simulation completion, and pledge generates a State Government verified reference ID eligible for instant certificate download.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/certificates"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg transition-colors"
              >
                <Award className="h-4 w-4" />
                <span>Certificates Hub</span>
              </Link>
              <Link
                href="/actions"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-xl border border-white/20 transition-colors"
              >
                <Target className="h-4 w-4" />
                <span>4E Action Tracker</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
