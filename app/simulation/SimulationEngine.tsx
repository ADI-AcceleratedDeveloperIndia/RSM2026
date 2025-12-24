"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SimScene, SimResult } from "./types";

interface SimulationEngineProps {
  scenes: SimScene[];
  onStart?: (sceneId: string) => void;
  onComplete?: (result: SimResult) => void;
  onAllDone?: () => void;
}

export default function SimulationEngine({
  scenes,
  onStart,
  onComplete,
  onAllDone,
}: SimulationEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [itemPositions, setItemPositions] = useState<Record<string, [number, number]>>({});
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout>();
  const timeLimitRef = useRef<NodeJS.Timeout>();
  const timerIntervalRef = useRef<NodeJS.Timeout>();
  const sceneStartTimeRef = useRef<number>(Date.now());

  const currentScene = scenes[currentIndex];

  // Initialize positions
  useEffect(() => {
    if (!currentScene) return;
    const positions: Record<string, [number, number]> = {};
    currentScene.draggables.forEach((item) => {
      positions[item.id] = item.startXY;
    });
    setItemPositions(positions);
    setAttempts(0);
    setShowHint(false);
    setShowSuccess(false);
    setShowWrong(false);
    setTimeLeft(currentScene.timeLimitSeconds || 45);
    setDraggedItem(null);
    const newStartTime = Date.now();
    sceneStartTimeRef.current = newStartTime;

    if (onStart) {
      onStart(currentScene.id);
    }

    // 10s inactivity hint
    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(true);
    }, (currentScene.timeoutHintSeconds || 10) * 1000);

    // Time limit
    timeLimitRef.current = setTimeout(() => {
      if (!showSuccess) {
        setShowHint(true);
        setTimeout(() => {
          handleNext();
        }, 1500);
      }
    }, (currentScene.timeLimitSeconds || 45) * 1000);

    // Timer interval
    const sceneStartTime = newStartTime;
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sceneStartTime) / 1000);
      const remaining = (currentScene.timeLimitSeconds || 45) - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        setTimeLeft(0);
      }
    }, 100);

    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      if (timeLimitRef.current) clearTimeout(timeLimitRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentScene?.id]);


  const checkCollision = useCallback(
    (itemId: string, x: number, y: number): string | null => {
      if (!currentScene) return null;
      const item = currentScene.draggables.find((d) => d.id === itemId);
      if (!item) return null;

      const [itemX, itemY, itemW, itemH] = item.hitbox;
      const absX = x - itemX;
      const absY = y - itemY;

      for (const target of currentScene.targets) {
        if (!target.accepts.includes(itemId)) continue;
        const [tX, tY, tW, tH] = target.rect;
        const tolerance = 20;

        if (
          absX >= tX - tolerance &&
          absX + itemW <= tX + tW + tolerance &&
          absY >= tY - tolerance &&
          absY + itemH <= tY + tH + tolerance
        ) {
          return target.id;
        }
      }
      return null;
    },
    [currentScene]
  );

  const handleDragStart = useCallback(
    (e: React.PointerEvent, itemId: string) => {
      e.preventDefault();
      setDraggedItem(itemId);
      const pos = itemPositions[itemId];
      if (pos) {
        const rect = e.currentTarget.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          setDragOffset([
            e.clientX - canvasRect.left - pos[0],
            e.clientY - canvasRect.top - pos[1],
          ]);
        }
      }
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    },
    [itemPositions]
  );

  const handleDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!draggedItem || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset[0];
      const y = e.clientY - rect.top - dragOffset[1];
      setItemPositions((prev) => ({ ...prev, [draggedItem]: [x, y] }));
    },
    [draggedItem, dragOffset]
  );

  const handleDragEnd = useCallback(
    (e: React.PointerEvent) => {
      if (!draggedItem || !currentScene) return;

      const pos = itemPositions[draggedItem];
      if (!pos) return;

      const item = currentScene.draggables.find((d) => d.id === draggedItem);
      if (!item) return;

      const [itemX, itemY, itemW, itemH] = item.hitbox;
      const absX = pos[0] + itemX;
      const absY = pos[1] + itemY;

      const targetId = checkCollision(draggedItem, absX, absY);

      if (targetId) {
        // Success!
        setShowSuccess(true);
        setShowHint(false);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        if (timeLimitRef.current) clearTimeout(timeLimitRef.current);

        const seconds = Math.floor((Date.now() - sceneStartTimeRef.current) / 1000);
        if (onComplete) {
          onComplete({
            sceneId: currentScene.id,
            success: true,
            attempts: attempts + 1,
            seconds,
          });
        }

        setTimeout(() => {
          handleNext();
        }, 1500);
      } else {
        // Wrong drop
        setShowWrong(true);
        setAttempts((prev) => prev + 1);
        const newAttempts = attempts + 1;

        // Shake animation
        const element = document.querySelector(`[data-item-id="${draggedItem}"]`);
        if (element) {
          element.classList.add("animate-shake");
          setTimeout(() => {
            element.classList.remove("animate-shake");
          }, 500);
        }

        // Reset position after wrong drop
        setTimeout(() => {
          setItemPositions((prev) => ({
            ...prev,
            [draggedItem]: currentScene.draggables.find((d) => d.id === draggedItem)!.startXY,
          }));
          setShowWrong(false);
        }, 1000);

        // After max attempts, show hint and auto-next
        if (newAttempts >= (currentScene.maxAttempts || 3)) {
          setShowHint(true);
          setTimeout(() => {
            const seconds = Math.floor((Date.now() - sceneStartTimeRef.current) / 1000);
            if (onComplete) {
              onComplete({
                sceneId: currentScene.id,
                success: false,
                attempts: newAttempts,
                seconds,
              });
            }
            handleNext();
          }, 2000);
        }
      }

      setDraggedItem(null);
    },
    [draggedItem, currentScene, itemPositions, checkCollision, attempts, onComplete]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < scenes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All done
      if (onAllDone) {
        onAllDone();
      }
    }
  }, [currentIndex, scenes.length, onAllDone]);

  if (!currentScene) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Great job! You finished the safety challenge.</h2>
          <button
            onClick={onAllDone}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
          >
            Generate Participation Certificate
          </button>
        </div>
      </div>
    );
  }

  const hintTarget = currentScene.targets.find((t) => t.id === currentScene.hintTargetId);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-green-800">{currentScene.title}</h2>
        <p className="text-gray-700 mt-1">{currentScene.prompt}</p>
        <p className="text-sm text-gray-500 mt-1">
          Scenario {currentIndex + 1} of {scenes.length} • Time: {timeLeft}s
        </p>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative border-2 border-gray-300 rounded-lg bg-gray-100"
        style={{ width: "100%", height: "500px", maxWidth: "640px", margin: "0 auto" }}
        onPointerMove={handleDrag}
        onPointerUp={handleDragEnd}
        onPointerLeave={handleDragEnd}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${currentScene.background})`,
            opacity: 0.3,
          }}
        />

        {/* Overlays */}
        {currentScene.overlays?.map((overlay, idx) => (
          <div
            key={idx}
            className="absolute bg-contain bg-no-repeat bg-center"
            style={{
              backgroundImage: `url(${overlay})`,
              width: "100%",
              height: "100%",
            }}
          />
        ))}

        {/* Target zones (invisible but for hint) */}
        {currentScene.targets.map((target) => (
          <div
            key={target.id}
            className="absolute border-2 border-dashed border-transparent"
            style={{
              left: `${(target.rect[0] / 640) * 100}%`,
              top: `${(target.rect[1] / 500) * 100}%`,
              width: `${(target.rect[2] / 640) * 100}%`,
              height: `${(target.rect[3] / 500) * 100}%`,
              borderColor: showHint && hintTarget?.id === target.id ? "#10b981" : "transparent",
              backgroundColor:
                showHint && hintTarget?.id === target.id ? "rgba(16, 185, 129, 0.2)" : "transparent",
            }}
          >
            {showHint && hintTarget?.id === target.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-green-600 font-bold text-sm bg-white px-3 py-1 rounded">
                  Place here →
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Draggable items */}
        {currentScene.draggables.map((item) => {
          const pos = itemPositions[item.id] || item.startXY;
          const isDragging = draggedItem === item.id;

          return (
            <div
              key={item.id}
              data-item-id={item.id}
              className="absolute cursor-move touch-none select-none"
              style={{
                left: `${(pos[0] / 640) * 100}%`,
                top: `${(pos[1] / 500) * 100}%`,
                width: `${(item.hitbox[2] / 640) * 100}%`,
                height: `${(item.hitbox[3] / 500) * 100}%`,
                zIndex: isDragging ? 50 : 10,
                opacity: isDragging ? 0.8 : 1,
                transform: isDragging ? "scale(1.1)" : "scale(1)",
                transition: isDragging ? "none" : "transform 0.2s",
              }}
              onPointerDown={(e) => handleDragStart(e, item.id)}
            >
              <div
                className="w-full h-full bg-contain bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url(${item.sprite})`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Messages */}
      {showSuccess && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded text-center">
          ✅ Well done! {currentScene.successText}
        </div>
      )}

      {showWrong && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-center animate-shake">
          ❌ Unsafe. Try again.
          {currentScene.wrongTips && currentScene.wrongTips[0] && (
            <div className="text-sm mt-1">{currentScene.wrongTips[0]}</div>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Attempts: {attempts} / {currentScene.maxAttempts || 3}
      </div>
    </div>
  );
}

