"use client";

import { useState, useEffect } from "react";
import { X, Monitor } from "lucide-react";

export default function MobileWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the warning was previously dismissed
    const isDismissed = localStorage.getItem("mobileWarningDismissed");
    
    // Check if device is mobile (screen width less than 1024px)
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsVisible(mobile && !isDismissed);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("mobileWarningDismissed", "true");
  };

  if (!isVisible || !isMobile) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-emerald-600 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-slide-up">
        <div className="relative p-6 md:p-8">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4 pr-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Monitor className="h-8 w-8 text-emerald-700" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-emerald-900">
                Desktop Experience Recommended
              </h3>
              <p className="text-sm text-slate-600 max-w-md">
                This site is optimized for desktop viewing. For the best experience with certificates, simulations, and interactive features, please access from a desktop or laptop computer.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="rs-btn-primary mt-2"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

