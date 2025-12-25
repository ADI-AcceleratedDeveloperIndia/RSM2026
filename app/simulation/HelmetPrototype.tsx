"use client";

import { useState, useRef, useCallback } from "react";
import DraggableItems from "./DraggableItems";

const BASE_DIMENSIONS = { width: 500, height: 500 };
const HEAD_HITBOX = {
  x: 250,
  y: 100,
  width: 120,
  height: 80,
};
const HELMET_SIZE = { width: 100, height: 80 };

interface HelmetPrototypeProps {
  onComplete?: () => void;
}

export default function HelmetPrototype({ onComplete }: HelmetPrototypeProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [helmetPosition, setHelmetPosition] = useState<[number, number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageSrc, setImageSrc] = useState("/media/simulation%20media/helmet%20wearing/without%20helmet.png");
  const [isCompleted, setIsCompleted] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.PointerEvent, itemType: string) => {
    if (isCompleted) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggedItem(itemType);
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (canvasRect) {
      // Start from the cursor position relative to the canvas
      const startX = e.clientX - canvasRect.left;
      const startY = e.clientY - canvasRect.top;
      
      // Create position for any item type, but only helmet will work
      if (!helmetPosition) {
        setHelmetPosition([startX - HELMET_SIZE.width / 2, startY - HELMET_SIZE.height / 2]);
        setDragOffset([HELMET_SIZE.width / 2, HELMET_SIZE.height / 2]);
      } else if (helmetPosition) {
        setDragOffset([
          e.clientX - canvasRect.left - helmetPosition[0],
          e.clientY - canvasRect.top - helmetPosition[1],
        ]);
      }
    }
  }, [helmetPosition, isCompleted]);

  const handleDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!draggedItem || !canvasRef.current || isCompleted) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset[0];
      const y = e.clientY - rect.top - dragOffset[1];
      setHelmetPosition([x, y]);
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

      // Get current helmet position
      if (!helmetPosition) {
        setDraggedItem(null);
        return;
      }

      const currentX = helmetPosition[0];
      const currentY = helmetPosition[1];

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) {
        setDraggedItem(null);
        return;
      }

      const scaleX = rect.width / BASE_DIMENSIONS.width;
      const scaleY = rect.height / BASE_DIMENSIONS.height;

      const helmetLeft = currentX;
      const helmetRight = currentX + HELMET_SIZE.width;
      const helmetTop = currentY;
      const helmetBottom = currentY + HELMET_SIZE.height;

      const headLeft = HEAD_HITBOX.x * scaleX;
      const headRight = (HEAD_HITBOX.x + HEAD_HITBOX.width) * scaleX;
      const headTop = HEAD_HITBOX.y * scaleY;
      const headBottom = (HEAD_HITBOX.y + HEAD_HITBOX.height) * scaleY;

      const overlaps = !(
        helmetRight < headLeft ||
        helmetLeft > headRight ||
        helmetBottom < headTop ||
        helmetTop > headBottom
      );

      // Only accept helmet item, not others
      if (overlaps && draggedItem === "helmet") {
        // Success! Replace image immediately with updated version
        setImageSrc("/media/simulation%20media/helmet%20wearing/with%20helmet.png?v=" + Date.now());
        setShowSuccess(true);
        setIsCompleted(true);
        
        // Log completion
        try {
          const response = await fetch("/api/sim/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sceneId: "bike_no_helmet_prototype",
              success: true,
              attempts: 1,
              seconds: 0,
            }),
          });
          const payload = await response.json();
        } catch {
          // Ignore logging errors so the learner experience is not interrupted
        }
        
        // Call onComplete callback
        if (onComplete) {
          onComplete();
        }
      }

      setDraggedItem(null);
    },
    [draggedItem, helmetPosition, isCompleted]
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
        <DraggableItems onDragStart={handleDragStart} isCompleted={isCompleted} correctItemType="helmet" />

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
            {/* White background layer - ensures no transparency shows */}
            <div
              className="absolute inset-0 bg-white"
              style={{
                zIndex: 0,
              }}
            />

            {/* Background Scene - Bike with rider */}
            <img
              src={imageSrc}
              alt="Bike rider"
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                opacity: 1,
                zIndex: 1,
                backgroundColor: "#ffffff",
              }}
              draggable={false}
            />

            {/* Draggable Item - When being dragged */}
            {helmetPosition && !isCompleted && draggedItem && (
              <div
                className="absolute cursor-move touch-none select-none"
                style={{
                  left: `${helmetPosition[0]}px`,
                  top: `${helmetPosition[1]}px`,
                  width: `${HELMET_SIZE.width}px`,
                  height: `${HELMET_SIZE.height}px`,
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
                      : draggedItem === "speedometer"
                      ? "/media/simulation%20media/overspeed/drag%20speedometer.png"
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
        <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg text-center animate-fade-in">
          <p className="text-lg font-bold">✅ Helmet Saves Lives! Always Wear One.</p>
        </div>
      )}
    </div>
  );
}
