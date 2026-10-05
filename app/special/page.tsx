"use client";

import { useTranslation } from "react-i18next";
import { Heart, Volume2 } from "lucide-react";

export default function SpecialPage() {
  const { t, i18n } = useTranslation("common");

  // YouTube video IDs extracted from URLs
  const videos = [
    {
      id: "xm58Q_xL2xY",
      title: "Road Safety Awareness - Indian Sign Language Video 1",
    },
    {
      id: "p7605EM9VP4",
      title: "Road Safety Awareness - Indian Sign Language Video 2",
    },
  ];

  return (
    <div className="rs-container py-14">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-12 w-12 text-red-600" />
            <h1 className="text-4xl font-bold text-emerald-900">
              {i18n.language === "te" ? "స్పెషల్" : "Special Resources"}
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {i18n.language === "te"
              ? "వినికిడి మరియు మాటలో లోపం ఉన్న వ్యక్తుల కోసం రోడ్ సేఫ్టీ అవగాహన వీడియోలు"
              : "Road safety awareness videos in Indian Sign Language for hearing impaired and speech impaired persons"}
          </p>
        </div>

        {/* Information Card */}
        <div className="rs-card p-6 bg-gradient-to-br from-red-50 to-white border-2 border-red-200">
          <div className="flex items-start gap-4">
            <Volume2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-emerald-900">
                {i18n.language === "te"
                  ? "అందుబాటులో ఉన్న వీడియోలు"
                  : "Available Videos"}
              </h2>
              <p className="text-slate-600">
                {i18n.language === "te"
                  ? "ఈ వీడియోలు భారతీయ సైన్ లాంగ్వేజ్‌లో రోడ్ సేఫ్టీ గురించి అవగాహన కల్పిస్తాయి. వినికిడి మరియు మాటలో లోపం ఉన్న వ్యక్తులు ఈ వీడియోల ద్వారా ట్రాఫిక్ నియమాలను నేర్చుకోవచ్చు."
                  : "These videos provide road safety awareness in Indian Sign Language. Hearing impaired and speech impaired persons can learn traffic rules through these videos."}
              </p>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <div key={video.id} className="rs-card p-4 space-y-4">
              <h3 className="text-lg font-semibold text-emerald-900">
                {i18n.language === "te"
                  ? `వీడియో ${index + 1}`
                  : `Video ${index + 1}`}
              </h3>
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-slate-600">{video.title}</p>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="rs-card p-6 bg-emerald-50 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">
            {i18n.language === "te"
              ? "ముఖ్యమైన సమాచారం"
              : "Important Information"}
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                {i18n.language === "te"
                  ? "ఈ వీడియోలు భారతీయ సైన్ లాంగ్వేజ్‌లో ఉన్నాయి"
                  : "These videos are in Indian Sign Language"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                {i18n.language === "te"
                  ? "వినికిడి మరియు మాటలో లోపం ఉన్న వ్యక్తుల కోసం రూపొందించబడ్డాయి"
                  : "Designed for hearing impaired and speech impaired persons"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                {i18n.language === "te"
                  ? "ట్రాఫిక్ నియమాలు మరియు రోడ్ సేఫ్టీ గురించి వివరంగా వివరిస్తాయి"
                  : "Provide detailed information about traffic rules and road safety"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                {i18n.language === "te"
                  ? "మరిన్ని వీడియోలు త్వరలో జోడించబడతాయి"
                  : "More videos will be added soon"}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}









