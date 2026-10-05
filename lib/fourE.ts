export type FourECategory = "education" | "engineering" | "enforcement" | "emergency";

export interface FourEInfo {
  id: FourECategory;
  label: string;
  description: string;
  icon: string;        // Lucide icon name
  color: string;       // Tailwind color
  examples: string[];
}

export const FOUR_E_CATEGORIES: FourEInfo[] = [
  {
    id: "education",
    label: "Education",
    description: "Awareness, training, curriculum, campaigns, workshops",
    icon: "GraduationCap",
    color: "blue",
    examples: ["Road safety workshop", "School awareness program", "Quiz competition", "Poster campaign", "Safety training"]
  },
  {
    id: "engineering",
    label: "Engineering",
    description: "Infrastructure, signals, signs, road design, barriers",
    icon: "Wrench",
    color: "amber",
    examples: ["Speed breaker installation", "Signal repair", "Sign board placement", "Road marking", "Footpath construction"]
  },
  {
    id: "enforcement",
    label: "Enforcement",
    description: "Compliance drives, helmet checks, drunk driving prevention",
    icon: "Shield",
    color: "red",
    examples: ["Helmet checking drive", "Drunk driving checkpoint", "Overspeeding detection", "Seatbelt compliance", "License verification"]
  },
  {
    id: "emergency",
    label: "Emergency Response",
    description: "First aid, ambulance access, trauma care, rescue preparedness",
    icon: "Siren",
    color: "emerald",
    examples: ["First aid training", "Emergency response drill", "Ambulance access improvement", "Trauma care setup", "Golden hour awareness"]
  }
];

export const FOUR_E_MAP: Record<FourECategory, FourEInfo> = FOUR_E_CATEGORIES.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<FourECategory, FourEInfo>);

export function getFourEByCategory(category: FourECategory): FourEInfo {
  return FOUR_E_MAP[category];
}

export function getFourEColor(category: FourECategory): string {
  return FOUR_E_MAP[category]?.color || "gray";
}
