"use client";

import { useState, useRef, useCallback } from "react";
import DraggableItems from "./DraggableItems";

const BASE_DIMENSIONS = { width: 500, height: 500 };
const TARGET_HITBOX = {
  x: 220,
  y: 180,
  width: 160,
  height: 140,
};
const MENTOR_SIZE = { width: 120, height: 120 };

export default function DrunkDriveSimulation() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [mentorPosition, setMentorPosition] = useState<[number, number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSoberVideo, setShowSoberVideo] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragStart = useCallback((e: React.PointerEvent, itemType: string) => {
    if (isCompleted) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggedItem(itemType);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const startX = e.clientX - canvasRect.left;
      const startY = e.clientY - canvasRect.top;

      // Create position for any item type, but only non-drunk will work
      if (!mentorPosition) {
        setMentorPosition([startX - MENTOR_SIZE.width / 2, startY - MENTOR_SIZE.height / 2]);
        setDragOffset([MENTOR_SIZE.width / 2, MENTOR_SIZE.height / 2]);
      } else if (mentorPosition) {
        setDragOffset([
          e.clientX - canvasRect.left - mentorPosition[0],
          e.clientY - canvasRect.top - mentorPosition[1],
        ]);
      }
    }
  }, [isCompleted, mentorPosition]);

  const handleDrag = useCallback((e: React.PointerEvent) => {
    if (!draggedItem || !canvasRef.current || isCompleted) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset[0];
    const y = e.clientY - rect.top - dragOffset[1];
    setMentorPosition([x, y]);
  }, [draggedItem, dragOffset, isCompleted]);

  const handleDragEnd = useCallback(async () => {
    if (!draggedItem || isCompleted) {
      setDraggedItem(null);
      return;
    }

    if (!mentorPosition) {
      setDraggedItem(null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      setDraggedItem(null);
      return;
    }

    const scaleX = rect.width / BASE_DIMENSIONS.width;
    const scaleY = rect.height / BASE_DIMENSIONS.height;

    const mentorLeft = mentorPosition[0];
    const mentorRight = mentorPosition[0] + MENTOR_SIZE.width;
    const mentorTop = mentorPosition[1];
    const mentorBottom = mentorPosition[1] + MENTOR_SIZE.height;

    const targetLeft = TARGET_HITBOX.x * scaleX;
    const targetRight = (TARGET_HITBOX.x + TARGET_HITBOX.width) * scaleX;
    const targetTop = TARGET_HITBOX.y * scaleY;
    const targetBottom = (TARGET_HITBOX.y + TARGET_HITBOX.height) * scaleY;

    const overlaps = !(mentorRight < targetLeft || mentorLeft > targetRight || mentorBottom < targetTop || mentorTop > targetBottom);

    // Only accept non-drunk item, not others
    if (overlaps && draggedItem === "non-drunk") {
      setShowSoberVideo(true);
      setShowSuccess(true);
      setIsCompleted(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            /* ignore autoplay failures */
          });
        }
      }, 120);

      try {
        const response = await fetch("/api/sim/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: "car_drunk_drive_prototype",
            success: true,
            attempts: 1,
            seconds: 0,
          }),
        });
        const payload = await response.json();
        if (payload?.referenceId) {
          setReferenceId(payload.referenceId);
        }
      } catch {
        // non-blocking logging failure
      }
    }

    setDraggedItem(null);
  }, [draggedItem, isCompleted, mentorPosition]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Instructions - No title revealing the violation */}
      <div className="mb-6 text-center">
        <p className="text-gray-700">
          Drag the correct item from the sidebar onto the scene to fix the violation.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1 order-1 lg:order-none w-full">
          <div
            ref={canvasRef}
            className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden h-[360px] sm:h-[420px] lg:h-[500px]"
            style={{ backgroundColor: "#ffffff" }}
            onPointerMove={handleDrag}
            onPointerUp={handleDragEnd}
            onPointerLeave={handleDragEnd}
          >
            <div className="absolute inset-0 bg-white" style={{ zIndex: 0 }} />

            {!showSoberVideo ? (
              <img
                src="/media/simulation%20media/drunkndrive/drunkanddrive.png"
                alt="Drunk driving scene"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 1, backgroundColor: "#ffffff" }}
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 1, backgroundColor: "#ffffff" }}
                autoPlay
                loop
                muted
                playsInline
                controls
              >
                <source src="/media/simulation%20media/drunkndrive/sober%20driving.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Draggable Item - When being dragged */}
            {mentorPosition && !isCompleted && draggedItem && (
              <div
                className="absolute cursor-move touch-none select-none"
                style={{
                  left: `${mentorPosition[0]}px`,
                  top: `${mentorPosition[1]}px`,
                  width: `${MENTOR_SIZE.width}px`,
                  height: `${MENTOR_SIZE.height}px`,
                  zIndex: 50,
                  opacity: 1,
                  transform: "scale(1.1)",
                  transition: "none",
                  pointerEvents: "none",
                }}
              >
                <img
                  src={
                    draggedItem === "helmet"
                      ? "/media/simulation%20media/helmet%20wearing/helmet.png"
                      : draggedItem === "discipline"
                      ? "/media/simulation%20media/triple%20riding/discipline.png"
                      : "/media/simulation%20media/drunkndrive/soberman.png"
                  }
                  alt={draggedItem}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - All Draggable Items */}
        <DraggableItems onDragStart={handleDragStart} isCompleted={isCompleted} correctItemType="non-drunk" />
      </div>

      {showSuccess && (
        <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg text-center space-y-2 animate-fade-in">
          <p className="text-lg font-bold">✅ Choose Sober Drives. Friends don&apos;t let friends drive drunk.</p>
          {referenceId && (
            <p className="text-sm text-green-900">
              Reference ID: <span className="font-semibold">{referenceId}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
