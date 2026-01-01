"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MinisterMessageModalProps {
  open: boolean;
  onClose: () => void;
}

const VIDEOS = [
  "Helmet.mp4",
  "Seat belt.mp4",
  "Phone distraction.mp4",
  "Way to ambulance.mp4",
];

export default function MinisterMessageModal({ open, onClose }: MinisterMessageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset to first video when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
    }
  }, [open]);

  // Autoplay when video changes
  useEffect(() => {
    if (open && videoRef.current) {
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-lg overflow-hidden shadow-2xl max-w-4xl w-full mx-4"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Video Container */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            src={`/Message by Minister/${VIDEOS[currentIndex]}`}
            controls
            className="w-full h-full"
            playsInline
          />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          aria-label="Previous video"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          aria-label="Next video"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Video Indicator (optional - minimal) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {VIDEOS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

