"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MinisterMessageModalProps {
  open: boolean;
  onClose: () => void;
}

// YouTube video IDs - Minister's message videos
const VIDEOS: string[] = [
  "c_WBXwg6138", // Helmet - https://youtu.be/c_WBXwg6138
  "-oIy3Ob2C0c", // Seat belt - https://youtu.be/-oIy3Ob2C0c
  "BUDbkQGp35M", // Phone distraction - https://youtu.be/BUDbkQGp35M
  "KCRQ5Oz2jtI", // Way to ambulance - https://youtu.be/KCRQ5Oz2jtI
];

// Helper to check if a video is YouTube
const isYouTubeVideo = (video: string): boolean => {
  if (!video) return false;
  return video.includes("youtube.com") || video.includes("youtu.be") || (!video.includes(".") && video.length > 0);
};

// Helper to get YouTube embed URL
const getYouTubeEmbedUrl = (videoIdOrUrl: string): string | null => {
  if (!videoIdOrUrl) return null;
  
  // If it's already a full URL, extract ID
  if (videoIdOrUrl.includes("youtube.com") || videoIdOrUrl.includes("youtu.be")) {
    const match = videoIdOrUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&controls=1`;
    }
    return videoIdOrUrl;
  }
  
  // If it's just a video ID (no dots, looks like an ID)
  if (!videoIdOrUrl.includes(".") && videoIdOrUrl.length > 5) {
    return `https://www.youtube.com/embed/${videoIdOrUrl}?autoplay=1&rel=0&modestbranding=1&controls=1`;
  }
  
  return null;
};

export default function MinisterMessageModal({ open, onClose }: MinisterMessageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset to first video when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
    }
  }, [open]);

  // Autoplay when video changes (only for local videos)
  useEffect(() => {
    const currentVideo = VIDEOS[currentIndex];
    if (open && videoRef.current && !isYouTubeVideo(currentVideo)) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay prevented:", err);
      });
    }
  }, [currentIndex, open]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? VIDEOS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === VIDEOS.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? VIDEOS.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === VIDEOS.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
        style={{ maxHeight: "95vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Mobile First: Larger touch target */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-20 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-full p-2 sm:p-2.5 md:p-2 transition-colors touch-manipulation"
          style={{ minWidth: "44px", minHeight: "44px" }}
          aria-label="Close"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Video Container - Mobile First: Full width, responsive height */}
        <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: "calc(95vh - 80px)" }}>
          {getYouTubeEmbedUrl(VIDEOS[currentIndex]) ? (
            <iframe
              key={currentIndex} // Force reload on video change
              src={getYouTubeEmbedUrl(VIDEOS[currentIndex]) || ""}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: "none" }}
              title={`Minister Message Video ${currentIndex + 1}`}
            />
          ) : (
            <video
              ref={videoRef}
              src={`/Message by Minister/${VIDEOS[currentIndex]}`}
              controls
              className="w-full h-full object-contain"
              playsInline
              style={{ maxHeight: "100%" }}
            />
          )}
        </div>

        {/* Navigation Arrows - Mobile First: Larger touch targets, positioned for mobile */}
        <button
          onClick={handlePrevious}
          className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-full p-2 sm:p-2.5 md:p-2 transition-colors touch-manipulation"
          style={{ minWidth: "44px", minHeight: "44px" }}
          aria-label="Previous video"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-full p-2 sm:p-2.5 md:p-2 transition-colors touch-manipulation"
          style={{ minWidth: "44px", minHeight: "44px" }}
          aria-label="Next video"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        </button>

        {/* Video Indicator - Mobile First: Larger dots for touch */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
          {VIDEOS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all touch-manipulation ${
                index === currentIndex 
                  ? "h-2.5 w-6 sm:h-3 sm:w-8 bg-white" 
                  : "h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white/50"
              }`}
              style={{ minWidth: "20px", minHeight: "20px" }}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

