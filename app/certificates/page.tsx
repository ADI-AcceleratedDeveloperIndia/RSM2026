"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Award, Sparkles, ArrowRight } from "lucide-react";

interface CertificateInfo {
  code: string;
  title: string;
  purpose: string;
}

const getCertificateList = (tc: (key: string) => string): CertificateInfo[] => [
  { code: "ORG", title: tc("certificateOrgTitle"), purpose: tc("certificateOrgPurpose") },
  { code: "PAR", title: tc("certificateParTitle"), purpose: tc("certificateParPurpose") },
  { code: "QUIZ", title: tc("certificateQuizTitle"), purpose: tc("certificateQuizPurpose") },
  { code: "SIM", title: tc("certificateSimTitle"), purpose: tc("certificateSimPurpose") },
  { code: "VOL", title: tc("certificateVolTitle"), purpose: tc("certificateVolPurpose") },
  { code: "SCH", title: tc("certificateSchTitle"), purpose: tc("certificateSchPurpose") },
  { code: "COL", title: tc("certificateColTitle"), purpose: tc("certificateColPurpose") },
  { code: "TOPPER", title: tc("certificateTopperTitle"), purpose: tc("certificateTopperPurpose") },
];

export default function CertificatesPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");

  return (
    <div className="rs-container py-14 space-y-10">
      <div className="rs-card p-8 md:p-10 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <span className="rs-chip flex items-center gap-2">
              <Award className="h-4 w-4" /> {tc("certificatesHub")}
            </span>
            <h1 className="text-3xl font-semibold text-emerald-900">{t("certificates")}</h1>
            <p className="text-slate-600 max-w-2xl">
              {tc("certificatesDescription") || "Telangana Road Safety Month issues official certificates in eight categories. Each template carries the Telangana emblem, minister signature, dynamic personalisation, and a verification-ready reference ID."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/certificates/generate" className="rs-btn-primary">
              <Sparkles className="h-4 w-4" /> {t("generateCertificate")}
            </Link>
            <Link href="/certificates/regional" className="rs-btn-secondary">
              <ArrowRight className="h-4 w-4" /> {t("regionalEvent")} {t("certificates")}
            </Link>
          </div>
        </div>
      </div>

      <div className="rs-table-wrapper">
        <table className="rs-table text-sm min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left">{tc("code") || "Code"}</th>
              <th className="text-left">{tc("certificateTitle") || "Certificate Title"}</th>
              <th className="text-left">{tc("purposeEligibleRecipient") || "Purpose / Eligible Recipient"}</th>
            </tr>
          </thead>
          <tbody>
            {getCertificateList(tc).map((item) => (
              <tr key={item.code}>
                <td className="font-semibold text-emerald-700">{item.code}</td>
                <td className="font-medium text-emerald-900">{item.title}</td>
                <td className="text-slate-600">{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 sm:hidden">
        {tc("tipDragSideways") || "Tip: drag sideways to view the full certificate table."}
      </p>

      <div className="rs-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-900">{tc("needToVerifyCertificate") || "Need to verify a certificate?"}</h2>
          <p className="text-sm text-slate-600">{tc("useReferenceIdToVerify") || "Use the reference ID printed on the certificate to confirm its authenticity."}</p>
        </div>
        <Link href="/certificates/generate" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          {tc("generateOrVerifyNow") || "Generate or verify now"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}





