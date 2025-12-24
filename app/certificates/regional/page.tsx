"use client";

import Link from "next/link";
import Image from "next/image";
import { Award, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { REGIONAL_AUTHORITIES } from "@/lib/regional";

export default function RegionalCertificatesPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  // Only Karimnagar with Padala Rahul RTA
  const REGIONAL_SECTIONS = useMemo(() => {
    return Object.values(REGIONAL_AUTHORITIES);
  }, []);
  return (
    <div className="rs-container py-14 space-y-10">
      <div className="rs-card bg-gradient-to-br from-emerald-50 to-white p-8 md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <span className="rs-chip flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {t("regionalEvent")} {t("certificates")}
            </span>
            <h1 className="text-3xl font-semibold text-emerald-900">{tc("districtLevelCertificateAddons") || "District-Level Certificate Add-ons"}</h1>
            <p className="text-slate-600 max-w-3xl">
              {tc("recogniseDistrictLedEvents") || "Recognise district-led Road Safety Month events with certificates that highlight your Regional Transport Authority (RTA) leadership alongside the Hon'ble Chief Minister and Transport Minister. Select a regional profile below to pre-fill the certificate generator."}
            </p>
          </div>
          <Link href="/certificates/generate" className="rs-btn-secondary">
            <Award className="h-4 w-4" /> {tc("viewAllCertificateTypes") || "View all certificate types"}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {REGIONAL_SECTIONS.map((region) => (
          <div key={region.code} className="rs-card p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-emerald-100 shadow-[0_18px_38px_rgba(0,0,0,0.15)]">
                <Image
                  src={region.photo}
                  alt={region.officerName}
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <p className="text-xs uppercase tracking-wide text-emerald-600">{region.district}</p>
                <h2 className="text-2xl font-semibold text-emerald-900">{region.officerName}</h2>
                <p className="text-sm text-emerald-700">{region.officerTitle}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">{region.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/certificates/generate?rta=${region.code}&district=${encodeURIComponent(region.district)}`}
                className="rs-btn-primary"
              >
                <Sparkles className="h-4 w-4" /> {tc("generateRegionalCertificate") || "Generate Regional Certificate"}
              </Link>
              <Link
                href={`/certificates/preview?type=ORG&name=Regional%20Event&district=${encodeURIComponent(
                  region.district
                )}&date=${encodeURIComponent(today)}&ref=${encodeURIComponent(`REG-${region.code.toUpperCase()}`)}&rta=${region.code}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
              >
                {tc("quickPreview") || "Quick preview"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

