"use client";

import { useState, useRef, useCallback } from "react";
import DraggableItems from "./DraggableItems";
import { CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Hand, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverspeedSimulationProps {
  onComplete?: () => void;
}

export default function OverspeedSimulation({ onComplete }: OverspeedSimulationProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [speedometerPosition, setSpeedometerPosition] = useState<[number, number] | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageSrc, setImageSrc] = useState("/media/simulation%20media/overspeed/overspeed.png");

  const canvasRef = useRef<HTMLDivElement>(null);

  const applyCorrection = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    // Switch to safe image if available or update overlay
    setImageSrc("/media/simulation%20media/overspeed/safe.png");
    setShowSuccess(true);
    if (onComplete) onComplete();
  }, [isCompleted, onComplete]);

  // Touch/Mouse Drag handlers
  const handleDragStart = useCallback((e: React.PointerEvent, itemType: string) => {
    if (isCompleted || itemType !== "speedometer") return;
    setSelectedTool(itemType);
    setDraggedItem(itemType);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      setSpeedometerPosition([
        e.clientX - canvasRect.left - 40,
        e.clientY - canvasRect.top - 40,
      ]);
    }
  }, [isCompleted]);

  const handleDrag = useCallback((e: React.PointerEvent) => {
    if (!draggedItem || !canvasRef.current || isCompleted) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    setSpeedometerPosition([
      e.clientX - rect.left - 40,
      e.clientY - rect.top - 40,
    ]);
  }, [draggedItem, isCompleted]);

  const handleDragEnd = useCallback(() => {
    if (!draggedItem || isCompleted) {
      setDraggedItem(null);
      return;
    }

    if (canvasRef.current && speedometerPosition) {
      const rect = canvasRef.current.getBoundingClientRect();
      const pctX = (speedometerPosition[0] / rect.width) * 100;
      const pctY = (speedometerPosition[1] / rect.height) * 100;

      // Hitbox: Dashboard / Road area (20% to 80% X, 20% to 80% Y)
      if (pctX >= 20 && pctX <= 85 && pctY >= 20 && pctY <= 85) {
        applyCorrection();
      }
    }
    setDraggedItem(null);
    setSpeedometerPosition(null);
  }, [draggedItem, speedometerPosition, isCompleted, applyCorrection]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-4xl mx-auto">
      {/* Simulation Interactive Scene */}
      <div className="flex-1 w-full flex flex-col items-center">
        <div
          ref={canvasRef}
          onPointerMove={handleDrag}
          onPointerUp={handleDragEnd}
          className="w-full max-w-md aspect-square bg-slate-900 rounded-3xl overflow-hidden relative shadow-xl border-4 border-emerald-100 touch-none select-none"
        >
          {/* Main Visual Media: Static Image */}
          <img
            src={imageSrc}
            alt="Overspeeding Violation"
            className="w-full h-full object-cover transition-opacity duration-300"
            draggable={false}
            onError={() => {
              // Fallback to initial image if safe.png does not exist
              setImageSrc("/media/simulation%20media/overspeed/overspeed.png");
            }}
          />

          {/* Interactive Tap-to-Fix Target Zone */}
          {!isCompleted && selectedTool === "speedometer" && (
            <div
              onClick={applyCorrection}
              role="button"
              tabIndex={0}
              className="absolute top-[45%] left-[50%] -translate-x-1/2 w-32 h-32 rounded-full border-4 border-dashed border-emerald-400 bg-emerald-500/20 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer animate-pulse z-20 hover:scale-105 transition-transform"
            >
              <div className="bg-emerald-600 text-white rounded-full p-2.5 shadow-lg">
                <Gauge className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-black text-white bg-slate-900/80 px-2 py-0.5 rounded-full mt-1.5 shadow">
                Tap to Calibrate Speed
              </span>
            </div>
          )}

          {/* Draggable Speedometer Floating Icon */}
          {draggedItem === "speedometer" && speedometerPosition && (
            <div
              style={{
                left: `${speedometerPosition[0]}px`,
                top: `${speedometerPosition[1]}px`,
              }}
              className="absolute w-20 h-20 pointer-events-none z-30 transition-transform -translate-x-1/2 -translate-y-1/2"
            >
              <img
                src="/media/simulation%20media/overspeed/drag%20speedometer.png"
                alt="Speed Limiter"
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>
          )}

          {/* Scenario Status Tag */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                isCompleted
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-red-600 text-white border-red-500 animate-pulse"
              }`}
            >
              {isCompleted ? "✓ Safe Velocity Calibrated (40 km/h)" : "⚠️ Violation: Lethal Overspeeding (>80 km/h)"}
            </span>
          </div>
        </div>

        {/* Mobile Prompt / Direct Quick Fix Button */}
        {!isCompleted && selectedTool === "speedometer" && (
          <div className="w-full max-w-md mt-3 flex items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in">
            <div className="text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <Hand className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Speed Limiter Selected! Tap scene to calibrate:</span>
            </div>
            <Button
              size="sm"
              onClick={applyCorrection}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shrink-0"
            >
              Calibrate Speed
            </Button>
          </div>
        )}

        {/* Success Educational Takeaway Banner */}
        {showSuccess && (
          <div className="w-full max-w-md mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 shadow-md animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-emerald-950">
                  Kinetic Energy Law: Section 112, Motor Vehicles Act
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Every <strong>1 km/h decrease in speed</strong> leads to a <strong>4% to 5% decrease in fatal accidents</strong>. Respect speed limits in urban and school zones.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbox Panel */}
      <DraggableItems
        onDragStart={handleDragStart}
        onSelectItem={(type) => {
          setSelectedTool(type);
        }}
        selectedItem={selectedTool}
        isCompleted={isCompleted}
        correctItemType="speedometer"
      />
    </div>
  );
}
