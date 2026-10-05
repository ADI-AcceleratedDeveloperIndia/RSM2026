"use client";

import { useState } from "react";

interface DraggableItemsProps {
  onDragStart: (e: React.PointerEvent, itemType: string) => void;
  isCompleted: boolean;
  correctItemType: string;
}

export default function DraggableItems({ onDragStart, isCompleted, correctItemType }: DraggableItemsProps) {
  const [buzzingItem, setBuzzingItem] = useState<string | null>(null);

  const items = [
    {
      type: "helmet",
      image: "/media/simulation%20media/helmet%20wearing/helmet.png",
      label: "Helmet",
    },
    {
      type: "discipline",
      image: "/media/simulation%20media/triple%20riding/discipline.png",
      label: "Discipline",
    },
    {
      type: "non-drunk",
      image: "/media/simulation%20media/drunkndrive/soberman.png",
      label: "Non-Drunk Person",
    },
    {
      type: "speedometer",
      image: "/media/simulation%20media/overspeed/drag%20speedometer.png",
      label: "Speedometer",
    },
  ];

  const handleItemClick = (e: React.PointerEvent, itemType: string) => {
    if (isCompleted) return;

    if (itemType === correctItemType) {
      // Correct item - allow dragging
      onDragStart(e, itemType);
    } else {
      // Wrong item - show buzz animation
      e.preventDefault();
      e.stopPropagation();
      setBuzzingItem(itemType);
      setTimeout(() => setBuzzingItem(null), 500);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full lg:w-40 lg:flex-shrink-0 order-2 lg:order-none">
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-700 mb-3 text-center">Drag Items</p>
        <div className="space-y-3">
          {items.map((item) => {
            const isCorrectItem = item.type === correctItemType;
            const isBuzzing = buzzingItem === item.type;
            
            return (
              <div
                key={item.type}
                className={`select-none bg-white rounded-lg p-2 transition-all ${
                  isCompleted
                    ? "opacity-50 cursor-not-allowed border-2 border-gray-300"
                    : isCorrectItem
                    ? "cursor-move touch-none border-2 border-green-500 hover:shadow-lg"
                    : "cursor-pointer border-2 border-gray-300"
                } ${isBuzzing ? "animate-buzz border-red-500" : ""}`}
                onPointerDown={(e) => handleItemClick(e, item.type)}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-auto object-contain"
                  draggable={false}
                />
                <p className="text-xs text-center mt-1 font-medium text-gray-700">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

