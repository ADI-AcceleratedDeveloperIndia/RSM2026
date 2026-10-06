"use client";

import { useState } from "react";
import { Check, Sparkles, AlertCircle, Hand } from "lucide-react";

interface DraggableItemsProps {
  onDragStart?: (e: React.PointerEvent, itemType: string) => void;
  onSelectItem?: (itemType: string) => void;
  selectedItem?: string | null;
  isCompleted: boolean;
  correctItemType: string;
}

export default function DraggableItems({
  onDragStart,
  onSelectItem,
  selectedItem,
  isCompleted,
  correctItemType,
}: DraggableItemsProps) {
  const [buzzingItem, setBuzzingItem] = useState<string | null>(null);

  const items = [
    {
      type: "helmet",
      image: "/media/simulation%20media/helmet%20wearing/helmet.png",
      label: "ISI Helmet",
      desc: "Mandatory Safety Gear",
    },
    {
      type: "discipline",
      image: "/media/simulation%20media/triple%20riding/discipline.png",
      label: "Rider Discipline",
      desc: "Max 2 on Two-Wheeler",
    },
    {
      type: "non-drunk",
      image: "/media/simulation%20media/drunkndrive/soberman.png",
      label: "Sober Driver / Cab",
      desc: "Zero Alcohol Driving",
    },
    {
      type: "speedometer",
      image: "/media/simulation%20media/overspeed/drag%20speedometer.png",
      label: "Speed Limiter",
      desc: "Safe Urban Velocity",
    },
  ];

  const handleItemInteraction = (e: React.PointerEvent, itemType: string) => {
    if (isCompleted) return;

    if (itemType === correctItemType) {
      // Trigger tap-to-select
      if (onSelectItem) {
        onSelectItem(itemType);
      }
      // Also trigger drag start if desktop
      if (onDragStart) {
        onDragStart(e, itemType);
      }
    } else {
      // Wrong item
      setBuzzingItem(itemType);
      setTimeout(() => setBuzzingItem(null), 600);
    }
  };

  return (
    <div className="w-full lg:w-48 lg:shrink-0 flex flex-col gap-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Hand className="h-3.5 w-3.5 text-emerald-600" />
            <span>Select Solution</span>
          </p>
          <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">Tap or Drag</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3 leading-tight">
          Choose the correct corrective tool to fix this violation:
        </p>

        {/* Responsive Grid: 2 columns on mobile, 1 column on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
          {items.map((item) => {
            const isCorrectItem = item.type === correctItemType;
            const isSelected = selectedItem === item.type;
            const isBuzzing = buzzingItem === item.type;

            return (
              <div
                key={item.type}
                role="button"
                tabIndex={0}
                onPointerDown={(e) => handleItemInteraction(e, item.type)}
                className={`select-none rounded-xl p-2.5 transition-all text-center relative touch-manipulation cursor-pointer flex flex-col items-center justify-between min-h-[92px] ${
                  isCompleted
                    ? "opacity-50 cursor-not-allowed bg-slate-50 border border-slate-200"
                    : isSelected
                    ? "bg-emerald-50 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-300 scale-[1.02]"
                    : isCorrectItem
                    ? "bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-sm"
                    : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                } ${isBuzzing ? "animate-buzz border-red-500 bg-red-50 text-red-700" : ""}`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}

                <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center mx-auto my-1">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-sm"
                    draggable={false}
                  />
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{item.label}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">{item.desc}</p>
                </div>

                {isBuzzing && (
                  <div className="absolute inset-x-0 bottom-1 text-[10px] font-bold text-red-600 bg-red-100 rounded py-0.5">
                    Incorrect Tool
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
