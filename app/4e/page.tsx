"use client";

import Link from "next/link";
import { 
  Target, GraduationCap, Wrench, Shield, Siren, 
  ArrowRight, CheckCircle2, AlertTriangle, FileText,
  Users, Award, Cpu, Sparkles, MapPin, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FourEFrameworkPage() {
  const pillars = [
    {
      id: "education",
      label: "Education & Awareness",
      sublabel: "Target: School & College Students, Youth & Drivers",
      weightage: "25% Index Weight",
      icon: GraduationCap,
      color: "blue",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
      accentBg: "from-blue-500/10 via-blue-50 to-white",
      description: "Empowering every citizen with mandatory traffic rules knowledge, simulated hazard recognition, and defensive driving culture before they hit the road.",
      initiatives: [
        { title: "Traffic Rules Basics", desc: "Interactive fundamental road sign & priority laws", href: "/basics" },
        { title: "Gamified Simulation Lab", desc: "Hazard spotting: Helmet, Triple Riding, Speed & DUI", href: "/simulation" },
        { title: "State Road Safety Quiz", desc: "15-question certified knowledge evaluation", href: "/quiz" },
        { title: "Defensive Commuting Guides", desc: "Two-wheeler, heavy vehicle & pedestrian manuals", href: "/guides" },
      ],
      ctaText: "Launch Educational Activities",
      ctaHref: "/activities",
    },
    {
      id: "engineering",
      label: "Engineering & Infrastructure",
      sublabel: "Target: PWD, NHAI, Municipal Corporations & Smart Cities",
      weightage: "25% Index Weight",
      icon: Wrench,
      color: "amber",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      accentBg: "from-amber-500/10 via-amber-50 to-white",
      description: "Crowdsourced identification and physical rectification of road defects, blind spots, missing warning signages, faulty signals, and pedestrian hazards.",
      initiatives: [
        { title: "Citizen Hazard Crowdsourcing", desc: "Geotagged pothole, blind curve & signal defect reporting", href: "/hazards" },
        { title: "Blackspot Elimination", desc: "High-density accident zone rectification tracking", href: "/hazards" },
        { title: "Infrastructure Action Pledges", desc: "Institutional engineering improvements & street fixes", href: "/actions" },
        { title: "Safe School Zones", desc: "Speed breakers, zebra crossings & pedestrian barriers", href: "/institution" },
      ],
      ctaText: "Report a Road Hazard",
      ctaHref: "/hazards",
    },
    {
      id: "enforcement",
      label: "Enforcement & Compliance",
      sublabel: "Target: Traffic Police, Motor Vehicle Inspectors & DTOs",
      weightage: "25% Index Weight",
      icon: Shield,
      color: "rose",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
      accentBg: "from-rose-500/10 via-rose-50 to-white",
      description: "Zero-tolerance enforcement against top fatal violations: non-ISI helmets, seatbelt negligence, drunk driving, overspeeding, and wrong-side driving.",
      initiatives: [
        { title: "Special Enforcement Drives", desc: "Coordinated checking across state highways and junctions", href: "/events" },
        { title: "Helmet & Seatbelt Pledges", desc: "Mandatory compliance pledges for institutions & parents", href: "/special" },
        { title: "Electronic Challan & MVI Audits", desc: "Real-time compliance monitoring by district transport heads", href: "/gov/districts" },
        { title: "Commercial Fleet Inspections", desc: "Fitness and driver sobriety protocols", href: "/prevention" },
      ],
      ctaText: "View Enforcement Campaigns",
      ctaHref: "/events",
    },
    {
      id: "emergency",
      label: "Emergency Care & Golden Hour",
      sublabel: "Target: 108 Emergency Response, Trauma Centers & Good Samaritans",
      weightage: "25% Index Weight",
      icon: Siren,
      color: "emerald",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accentBg: "from-emerald-500/10 via-emerald-50 to-white",
      description: "Minimizing crash fatalities through rapid first-response, first-aid training, Good Samaritan legal protection awareness, and seamless 108 ambulance corridor integration.",
      initiatives: [
        { title: "Golden Hour First-Aid Training", desc: "Certified CPR, bleeding control & cervical immobilization", href: "/basics" },
        { title: "Good Samaritan Protection", desc: "Supreme Court legal immunity guidelines awareness", href: "/guides" },
        { title: "Ambulance Corridors", desc: "Green corridor management and rapid hospital dispatch", href: "/actions" },
        { title: "Community Emergency Volunteers", desc: "Highway first-responder certified networks", href: "/club" },
      ],
      ctaText: "Commit Emergency Action",
      ctaHref: "/actions",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="rs-container space-y-8 sm:space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Target className="h-4 w-4" />
            <span>MoRTH Scientific Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            The 4E Road Safety Framework
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            The national standard mandated by the <strong>Ministry of Road Transport & Highways (MoRTH)</strong> and the 
            <strong> Supreme Court Committee on Road Safety</strong>. Our state assesses and ranks every district across 
            these four interdependent pillars of survival.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/gov/4e">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs sm:text-sm h-10 px-5 shadow-sm">
                View Live State 4E Index
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/activities">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white rounded-full text-xs sm:text-sm h-10 px-5">
                Explore Citizen Activities
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Pillars Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card 
                key={pillar.id} 
                className={`overflow-hidden border border-slate-200 bg-gradient-to-br ${pillar.accentBg} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-slate-800" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 0{idx + 1}</div>
                        <CardTitle className="text-xl font-bold text-slate-900">{pillar.label}</CardTitle>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${pillar.badgeClass}`}>
                      {pillar.weightage}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-slate-500 font-medium pt-1">
                    {pillar.sublabel}
                  </CardDescription>
                  <p className="text-xs sm:text-sm text-slate-600 pt-3 leading-relaxed">
                    {pillar.description}
                  </p>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="space-y-2 border-t border-slate-200/60 pt-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Key Digital Initiatives:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pillar.initiatives.map((init, i) => (
                        <Link 
                          key={i} 
                          href={init.href}
                          className="group p-2.5 rounded-xl bg-white/80 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                            <span>{init.title}</span>
                            <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{init.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={pillar.ctaHref}>
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-10 rounded-xl">
                        {pillar.ctaText}
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why 4E Matters Callout Banner */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5" />
                Statewide District Ranking System
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                How Districts Are Scored & Ranked
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A district cannot score an <strong>A+ Grade</strong> simply by hosting rallies. The state algorithm balances 
                all four pillars: high student certification (Education) must be matched by verified pothole repairs (Engineering), 
                active helmet compliance drives (Enforcement), and certified Golden Hour volunteers (Emergency Care).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link href="/gov/districts" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-slate-300 text-slate-800 text-xs font-semibold h-11 px-5 rounded-xl">
                  Inspect District Rankings
                </Button>
              </Link>
              <Link href="/hazards" className="w-full sm:w-auto">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-11 px-5 rounded-xl shadow-sm">
                  Report a Local Hazard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
