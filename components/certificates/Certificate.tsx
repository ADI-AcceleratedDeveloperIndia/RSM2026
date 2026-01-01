"use client";

import { forwardRef } from "react";
import Image from "next/image";
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
  | "MERIT"
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
  total?: string;
  institution?: string;
  activityType?: string;
  details?: string;
  eventName?: string;
  referenceId?: string;
  eventType?: "statewide" | "regional" | null; // Event type for regional certificate logic
  regionalAuthority?: {
    officerName: string;
    officerTitle: string;
    photo: string;
  };
}

const CERTIFICATE_TYPES: Record<
  CertificateCode,
  {
    title: string;
    subtitle: string;
    body: string;
  }
> = {
  ORG: {
    title: "Organiser Appreciation Certificate",
    subtitle: "Honouring outstanding leadership during Telangana Road Safety Month 2026",
    body: "In recognition of exemplary efforts in planning, conducting, and promoting impactful road safety initiatives that created lasting awareness within the community.",
  },
  PAR: {
    title: "Participant Certificate",
    subtitle: "Acknowledging active participation in Telangana Road Safety Month 2026",
    body: "Awarded for enthusiastic involvement in awareness drives, workshops, and activities that championed safer roads for all citizens of Telangana.",
  },
  MERIT: {
    title: "Merit Certificate",
    subtitle: "Celebrating excellence in Telangana Road Safety Month activities",
    body: "Presented for outstanding performance, demonstrating deep understanding of traffic regulations, safe driving behaviours, and citizen responsibilities.",
  },
  QUIZ: {
    title: "Quiz Merit Certificate",
    subtitle: "Celebrating excellence in the Telangana Road Safety Knowledge Quiz",
    body: "Presented for outstanding performance in the Road Safety Quiz, demonstrating deep understanding of traffic regulations, safe driving behaviours, and citizen responsibilities.",
  },
  SIM: {
    title: "Simulation Completion Certificate",
    subtitle: "Recognising successful completion of interactive road safety simulations",
    body: "Awarded for hands-on learning and demonstration of best practices in simulated traffic scenarios, reinforcing disciplined road usage.",
  },
  VOL: {
    title: "Volunteer Certificate",
    subtitle: "Honouring dedicated service during Telangana Road Safety Month 2026",
    body: "Presented in appreciation of voluntary contributions, community outreach, and unwavering support in spreading road safety awareness.",
  },
  SCH: {
    title: "School Contributor Certificate",
    subtitle: "Recognising schools that championed Road Safety Month initiatives",
    body: "Awarded for organising road safety programmes, awareness sessions, and student-driven campaigns that fostered a culture of safety within the institution.",
  },
  COL: {
    title: "College Coordinator Certificate",
    subtitle: "Appreciating leadership in collegiate road safety initiatives",
    body: "Presented to coordinators who mobilised student communities, led campaigns, and ensured the success of Road Safety Month engagements on campus.",
  },
  TOPPER: {
    title: "Topper Certificate",
    subtitle: "Celebrating top performance in Telangana Road Safety Month activities",
    body: "Awarded to top-performing individuals who excelled with outstanding scores, demonstrating exceptional mastery and understanding of road safety principles and best practices.",
  },
};

