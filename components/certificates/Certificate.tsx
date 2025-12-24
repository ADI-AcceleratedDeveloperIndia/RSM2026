"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const PRIMARY_COLOR = "#166534";
const PRIMARY_DARK = "#14532d";
const TEXT_COLOR = "#1f2937";
const MUTED_TEXT = "#4b5563";
const ACCENT_BG = "#ecfdf5";
const BORDER_ACCENT = "#bbf7d0";
const HIGHLIGHT_COLOR = "#047857";

export type CertificateCode =
  | "ORG"
  | "PAR"
  | "QUIZ"
  | "SIM"
  | "VOL"
  | "SCH"
  | "COL"
  | "TOPPER";

export interface CertificateData {
  certificateType: CertificateCode;
  fullName: string;
  district: string;
  issueDate: string;
  email?: string;
  score?: string;
  details?: string;
  eventName?: string;
  referenceId?: string;
  language?: string; // "en" or "te"
  regionalAuthority?: {
    officerName: string;
    officerTitle: string;
    photo: string;
  };
}

// Certificate content will be loaded from translations

interface CertificateProps {
  data: CertificateData;
}

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ data }, ref) => {
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  
  // Use language from data or current i18n language
  const lang = data.language || i18n.language || "en";
  const isTelugu = lang === "te";
  
  // Get certificate content from translations
  const getCertificateConfig = () => {
    const typeMap: Record<CertificateCode, { titleKey: string; subtitleKey: string; bodyKey: string }> = {
      ORG: { titleKey: "certificateOrgTitle", subtitleKey: "certificateOrgSubtitle", bodyKey: "certificateOrgBody" },
      PAR: { titleKey: "certificateParTitle", subtitleKey: "certificateParSubtitle", bodyKey: "certificateParBody" },
      QUIZ: { titleKey: "certificateQuizTitle", subtitleKey: "certificateQuizSubtitle", bodyKey: "certificateQuizBody" },
      SIM: { titleKey: "certificateSimTitle", subtitleKey: "certificateSimSubtitle", bodyKey: "certificateSimBody" },
      VOL: { titleKey: "certificateVolTitle", subtitleKey: "certificateVolSubtitle", bodyKey: "certificateVolBody" },
      SCH: { titleKey: "certificateSchTitle", subtitleKey: "certificateSchSubtitle", bodyKey: "certificateSchBody" },
      COL: { titleKey: "certificateColTitle", subtitleKey: "certificateColSubtitle", bodyKey: "certificateColBody" },
      TOPPER: { titleKey: "certificateTopperTitle", subtitleKey: "certificateTopperSubtitle", bodyKey: "certificateTopperBody" },
    };
    
    const keys = typeMap[data.certificateType] || typeMap.ORG;
    
    return {
      title: tc(keys.titleKey) || "Certificate",
      subtitle: tc(keys.subtitleKey) || "",
      body: tc(keys.bodyKey) || "",
    };
  };
  
  const config = getCertificateConfig();

  return (
    <div
      ref={ref}
      className="certificate-export mx-auto w-full max-w-[1200px] bg-white"
      style={{
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.15)",
        border: `20px solid ${PRIMARY_COLOR}`,
        color: TEXT_COLOR,
        minHeight: "850px",
      }}
    >
      <div className="relative bg-white" style={{ minHeight: "810px" }}>
        {/* Solid background layer for export safety */}
        <div className="absolute inset-0 bg-white/95" />

        <div className="relative px-10 pt-12 pb-16 md:px-16 md:pt-16 md:pb-20" style={{ minHeight: "810px" }}>
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 border-b border-green-200 pb-6 md:flex-row">
            <div className="flex items-center justify-start gap-2" style={{ maxWidth: "380px" }}>
              <Image
                src="/assets/logo/Telangana-LOGO.png"
                alt="Government of Telangana"
                width={80}
                height={80}
                className="h-20 w-20 object-contain flex-shrink-0"
                unoptimized
              />
              <Image
                src="/assets/logo/roadsafetymonth2026logo.png"
                alt="Telangana Road Safety Month 2026"
                width={140}
                height={90}
                className="h-20 w-auto object-contain flex-shrink-0"
                unoptimized
              />
            </div>

            <div className="flex items-center gap-3 text-center" style={{ flex: 1, justifyContent: "flex-end" }}>
              {[
                {
                  photo: "/assets/leadership/CM.png",
                  name: isTelugu ? tc("chiefMinisterName") : "Sri Anumula Revanth Reddy Garu",
                  title: isTelugu ? tc("honChiefMinister") : "Hon'ble Chief Minister",
                },
                {
                  photo: "/assets/minister/Sri-Ponnam-Prabhakar.jpg",
                  name: isTelugu ? tc("transportMinisterName") : "Sri Ponnam Prabhakar Garu",
                  title: isTelugu ? tc("honMinisterTransportBCWelfare") : "Hon'ble Minister for Transport & BC Welfare",
                },
                data.regionalAuthority && {
                  photo: data.regionalAuthority.photo,
                  name: data.regionalAuthority.officerName, // Keep as-is (user-entered)
                  title: data.regionalAuthority.officerTitle, // Keep as-is (user-entered)
                },
              ]
                .filter(Boolean)
                .map((leader, index) => {
                  const item = leader as { photo: string; name: string; title: string };
                  return (
                    <div key={`${item.name}-${index}`} className="flex flex-col items-center justify-start text-center" style={{ width: "160px", minHeight: "140px" }}>
                      <div
                        className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-green-600"
                        style={{ boxShadow: "0 12px 30px rgba(0, 64, 32, 0.25)" }}
                      >
                        <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="80px" unoptimized />
                      </div>
                      <p className={`${inter.className} mt-2 text-xs font-semibold text-green-800`} style={{ lineHeight: "1.3", wordWrap: "break-word", maxWidth: "140px" }}>{item.name}</p>
                      <p className={`${inter.className} text-[10px] text-gray-600 mt-1`} style={{ lineHeight: "1.3", wordWrap: "break-word", maxWidth: "140px" }}>{item.title}</p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Title */}
          <div className="mt-10 text-center">
            <h1
              className={`${playfair.className} text-3xl md:text-4xl font-semibold text-green-900 uppercase tracking-wide`}
            >
              {config.title}
            </h1>
            <p className={`${inter.className} mt-3 text-base md:text-lg text-gray-700`}>
              {config.subtitle}
            </p>
          </div>

          {/* Recipient */}
          <div className="mt-10 text-center">
            <p className={`${inter.className} text-sm uppercase tracking-[0.3em] text-gray-500`}>
              {isTelugu ? "ప్రదానం చేయబడింది" : "Presented to"}
            </p>
            <p className={`${playfair.className} mt-4 text-3xl md:text-4xl font-semibold text-green-900`}>
              {data.fullName}
            </p>
            <p className={`${inter.className} mt-2 text-base text-gray-600`}>
              {data.district && (isTelugu ? `జిల్లా: ${data.district}` : `District: ${data.district}`)}
            </p>
          </div>

          {/* Body */}
          <div className="mt-8 text-center">
            <p className={`${inter.className} text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto`}>
              {config.body}
            </p>
            {data.details && (
              <p className={`${inter.className} mt-4 text-base text-gray-600 max-w-3xl mx-auto`}>
                {data.details}
              </p>
            )}
            {data.score && (
              <p className={`${inter.className} mt-4 text-base text-green-700 font-semibold`}>
                {isTelugu ? "సాధన:" : "Achievement:"} {data.score}
              </p>
            )}
            {data.eventName && (
              <p className={`${inter.className} mt-2 text-base text-gray-700 italic`}>
                {isTelugu ? "కార్యక్రమం / ప్రోగ్రామ్:" : "Event / Programme:"} {data.eventName}
              </p>
            )}
            {/* Note: eventName is kept as-is (English) per user requirement */}
          </div>

          {/* Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 items-end gap-6 text-center">
            <div className="space-y-4">
              {/* Deputy Transport Commissioner Signature - Left Side - Only for Regional Certificates */}
              {data.regionalAuthority && (
                <div className="flex flex-col items-center space-y-1 mb-4">
                  <Image
                    src="/assets/signatures/Official1.png"
                    alt="Deputy Transport Commissioner Signature"
                    width={120}
                    height={50}
                    className="h-10 w-auto object-contain mb-2"
                    unoptimized
                  />
                  <div className="space-y-1">
                    <p className={`${inter.className} font-semibold text-gray-800 text-sm`}>
                      {isTelugu ? "పి.పురుషోత్తం" : "P.Purushottham"}
                    </p>
                    <p className={`${inter.className} text-xs text-gray-600`}>
                      {isTelugu ? "డిప్యూటీ ట్రాన్స్పోర్ట్ కమిషనర్, కరీంనగర్" : "Deputy Transport Commissioner, Karimnagar"}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="border-b border-gray-300" />
                <p className={`${inter.className} text-sm text-gray-600`}>
                  {isTelugu ? "జారీ తేదీ" : "Date of Issue"}
                </p>
                <p className={`${inter.className} font-semibold text-gray-800`}>
                  {new Date(data.issueDate).toLocaleDateString(isTelugu ? "te-IN" : "en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <Image
                src="/assets/signatures/minister%20ponnam%20prabhakar%20sign.jpg"
                alt="Minister Signature"
                width={120}
                height={50}
                className="h-10 w-auto object-contain mb-2"
                unoptimized
              />
              <div className="mt-3 space-y-1">
                <p className={`${inter.className} font-semibold text-gray-800 text-sm`}>
                  {isTelugu ? tc("transportMinisterName") : "Sri Ponnam Prabhakar Garu"}
                </p>
                <p className={`${inter.className} text-xs text-gray-600`}>
                  {isTelugu ? tc("honMinisterTransportBCWelfare") : "Hon'ble Minister for Transport & BC Welfare"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Deputy Transport Commissioner Signature - Right Side - Only for Regional Certificates */}
              {data.regionalAuthority && (
                <div className="flex flex-col items-center space-y-1 mb-4">
                  <Image
                    src="/assets/signatures/Official2.png"
                    alt="Deputy Transport Commissioner Signature"
                    width={120}
                    height={50}
                    className="h-10 w-auto object-contain mb-2"
                    unoptimized
                  />
                  <div className="space-y-1">
                    <p className={`${inter.className} font-semibold text-gray-800 text-sm`}>
                      {isTelugu ? "పి.పురుషోత్తం" : "P.Purushottham"}
                    </p>
                    <p className={`${inter.className} text-xs text-gray-600`}>
                      {isTelugu ? "డిప్యూటీ ట్రాన్స్పోర్ట్ కమిషనర్, కరీంనగర్" : "Deputy Transport Commissioner, Karimnagar"}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="border-b border-gray-300" />
                <p className={`${inter.className} text-sm text-gray-600`}>
                  {isTelugu ? "రిఫరెన్స్ ID" : "Reference ID"}
                </p>
                <p className={`${inter.className} font-semibold text-gray-800`}>
                  {data.referenceId || (isTelugu ? "కేటాయించబడాలి" : "To be assigned")}
                </p>
              </div>
            </div>
          </div>

          <div className={`${inter.className} mt-8 text-center text-sm text-gray-600`}>
            {isTelugu 
              ? "తెలంగాణ ప్రభుత్వం, రవాణా శాఖ ద్వారా జారీ చేయబడింది"
              : "Issued by the Transport Department, Government of Telangana"}
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = "Certificate";

export default Certificate;



