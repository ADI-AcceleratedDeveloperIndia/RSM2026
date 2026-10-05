"use client";

import { useState, useRef, useCallback } from "react";
import DraggableItems from "./DraggableItems";

const BASE_DIMENSIONS = { width: 500, height: 500 };
const SPEEDOMETER_HITBOX = {
  x: 200,
  y: 200,
  width: 200,
  height: 200,
};
const SPEEDOMETER_SIZE = { width: 120, height: 120 };

interface OverspeedSimulationProps {
  onComplete?: () => void;
}

export default function OverspeedSimulation({ onComplete }: OverspeedSimulationProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [speedometerPosition, setSpeedometerPosition] = useState<[number, number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageSrc, setImageSrc] = useState("/media/simulation%20media/overspeed/overspeed.png");
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
      const startX = e.clientX - canvasRect.left;
      const startY = e.clientY - canvasRect.top;
      
      if (!speedometerPosition) {
        setSpeedometerPosition([startX - SPEEDOMETER_SIZE.width / 2, startY - SPEEDOMETER_SIZE.height / 2]);
        setDragOffset([SPEEDOMETER_SIZE.width / 2, SPEEDOMETER_SIZE.height / 2]);
      } else if (speedometerPosition) {
        setDragOffset([
          e.clientX - canvasRect.left - speedometerPosition[0],
          e.clientY - canvasRect.top - speedometerPosition[1],
        ]);
      }
    }
  }, [speedometerPosition, isCompleted]);

  const handleDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!draggedItem || !canvasRef.current || isCompleted) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset[0];
      const y = e.clientY - rect.top - dragOffset[1];
      setSpeedometerPosition([x, y]);
    },
    [draggedItem, dragOffset, isCompleted]
  );

  const handleDragEnd = useCallback(
    async (e: React.PointerEvent) => {
      if (!draggedItem || isCompleted) {
        setDraggedItem(null);
        return;
      }

      if (!speedometerPosition) {
        setDraggedItem(null);
        return;
      }

      const currentX = speedometerPosition[0];
      const currentY = speedometerPosition[1];

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) {
        setDraggedItem(null);
        return;
      }

      const scaleX = rect.width / BASE_DIMENSIONS.width;
      const scaleY = rect.height / BASE_DIMENSIONS.height;

      const speedometerLeft = currentX;
      const speedometerRight = currentX + SPEEDOMETER_SIZE.width;
      const speedometerTop = currentY;
      const speedometerBottom = currentY + SPEEDOMETER_SIZE.height;

      const targetLeft = SPEEDOMETER_HITBOX.x * scaleX;
      const targetRight = (SPEEDOMETER_HITBOX.x + SPEEDOMETER_HITBOX.width) * scaleX;
      const targetTop = SPEEDOMETER_HITBOX.y * scaleY;
      const targetBottom = (SPEEDOMETER_HITBOX.y + SPEEDOMETER_HITBOX.height) * scaleY;

      const overlaps = !(
        speedometerRight < targetLeft ||
        speedometerLeft > targetRight ||
        speedometerBottom < targetTop ||
        speedometerTop > targetBottom
      );

      // Only accept speedometer item
      if (overlaps && draggedItem === "speedometer") {
        setImageSrc("/media/simulation%20media/overspeed/corrected%20speed.png?v=" + Date.now());
        setShowSuccess(true);
        setIsCompleted(true);
        
        try {
          const response = await fetch("/api/sim/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sceneId: "car_overspeed_prototype",
              success: true,
              attempts: 1,
              seconds: 0,
            }),
          });
          const payload = await response.json();
        } catch {
          // Ignore logging errors
        }
        
        if (onComplete) {
          onComplete();
        }
      }

      setDraggedItem(null);
    },
    [draggedItem, speedometerPosition, isCompleted, onComplete]
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <p className="text-gray-700">
          Drag the correct item from the sidebar onto the scene to fix the violation.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-4 items-stretch">
        <DraggableItems onDragStart={handleDragStart} isCompleted={isCompleted} correctItemType="speedometer" />

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
            <div
              className="absolute inset-0 bg-white"
              style={{
                zIndex: 0,
              }}
            />

            <img
              src={imageSrc}
              alt="Overspeed violation"
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                opacity: 1,
                zIndex: 1,
                backgroundColor: "#ffffff",
              }}
              draggable={false}
            />

            {speedometerPosition && !isCompleted && draggedItem && (
              <div
                className="absolute cursor-move touch-none select-none"
                style={{
                  left: `${speedometerPosition[0]}px`,
                  top: `${speedometerPosition[1]}px`,
                  width: `${SPEEDOMETER_SIZE.width}px`,
                  height: `${SPEEDOMETER_SIZE.height}px`,
                  zIndex: 50,
                  opacity: 1,
                  transform: "scale(1.1)",
                  transition: "none",
                  pointerEvents: "none",
                }}
              >
                <img
                  src="/media/simulation%20media/overspeed/drag%20speedometer.png"
                  alt="Speedometer"
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

      {showSuccess && (
        <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg text-center animate-fade-in">
          <p className="text-lg font-bold">✅ Speed Kills! Always maintain safe speed limits.</p>
        </div>
      )}
    </div>
  );
}


