"use client";

import { useState, useRef, useCallback } from "react";
import DraggableItems from "./DraggableItems";
import { CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Hand, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripleRidingSimulationProps {
  onComplete?: () => void;
}

export default function TripleRidingSimulation({ onComplete }: TripleRidingSimulationProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [disciplinePosition, setDisciplinePosition] = useState<[number, number] | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCorrectVideo, setShowCorrectVideo] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const applyCorrection = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    setShowCorrectVideo(true);
    setShowSuccess(true);
    if (onComplete) onComplete();
    
    // Play video if available
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, 100);
  }, [isCompleted, onComplete]);

  // Touch/Mouse Drag handlers
  const handleDragStart = useCallback((e: React.PointerEvent, itemType: string) => {
    if (isCompleted || itemType !== "discipline") return;
    setSelectedTool(itemType);
    setDraggedItem(itemType);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      setDisciplinePosition([
        e.clientX - canvasRect.left - 40,
        e.clientY - canvasRect.top - 40,
      ]);
    }
  }, [isCompleted]);

  const handleDrag = useCallback((e: React.PointerEvent) => {
    if (!draggedItem || !canvasRef.current || isCompleted) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    setDisciplinePosition([
      e.clientX - rect.left - 40,
      e.clientY - rect.top - 40,
    ]);
  }, [draggedItem, isCompleted]);

  const handleDragEnd = useCallback(() => {
    if (!draggedItem || isCompleted) {
      setDraggedItem(null);
      return;
    }

    if (canvasRef.current && disciplinePosition) {
      const rect = canvasRef.current.getBoundingClientRect();
      const pctX = (disciplinePosition[0] / rect.width) * 100;
      const pctY = (disciplinePosition[1] / rect.height) * 100;

      // Hitbox: Middle seat / riders area (25% to 75% X, 15% to 65% Y)
      if (pctX >= 25 && pctX <= 80 && pctY >= 15 && pctY <= 70) {
        applyCorrection();
      }
    }
    setDraggedItem(null);
    setDisciplinePosition(null);
  }, [draggedItem, disciplinePosition, isCompleted, applyCorrection]);

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
          {/* Main Visual Media: Video or Static Image */}
          {showCorrectVideo ? (
            <video
              ref={videoRef}
              src="/media/simulation%20media/triple%20riding/correct.mp4"
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              loop
            />
          ) : (
            <img
              src="/media/simulation%20media/triple%20riding/triple%20riding.png"
              alt="Triple Riding Violation"
              className="w-full h-full object-cover transition-opacity duration-300"
              draggable={false}
            />
          )}

          {/* Interactive Tap-to-Fix Target Zone */}
          {!isCompleted && selectedTool === "discipline" && (
            <div
              onClick={applyCorrection}
              role="button"
              tabIndex={0}
              className="absolute top-[35%] left-[50%] -translate-x-1/2 w-32 h-32 rounded-full border-4 border-dashed border-emerald-400 bg-emerald-500/20 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer animate-pulse z-20 hover:scale-105 transition-transform"
            >
              <div className="bg-emerald-600 text-white rounded-full p-2.5 shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-black text-white bg-slate-900/80 px-2 py-0.5 rounded-full mt-1.5 shadow">
                Tap to Correct Overload
              </span>
            </div>
          )}

          {/* Draggable Discipline Floating Icon */}
          {draggedItem === "discipline" && disciplinePosition && (
            <div
              style={{
                left: `${disciplinePosition[0]}px`,
                top: `${disciplinePosition[1]}px`,
              }}
              className="absolute w-20 h-20 pointer-events-none z-30 transition-transform -translate-x-1/2 -translate-y-1/2"
            >
              <img
                src="/media/simulation%20media/triple%20riding/discipline.png"
                alt="Floating Discipline"
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
              {isCompleted ? "✓ Maximum 2 Riders Enforced" : "⚠️ Violation: Triple Riding"}
            </span>
          </div>
        </div>

        {/* Mobile Prompt / Direct Quick Fix Button */}
        {!isCompleted && selectedTool === "discipline" && (
          <div className="w-full max-w-md mt-3 flex items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in">
            <div className="text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <Hand className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Rider Discipline Selected! Tap scene to apply:</span>
            </div>
            <Button
              size="sm"
              onClick={applyCorrection}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shrink-0"
            >
              Enforce Discipline
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
                  Motorcycle Dynamics: Section 128, Motor Vehicles Act
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Carrying more than one pillion rider destabilizes motorcycle center of gravity, extends braking distance by <strong>65%</strong>, and is strictly prohibited by law.
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
        correctItemType="discipline"
      />
    </div>
  );
}