interface CertificateProps {
  data: CertificateData;
}

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ data }, ref) => {
  const config = CERTIFICATE_TYPES[data.certificateType] ?? CERTIFICATE_TYPES.ORG;

  // Regional authority logic: 
  // - TGSG-* (statewide) should NEVER show regional person
  // - Only regional event IDs (district codes like KRMR-*) should show regional person
  // - Check event reference ID prefix to ensure TGSG never shows regional person
  const eventRefId = data.eventReferenceId || data.referenceId || "";
  const isTGSGEvent = eventRefId.startsWith("TGSG-");
  const isRegionalEvent = data.eventType === "regional" && !isTGSGEvent; // Regional AND not TGSG
  const isStatewideEvent = data.eventType === "statewide" || isTGSGEvent; // Explicitly statewide OR TGSG prefix
  const isKarimnagar = data.district?.toLowerCase() === "karimnagar";
  
  // Only show regional person if it's a regional event (NOT statewide/TGSG)
  const showPadalaRahul = isRegionalEvent && !isStatewideEvent && isKarimnagar;
  const showPlaceholder = isRegionalEvent && !isStatewideEvent && !isKarimnagar;

  // Padala Rahul details (from padala-rahul-details.json)
  const padalaRahulDetails = {
    photo: "/assets/leadership/Karimnagarrtamemberpadalarahul.webp",
    name: "Sri Padala Rahul Garu",
    title: "Regional Transport Authority Member, Karimnagar",
  };

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
                  name: "Sri Anumula Revanth Reddy Garu",
                  title: "Hon'ble Chief Minister",
                },
                {
                  photo: "/assets/minister/Sri-Ponnam-Prabhakar.jpg",
                  name: "Sri Ponnam Prabhakar Garu",
                  title: "Hon'ble Minister for Transport & BC Welfare",
                },
                // Regional authority: Show Padala Rahul for Karimnagar, placeholder for other districts
                showPadalaRahul && {
                  photo: padalaRahulDetails.photo,
                  name: padalaRahulDetails.name,
                  title: padalaRahulDetails.title,
                },
                showPlaceholder && {
                  photo: null, // No photo for placeholder
                  name: "Regional Authority",
                  title: `${data.district} District`,
                },
              ]
                .filter(Boolean)
                .map((leader, index) => {
                  const item = leader as { photo: string | null; name: string; title: string };
                  return (
                    <div key={`${item.name}-${index}`} className="flex flex-col items-center justify-start text-center" style={{ width: "160px", minHeight: "140px" }}>
                      {item.photo ? (
                        <div
                          className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-green-600"
                          style={{ boxShadow: "0 12px 30px rgba(0, 64, 32, 0.25)" }}
                        >
                          <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="80px" unoptimized />
                        </div>
                      ) : (
                        <div
                          className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center"
                          style={{ boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)" }}
                        >
                          <span className="text-gray-400 text-xs">Photo</span>
                        </div>
                      )}
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
              Presented to
            </p>
            <p className={`${playfair.className} mt-4 text-3xl md:text-4xl font-semibold text-green-900`}>
              {data.fullName}
            </p>
            {data.institution && (
              <p className={`${inter.className} mt-2 text-base text-gray-700 font-medium`}>
                {data.institution}
              </p>
            )}
            <p className={`${inter.className} mt-2 text-base text-gray-600`}>
              {data.district && `District: ${data.district}`}
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
            {data.activityType && (
              <p className={`${inter.className} mt-4 text-base text-emerald-700 font-semibold`}>
                Activity: {data.activityType.charAt(0).toUpperCase() + data.activityType.slice(1)}
              </p>
            )}
            {data.score && data.total && (
              <p className={`${inter.className} mt-2 text-base text-green-700 font-semibold`}>
                Score: {data.score} / {data.total}
              </p>
            )}
            {data.score && !data.total && (
              <p className={`${inter.className} mt-2 text-base text-green-700 font-semibold`}>
                Achievement: {data.score}
              </p>
            )}
            {data.eventName && (
              <p className={`${inter.className} mt-2 text-base text-gray-700 italic`}>
                Event / Programme: {data.eventName}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 items-end gap-6 text-center">
            <div className="space-y-2">
              <div className="border-b border-gray-300" />
              <p className={`${inter.className} text-sm text-gray-600`}>Date of Issue</p>
              <p className={`${inter.className} font-semibold text-gray-800`}>
                {new Date(data.issueDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
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
                  Sri Ponnam Prabhakar Garu
                </p>
                <p className={`${inter.className} text-xs text-gray-600`}>
                  Hon&apos;ble Minister for Transport & BC Welfare
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="border-b border-gray-300" />
              <p className={`${inter.className} text-sm text-gray-600`}>Reference ID</p>
              <p className={`${inter.className} font-semibold text-gray-800`}>
                {data.referenceId || "To be assigned"}
              </p>
            </div>
          </div>

          <div className={`${inter.className} mt-8 text-center text-sm text-gray-600`}>
            Issued by the Transport Department, Government of Telangana
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = "Certificate";

export default Certificate;
