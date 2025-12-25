// Fixed Reference ID Format: KRMR-RSM-2026-PDL-RHL-EVT-00001
// KRMR = Karimnagar (hardcoded)
// RSM = Road Safety Month (hardcoded)
// 2026 = Year (hardcoded)
// PDL = Officer code (Padala Rahul)
// RHL = Officer code (Rahul)
// EVT-00001 = Event ID (5 digits, 00001 to 100000)

const DISTRICT_CODE = "KRMR";
const PROGRAM_CODE = "RSM";
const YEAR = "2026";
const OFFICER_CODE_1 = "PDL"; // Padala
const OFFICER_CODE_2 = "RHL"; // Rahul

export function generateEventId(eventNumber: number): string {
  if (eventNumber < 1 || eventNumber > 100000) {
    throw new Error("Event number must be between 1 and 100000");
  }
  const eventId = eventNumber.toString().padStart(5, "0");
  return `EVT-${eventId}`;
}

export function generateEventReferenceId(eventNumber: number): string {
  const eventId = generateEventId(eventNumber);
  return `${DISTRICT_CODE}-${PROGRAM_CODE}-${YEAR}-${OFFICER_CODE_1}-${OFFICER_CODE_2}-${eventId}`;
}

export function generateCertificateNumber(
  type: "MERIT" | "PARTICIPANT" | "ORGANIZER",
  certificateNumber?: number
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
  return `${DISTRICT_CODE}-${PROGRAM_CODE}-${YEAR}-${OFFICER_CODE_1}-${OFFICER_CODE_2}-${type}-${certNum}`;
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
  return `${DISTRICT_CODE}-${PROGRAM_CODE}-${YEAR}-${OFFICER_CODE_1}-${OFFICER_CODE_2}-ORGANIZER-${orgNum}`;
}

// Simple reference ID generator for activity completion tracking
export function generateReferenceId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
