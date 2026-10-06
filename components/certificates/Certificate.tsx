"use client";

import { forwardRef, useEffect, useState } from "react";
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
  eventReferenceId?: string | null; // Event reference ID to check TGSG prefix
  participationContext?: "online" | "offline" | null; // Participation context: online or offline
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
    subtitle: "Honouring outstanding leadership during National Road Safety Month 2027",
    body: "In recognition of exemplary efforts in planning, conducting, and promoting impactful road safety initiatives that created lasting awareness within the community.",
  },
  PAR: {
    title: "Participant Certificate",
    subtitle: "Acknowledging active participation in National Road Safety Month 2027",
    body: "Awarded for enthusiastic involvement in awareness drives, workshops, and activities that championed safer roads for all citizens.",
  },
  MERIT: {
    title: "Merit Certificate",
    subtitle: "Celebrating excellence in National Road Safety Month 2027 activities",
    body: "Presented for outstanding performance, demonstrating deep understanding of traffic regulations, safe driving behaviours, and citizen responsibilities.",
  },
  QUIZ: {
    title: "Quiz Merit Certificate",
    subtitle: "Celebrating excellence in the Road Safety Knowledge Quiz 2027",
    body: "Presented for outstanding performance in the Road Safety Quiz, demonstrating deep understanding of traffic regulations, safe driving behaviours, and citizen responsibilities.",
  },
  SIM: {
    title: "Simulation Completion Certificate",
    subtitle: "Recognising successful completion of interactive road safety simulations 2027",
    body: "Awarded for hands-on learning and demonstration of best practices in simulated traffic scenarios, reinforcing disciplined road usage.",
  },
  VOL: {
    title: "Volunteer Certificate",
    subtitle: "Honouring dedicated service during National Road Safety Month 2027",
    body: "Presented in appreciation of voluntary contributions, community outreach, and unwavering support in spreading road safety awareness.",
  },
  SCH: {
    title: "School Contributor Certificate",
    subtitle: "Recognising schools that championed Road Safety Month 2027 initiatives",
    body: "Awarded for organising road safety programmes, awareness sessions, and student-driven campaigns that fostered a culture of safety within the institution.",
  },
  COL: {
    title: "College Coordinator Certificate",
    subtitle: "Appreciating leadership in collegiate road safety initiatives 2027",
    body: "Presented to coordinators who mobilised student communities, led campaigns, and ensured the success of Road Safety Month engagements on campus.",
  },
  TOPPER: {
    title: "Topper Certificate",
    subtitle: "Celebrating top performance in Road Safety Month 2027 activities",
    body: "Awarded to top-performing individuals who excelled with outstanding scores, demonstrating exceptional mastery and understanding of road safety principles and best practices.",
  },
};

interface CertificateProps {
  data: CertificateData;
}

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ data }, ref) => {
  const config = CERTIFICATE_TYPES[data.certificateType] ?? CERTIFICATE_TYPES.ORG;
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Regional authority logic: 
  // - TGSG-* (statewide) should NEVER show regional person
  // - Only regional event IDs (district codes like KRMR-*) should show regional person
  // - Check event reference ID prefix to ensure TGSG never shows regional person
  const eventRefId = data.eventReferenceId || data.referenceId || "";
  const isStatewideEvent = data.eventType === "statewide" || eventRefId.startsWith("STGV-") || eventRefId.startsWith("TGSG-");
  const isRegionalEvent = data.eventType === "regional" || (!isStatewideEvent && data.district);
  const showDistrictRTAHead = Boolean(isRegionalEvent);

  // District Road Transport Authority Head details
  const districtRTAHeadDetails = {
    photo: "/assets/leadership/district-rta-head-placeholder.svg",
    name: "District Road Transport Authority Head",
    title: data.district ? `Head of Transport & RTA, ${data.district}` : "District RTA Head",
  };

  // Preload images for better html2canvas compatibility
  useEffect(() => {
    const imageUrls = [
      "/assets/logo/state-government-emblem.svg",
      "/assets/leadership/chief-minister-placeholder.svg",
      "/assets/leadership/transport-minister-placeholder.svg",
      "/assets/leadership/district-rta-head-placeholder.svg",
    ];

    const loadPromises = imageUrls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
        img.src = url;
      });
    });

    Promise.all(loadPromises).then(() => {
      setImagesLoaded(true);
    });
  }, [showDistrictRTAHead]);

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
              <img
                src="/assets/logo/state-government-emblem.svg"
                alt="State Government Transport Department"
                width={85}
                height={85}
                className="h-20 w-20 object-contain flex-shrink-0"
                style={{ display: "block" }}
              />
            </div>

            <div className="flex items-center gap-3 text-center" style={{ flex: 1, justifyContent: "flex-end" }}>
              {[
                {
                  photo: "/assets/leadership/chief-minister-placeholder.svg",
                  name: "[Chief Minister]",
                  title: "Hon'ble Chief Minister",
                },
                {
                  photo: "/assets/leadership/transport-minister-placeholder.svg",
                  name: "[Minister for Transport]",
                  title: "Hon'ble Transport Minister",
                },
                showDistrictRTAHead && {
                  photo: districtRTAHeadDetails.photo,
                  name: districtRTAHeadDetails.name,
                  title: districtRTAHeadDetails.title,
                },
              ]
                .filter(Boolean)
                .map((leader, index) => {
                  const item = leader as { photo: string | null; name: string; title: string };
                  return (
                    <div key={`${item.name}-${index}`} className="flex flex-col items-center justify-start text-center" style={{ width: "160px", minHeight: "140px" }}>
                      <div
                        className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-green-600 bg-white"
                        style={{ boxShadow: "0 12px 30px rgba(0, 64, 32, 0.25)" }}
                      >
                        <img 
                          src={item.photo || "/assets/leadership/placeholder.svg"} 
                          alt={item.name} 
                          className="object-cover"
                          style={{ width: "100%", height: "100%", display: "block" }}
                        />
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
            {/* Dynamic subtitle based on participation context and event type */}
            <p className={`${inter.className} mt-3 text-base md:text-lg text-gray-700`}>
              {(() => {
                const participationContext = data.participationContext;
                const eventType = data.eventType;
                
                // Determine subtitle based on 5 scenarios:
                // 1. Online without event ID
                // 2. Online with statewide event ID
                // 3. Online with regional event ID
                // 4. Offline with statewide event ID
                // 5. Offline with regional event ID
                
                if (participationContext === "online" && !eventType) {
                  return "Online Event - Road Safety Month 2027";
                } else if (eventType === "statewide") {
                  return "Statewide Event - Road Safety Month 2027";
                } else if (eventType === "regional") {
                  return "Regional Event - Road Safety Month 2027";
                } else {
                  // Fallback to static subtitle from config
                  return config.subtitle;
                }
              })()}
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
              <div className="h-10 border-b border-gray-400 flex items-center justify-center px-4 mb-2">
                <span className="font-serif italic text-sm text-slate-800">[Authorised Digital Signature]</span>
              </div>
              <div className="mt-2 space-y-1 text-center">
                <p className={`${inter.className} font-semibold text-gray-800 text-sm`}>
                  [Minister for Transport]
                </p>
                <p className={`${inter.className} text-xs text-gray-600`}>
                  Transport Department, State Government
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
            Issued by the Transport Department, State Government
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = "Certificate";

export default Certificate;
