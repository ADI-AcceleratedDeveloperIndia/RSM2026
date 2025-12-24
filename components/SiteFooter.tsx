"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Presentation } from "lucide-react";


export default function SiteFooter() {
  const { t, i18n } = useTranslation("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== "undefined") {
      localStorage.setItem("i18nextLng", lng);
    }
  };

  const quickLinks = [
    { href: "/road-safety", label: t("roadSafety") },
    { href: "/quiz", label: t("quiz") },
    { href: "/simulation", label: t("simulation") },
    { href: "/certificates", label: t("certificates") },
    { href: "/certificates/regional", label: t("regionalEvent") },
    { href: "/events", label: t("events") },
  ];

  return (
    <footer className="rs-footer-bg mt-20">
      <div className="rs-container py-12">
        <div className="grid gap-10 md:grid-cols-[320px_auto] items-start">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Image
                src="/assets/logo/Telangana-LOGO.png"
                alt={t("telanganaGovernmentLogo")}
                width={64}
                height={64}
                className="h-14 w-14 object-contain flex-shrink-0"
              />
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-widest text-emerald-200">{t("transportDepartment")}</p>
                <h2 className="text-xl font-semibold text-white">{t("appName")}</h2>
                <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
                  {t("empoweringCitizens")}
                </p>
              </div>
            </div>
            <div className="rs-pill-toggle" role="group" aria-label={t("toggleMenu")}>
              {mounted && (
                <>
                  <button 
                    data-active={i18n.language === "en"} 
                    onClick={() => toggleLanguage("en")}
                    aria-label="Switch to English"
                    aria-pressed={i18n.language === "en"}
                  >
                    EN
                  </button>
                  <button 
                    data-active={i18n.language === "te"} 
                    onClick={() => toggleLanguage("te")}
                    aria-label="Switch to Telugu"
                    aria-pressed={i18n.language === "te"}
                  >
                    TE
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <nav aria-label={t("quickLinks")}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-200 mb-4">
                {t("quickLinks")}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-900 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t("resources")}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-200 mb-4">{t("resources")}</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link 
                    href="/certificates/generate"
                    className="text-slate-300 hover:text-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-900 rounded"
                  >
                    {t("generateCertificateLink")}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/certificates/generate"
                    className="text-slate-300 hover:text-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-900 rounded"
                  >
                    {t("verifyCertificateLink")}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/events"
                    className="text-slate-300 hover:text-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-900 rounded"
                  >
                    {t("logEventLink")}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/simulation"
                    className="text-slate-300 hover:text-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-900 rounded"
                  >
                    {t("interactiveSimulations")}
                  </Link>
                </li>
              </ul>
            </nav>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-200 mb-4">{t("contact")}</h3>
              <address className="text-sm text-slate-300 not-italic space-y-2">
                <p>
                  {t("transportDepartment")}<br />
                  Hyderabad, Telangana
                </p>
                <p className="mt-3">
                  <a 
                    href="mailto:support@roadsafety.telangana.gov.in"
                    className="text-slate-300 hover:text-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-emerald-900 rounded"
                  >
                    support@roadsafety.telangana.gov.in
                  </a>
                </p>
              </address>
              <div className="mt-6 space-y-2 text-xs text-slate-400">
                <p>{t("allRightsReserved")}</p>
                <p>{t("designedForAccessibility")}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 rs-divider" aria-hidden="true" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="https://presentationslink.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="rs-btn-secondary text-sm gap-2 inline-flex items-center hover:bg-emerald-700 transition-colors"
            >
              <Presentation className="h-4 w-4" />
              {t("presentation") || "Presentation"}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <p className="font-medium">{t("driveSafe")}</p>
            <p>{t("transportDepartmentFooter")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

