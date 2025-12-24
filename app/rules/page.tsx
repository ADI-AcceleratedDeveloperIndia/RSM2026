"use client";

import { ShieldCheck, TrafficCone, AlertTriangle, Footprints } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RulesPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");

  const RULE_SECTIONS = [
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

  return (
    <div className="rs-container py-12 md:py-16 space-y-10">
      <div className="space-y-3 text-center md:text-left">
        <span className="rs-chip">{tc("transportApprovedRegulations")}</span>
        <h1 className="text-3xl md:text-4xl font-semibold text-emerald-900">{tc("roadSafetyRulesForEveryCitizen")}</h1>
        <p className="text-slate-600 max-w-2xl">
          {tc("telanganaMandatesStrictAdherence")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {RULE_SECTIONS.map((rule, idx) => (
          <div key={idx} className="rs-card p-6">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              {rule.icon}
            </div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">{rule.title}</h3>
            <p className="text-sm text-slate-600">{rule.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}









