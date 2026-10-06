// Fixed Reference ID Format: 
// Online Statewide: STGV-RSM-2027-RTA-DTO-EVT-ON-00001 (STGV = State Government)
// Offline Statewide: STGV-RSM-2027-RTA-DTO-EVT-OF-00001
// Online Regional: KRMR-RSM-2027-RTA-DTO-EVT-ON-00001 (KRMR = District code)
// Offline Regional: KRMR-RSM-2027-RTA-DTO-EVT-OF-00001
// First 4 letters: STGV for statewide, District code for regional
// RSM = Road Safety Month
// 2027 = Year
// RTA = Regional Transport Authority
// DTO = District Transport Officer / RTA Head
// EVT-ON-00001 or EVT-OF-00001 = Event ID with participation context (5 digits, 00001 to 100000)
// ON = Online Event, OF = Offline Event

const STATEWIDE_CODE = "STGV"; // State Government
const PROGRAM_CODE = "RSM";
const YEAR = "2027";
const OFFICER_CODE_1 = "RTA"; // Regional Transport Authority
const OFFICER_CODE_2 = "DTO"; // District Transport Officer / RTA Head

// District name to code mapping
const DISTRICT_CODE_MAP: Record<string, string> = {
  "Adilabad": "ADLB",
  "Bhadradri Kothagudem": "BHDK",
  "Hyderabad": "HYDR",
  "Jagtial": "JAGT",
  "Jangaon": "JNGO",
  "Jayashankar Bhupalpally": "JSBP",
  "Jogulamba Gadwal": "JGLG",
  "Kamareddy": "KMRD",
  "Karimnagar": "KRMR",
  "Khammam": "KHMM",
  "Kumuram Bheem Asifabad": "KMBA",
  "Mahabubabad": "MHBB",
  "Mahabubnagar": "MHBN",
  "Mancherial": "MNCH",
  "Medak": "MEDK",
  "Medchal–Malkajgiri": "MDML",
  "Mulugu": "MLGU",
  "Nagarkurnool": "NGKN",
  "Nalgonda": "NLGD",
  "Narayanpet": "NRYP",
  "Nirmal": "NRML",
  "Nizamabad": "NZBD",
  "Peddapalli": "PDDL",
  "Rajanna Sircilla": "RJSR",
  "Ranga Reddy": "RNGR",
  "Sangareddy": "SNGR",
  "Siddipet": "SDDP",
  "Suryapet": "SRYP",
  "Vikarabad": "VKBD",
  "Wanaparthy": "WNPR",
  "Warangal": "WRGL",
  "Hanumakonda": "HNKD",
  "Yadadri Bhuvanagiri": "YDBG",
};

export function getDistrictCode(districtName: string): string {
  return DISTRICT_CODE_MAP[districtName] || "KRMR"; // Default to Karimnagar if not found
}

// Extract district code from event reference ID
export function getDistrictFromEventId(eventReferenceId: string): string | null {
  if (!eventReferenceId) return null;
  const prefix = eventReferenceId.split("-")[0];
  if (prefix === STATEWIDE_CODE) {
    return null; // TGSG = statewide, no district
  }
  // Check if prefix is a known district code
  const districtName = Object.keys(DISTRICT_CODE_MAP).find(
    (name) => DISTRICT_CODE_MAP[name] === prefix
  );
  return districtName || null;
}

// Check if event ID is statewide (TGSG prefix)
export function isStatewideEventId(eventReferenceId: string): boolean {
  if (!eventReferenceId) return false;
  const prefix = eventReferenceId.split("-")[0];
  return prefix === STATEWIDE_CODE;
}

export function generateEventId(
  eventNumber: number, 
  participationContext: "online" | "offline"
): string {
  if (eventNumber < 1 || eventNumber > 100000) {
    throw new Error("Event number must be between 1 and 100000");
  }
  const eventId = eventNumber.toString().padStart(5, "0");
  const contextCode = participationContext === "online" ? "ON" : "OF";
  return `EVT-${contextCode}-${eventId}`;
}

export function generateEventReferenceId(
  eventNumber: number, 
  eventType: "statewide" | "regional",
  districtName?: string,
  participationContext: "online" | "offline" = "offline" // Events are offline by default
): string {
  const eventId = generateEventId(eventNumber, participationContext);
  
  // Use TGSG for statewide, district code for regional
  const prefixCode = eventType === "statewide" 
    ? STATEWIDE_CODE 
    : (districtName ? getDistrictCode(districtName) : "KRMR"); // Default to Karimnagar if district not provided
  
  return `${prefixCode}-${PROGRAM_CODE}-${YEAR}-${OFFICER_CODE_1}-${OFFICER_CODE_2}-${eventId}`;
}

