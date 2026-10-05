export type SimCategory = "bike" | "car" | "pedestrian" | "other";

export interface DraggableItem {
  id: string;
  sprite: string;
  startXY: [number, number];
  hitbox: [number, number, number, number]; // x, y, width, height
  label?: string;
}

export interface TargetZone {
  id: string;
  rect: [number, number, number, number]; // x, y, width, height
  accepts: string[]; // draggable ids
  label?: string;
}

export interface SimScene {
  id: string;
  category: SimCategory;
  title: string;
  prompt: string;
  background: string;
  overlays?: string[];
  draggables: DraggableItem[];
  targets: TargetZone[];
  timeoutHintSeconds?: number;
  timeLimitSeconds?: number;
  maxAttempts?: number;
  successText: string;
  wrongTips?: string[];
  hintTargetId?: string;
}

export interface SimResult {
  sceneId: string;
  success: boolean;
  attempts: number;
  seconds: number;
}






