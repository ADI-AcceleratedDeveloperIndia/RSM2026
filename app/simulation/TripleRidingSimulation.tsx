"use client";

import { useState, useRef, useCallback } from "react";
import DraggableItems from "./DraggableItems";

const BASE_DIMENSIONS = { width: 500, height: 500 };
const TARGET_HITBOX = {
  x: 200,
  y: 150,
  width: 200,
  height: 150,
};
const DISCIPLINE_SIZE = { width: 120, height: 100 };

export default function TripleRidingSimulation() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [disciplinePosition, setDisciplinePosition] = useState<[number, number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCorrectVideo, setShowCorrectVideo] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.PointerEvent, itemType: string) => {
    if (isCompleted) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggedItem(itemType);
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (canvasRect) {
      // Start from the cursor position relative to the entire container
      const startX = e.clientX - canvasRect.left;
      const startY = e.clientY - canvasRect.top;
      
      // Create position for any item type, but only discipline will work
      if (!disciplinePosition) {
        setDisciplinePosition([startX - DISCIPLINE_SIZE.width / 2, startY - DISCIPLINE_SIZE.height / 2]);
        setDragOffset([DISCIPLINE_SIZE.width / 2, DISCIPLINE_SIZE.height / 2]);
      } else if (disciplinePosition) {
        setDragOffset([
          e.clientX - canvasRect.left - disciplinePosition[0],
          e.clientY - canvasRect.top - disciplinePosition[1],
        ]);
      }
    }
  }, [disciplinePosition, isCompleted]);

  const handleDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!draggedItem || !canvasRef.current || isCompleted) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset[0];
      const y = e.clientY - rect.top - dragOffset[1];
      setDisciplinePosition([x, y]);
    },
    [draggedItem, dragOffset, isCompleted]
  );

  const handleDragEnd = useCallback(
    async (e: React.PointerEvent) => {
      if (!draggedItem || isCompleted) {
        setDraggedItem(null);
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Get current discipline position
      if (!disciplinePosition) {
        setDraggedItem(null);
        return;
      }

      const currentX = disciplinePosition[0];
      const currentY = disciplinePosition[1];

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) {
        setDraggedItem(null);
        return;
      }

      const scaleX = rect.width / BASE_DIMENSIONS.width;
      const scaleY = rect.height / BASE_DIMENSIONS.height;

      // Check if any part of discipline overlaps with target hitbox
      const disciplineLeft = currentX;
      const disciplineRight = currentX + DISCIPLINE_SIZE.width;
      const disciplineTop = currentY;
      const disciplineBottom = currentY + DISCIPLINE_SIZE.height;

      const targetLeft = TARGET_HITBOX.x * scaleX;
      const targetRight = (TARGET_HITBOX.x + TARGET_HITBOX.width) * scaleX;
      const targetTop = TARGET_HITBOX.y * scaleY;
      const targetBottom = (TARGET_HITBOX.y + TARGET_HITBOX.height) * scaleY;

      // AABB collision detection
      const overlaps = !(
        disciplineRight < targetLeft ||
        disciplineLeft > targetRight ||
        disciplineBottom < targetTop ||
        disciplineTop > targetBottom
      );

      // Only accept discipline item, not others
      if (overlaps && draggedItem === "discipline") {
        // Success! Show correct video (two people riding safely)
        setShowCorrectVideo(true);
        setShowSuccess(true);
        setIsCompleted(true);
        
        // Play the video after a small delay to ensure it's mounted
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.log("Video autoplay failed, user can click play:", err);
            });
          }
        }, 100);

        // Log completion
        try {
          const response = await fetch("/api/sim/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sceneId: "bike_triple_riding_prototype",
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
          // Non-blocking if logging fails
        }
      }

      setDraggedItem(null);
    },
    [draggedItem, disciplinePosition, isCompleted]
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Instructions - No title revealing the violation */}
      <div className="mb-6 text-center">
        <p className="text-gray-700">
          Drag the correct item from the sidebar onto the scene to fix the violation.
        </p>
      </div>

      {/* Main Container with Sidebar */}
      <div ref={containerRef} className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Left Sidebar - All Draggable Items */}
        <DraggableItems onDragStart={handleDragStart} isCompleted={isCompleted} correctItemType="discipline" />

        {/* Canvas Area */}
        <div className="flex-1 order-1 lg:order-none w-full">
          <div
            ref={canvasRef}
            className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden h-[360px] sm:h-[420px] lg:h-[500px]"
            style={{
              backgroundColor: "#ffffff",
            }}
            onPointerMove={handleDrag}
            onPointerUp={handleDragEnd}
            onPointerLeave={handleDragEnd}
          >
            {/* White background layer */}
            <div
              className="absolute inset-0 bg-white"
              style={{
                zIndex: 0,
              }}
            />

            {/* Background Scene - Triple riding image or correct video */}
            {!showCorrectVideo ? (
              <img
                src="/media/simulation%20media/triple%20riding/triple%20riding.png"
                alt="Triple riding violation"
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  opacity: 1,
                  zIndex: 1,
                  backgroundColor: "#ffffff",
                }}
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  opacity: 1,
                  zIndex: 1,
                  backgroundColor: "#ffffff",
                }}
                autoPlay
                loop
                muted
                playsInline
                controls
              >
                <source src="/media/simulation%20media/triple%20riding/two%20people.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Draggable Item - When being dragged */}
            {disciplinePosition && !isCompleted && draggedItem && (
              <div
                className="absolute cursor-move touch-none select-none"
                style={{
                  left: `${disciplinePosition[0]}px`,
                  top: `${disciplinePosition[1]}px`,
                  width: `${DISCIPLINE_SIZE.width}px`,
                  height: `${DISCIPLINE_SIZE.height}px`,
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
                  style={{
                    opacity: 1,
                  }}
                  draggable={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg text-center animate-fade-in space-y-2">
          <p className="text-lg font-bold">✅ Two is Company, Three's a Crowd! Ride Safely with a Pillion Only.</p>
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