export function generateCertificateNumber(
  type: "MERIT" | "PARTICIPANT" | "ORGANIZER",
  certificateNumber?: number,
  eventType?: "statewide" | "regional" | null,
  eventReferenceId?: string | null, // Event Reference ID to extract district code and participation context
  districtName?: string | null, // District name (fallback)
  participationContext?: "online" | "offline" | null // Participation context: online or offline
): string {
  // If certificateNumber is provided, use it (for backward compatibility)
  // Otherwise, generate a random 5-digit number
  let certNum: string;
  if (certificateNumber !== undefined) {
    if (certificateNumber < 1 || certificateNumber > 100000) {
      throw new Error("Certificate number must be between 1 and 100000");
    }
    certNum = certificateNumber.toString().padStart(5, "0");
  } else {
    // Generate random 5-digit number (10000 to 99999)
    certNum = (10000 + Math.floor(Math.random() * 90000)).toString();
  }
  
  // Determine prefix code:
  // 1. If statewide event → TGSG
  // 2. If regional event → extract district code from event ID OR use district name
  // 3. Otherwise → default to KRMR
  let prefixCode = STATEWIDE_CODE; // Default to TGSG
  
  if (eventType === "statewide") {
    prefixCode = STATEWIDE_CODE;
  } else if (eventType === "regional") {
    // Try to extract district code from event reference ID first
    if (eventReferenceId) {
      const eventPrefix = eventReferenceId.split("-")[0];
      if (eventPrefix !== STATEWIDE_CODE) {
        // It's a district code (not TGSG)
        prefixCode = eventPrefix;
      } else {
        // Fallback to district name
        prefixCode = districtName ? getDistrictCode(districtName) : "KRMR";
      }
    } else if (districtName) {
      // Use district name to get code
      prefixCode = getDistrictCode(districtName);
    } else {
      // Default fallback
      prefixCode = "KRMR";
    }
  } else {
    // No event type (online without event) → default to KRMR
    prefixCode = "KRMR";
  }
  
  // Extract participation context from event ID if not provided
  let contextCode = "ON"; // Default to online
  if (participationContext) {
    contextCode = participationContext === "online" ? "ON" : "OF";
  } else if (eventReferenceId) {
    // Try to extract from event ID (EVT-ON- or EVT-OF-)
    const eventIdMatch = eventReferenceId.match(/EVT-(ON|OF)-/);
    if (eventIdMatch) {
      contextCode = eventIdMatch[1];
    }
  }
  
  return `${prefixCode}-${PROGRAM_CODE}-${YEAR}-${OFFICER_CODE_1}-${OFFICER_CODE_2}-${type}-${contextCode}-${certNum}`;
}

export function generateTemporaryOrganizerId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TEMP-ORG-${timestamp}-${random}`;
}

export function generateFinalOrganizerId(organizerNumber: number): string {
  if (organizerNumber < 1 || organizerNumber > 100000) {
    throw new Error("Organizer number must be between 1 and 100000");
  }
  const orgNum = organizerNumber.toString().padStart(5, "0");
  // Use default district code (KRMR) for organizers
  const DEFAULT_DISTRICT_CODE = "KRMR";
  return `${DEFAULT_DISTRICT_CODE}-${PROGRAM_CODE}-${YEAR}-${OFFICER_CODE_1}-${OFFICER_CODE_2}-ORGANIZER-${orgNum}`;
}

// Simple reference ID generator for activity completion tracking
export function generateReferenceId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateActionId(districtCode?: string, actionNumber?: number): string {
  const dCode = districtCode || "KRMR";
  const num = actionNumber !== undefined 
    ? actionNumber.toString().padStart(5, "0") 
    : (10000 + Math.floor(Math.random() * 90000)).toString();
  return `ACT-${dCode}-2027-${num}`;
}

export function generateHazardId(districtCode?: string, hazardNumber?: number): string {
  const dCode = districtCode || "KRMR";
  const num = hazardNumber !== undefined 
    ? hazardNumber.toString().padStart(5, "0") 
    : (10000 + Math.floor(Math.random() * 90000)).toString();
  return `HZD-${dCode}-2027-${num}`;
}

export function generateInstitutionId(districtCode?: string, instNumber?: number): string {
  const dCode = districtCode || "HYDR";
  const num = instNumber !== undefined 
    ? instNumber.toString().padStart(5, "0") 
    : (10000 + Math.floor(Math.random() * 90000)).toString();
  return `INST-${dCode}-${num}`;
}

export function generateInterventionId(districtCode?: string, interventionNumber?: number): string {
  const dCode = districtCode || "KRMR";
  const num = interventionNumber !== undefined 
    ? interventionNumber.toString().padStart(5, "0") 
    : (10000 + Math.floor(Math.random() * 90000)).toString();
  return `INT-${dCode}-2027-${num}`;
}

export function generateReportId(scope?: string, reportNumber?: number): string {
  const sc = (scope || "TG").toUpperCase().replace(/\s+/g, "");
  const num = reportNumber !== undefined 
    ? reportNumber.toString().padStart(4, "0") 
    : (1000 + Math.floor(Math.random() * 9000)).toString();
  return `RPT-${sc}-2027-${num}`;
}

