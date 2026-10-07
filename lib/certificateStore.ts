export interface CertificateMemoryRecord {
  certificateId: string;
  certificateNumber?: number;
  type: "ORGANIZER" | "PARTICIPANT" | "MERIT";
  fullName: string;
  institution?: string;
  score: number;
  total: number;
  activityType: string;
  eventReferenceId?: string;
  eventTitle?: string;
  organizerReferenceId?: string;
  participationContext?: "online" | "offline";
  eventType?: "statewide" | "regional" | null;
  district?: string;
  userEmail?: string;
  createdAt: Date;
}

declare global {
  var __certificateStore: Map<string, CertificateMemoryRecord> | undefined;
}

const store: Map<string, CertificateMemoryRecord> = global.__certificateStore || new Map();
if (!global.__certificateStore) {
  global.__certificateStore = store;
}

export function saveCertificateInMemory(cert: CertificateMemoryRecord) {
  store.set(cert.certificateId, cert);
  // Cap at 2000 entries
  if (store.size > 2000) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
}

export function getCertificateFromMemory(id: string): CertificateMemoryRecord | undefined {
  return store.get(id);
}
