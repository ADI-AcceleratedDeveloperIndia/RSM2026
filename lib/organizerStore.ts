export interface OrganizerRecord {
  id?: string;
  temporaryId: string;
  finalId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  designation: string;
  district?: string;
  districtCode?: string;
  status: "pending" | "approved" | "rejected";
  passwordHash?: string;
  createdAt: Date;
}

export interface InMemoryEventRecord {
  referenceId: string;
  title: string;
  date: string | Date;
  location: string;
  organizerId: string;
  organizerName: string;
  institution: string;
  approved: boolean;
  district?: string;
  eventType?: "statewide" | "regional";
  eventContext?: "online" | "offline";
  createdAt: string | Date;
  photos?: string[];
  groupPhoto?: string;
  youtubeVideos?: string[];
}

export interface InMemoryCertificateRecord {
  certificateId: string;
  type: string;
  fullName: string;
  institution?: string;
  score: number;
  total: number;
  activityType: string;
  eventReferenceId?: string;
  eventTitle?: string;
  organizerReferenceId?: string;
  participationContext?: string;
  eventType?: string;
  district?: string;
  userEmail?: string;
  createdAt: Date;
}

declare global {
  var __organizerStore: Map<string, OrganizerRecord> | undefined;
  var __organizerEventsStore: Map<string, InMemoryEventRecord> | undefined;
  var __certificatesStore: Map<string, InMemoryCertificateRecord> | undefined;
}

const orgStore: Map<string, OrganizerRecord> = global.__organizerStore || new Map();
if (!global.__organizerStore) {
  global.__organizerStore = orgStore;
}

const eventStore: Map<string, InMemoryEventRecord> = global.__organizerEventsStore || new Map();
if (!global.__organizerEventsStore) {
  global.__organizerEventsStore = eventStore;
}

const certStore: Map<string, InMemoryCertificateRecord> = global.__certificatesStore || new Map();
if (!global.__certificatesStore) {
  global.__certificatesStore = certStore;
}

export function saveOrganizerInMemory(org: OrganizerRecord) {
  if (org.temporaryId) orgStore.set(org.temporaryId, org);
  if (org.finalId) orgStore.set(org.finalId, org);
  if (org.email) orgStore.set(org.email.toLowerCase(), org);

  // Cap memory store
  if (orgStore.size > 2000) {
    const firstKey = orgStore.keys().next().value;
    if (firstKey) orgStore.delete(firstKey);
  }
}

export function getOrganizerFromMemory(identifier: string): OrganizerRecord | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim();
  return orgStore.get(clean) || orgStore.get(clean.toLowerCase());
}

export function saveEventInMemory(event: InMemoryEventRecord) {
  if (event.referenceId) {
    eventStore.set(event.referenceId, event);
  }
  if (eventStore.size > 2000) {
    const firstKey = eventStore.keys().next().value;
    if (firstKey) eventStore.delete(firstKey);
  }
}

export function getEventFromMemory(referenceId: string): InMemoryEventRecord | undefined {
  return eventStore.get(referenceId);
}

export function getEventsForOrganizerFromMemory(organizerId: string): InMemoryEventRecord[] {
  const result: InMemoryEventRecord[] = [];
  const cleanId = organizerId.trim();
  for (const evt of eventStore.values()) {
    if (evt.organizerId === cleanId) {
      result.push(evt);
    }
  }
  return result;
}

export function saveCertificateInMemory(cert: InMemoryCertificateRecord) {
  if (cert.certificateId) {
    certStore.set(cert.certificateId, cert);
  }
  if (certStore.size > 3000) {
    const firstKey = certStore.keys().next().value;
    if (firstKey) certStore.delete(firstKey);
  }
}

export function getCertificateFromMemory(certificateId: string): InMemoryCertificateRecord | undefined {
  if (!certificateId) return undefined;
  return certStore.get(certificateId.trim());
}

export function getCertificatesForEventFromMemory(eventReferenceId: string): InMemoryCertificateRecord[] {
  const result: InMemoryCertificateRecord[] = [];
  const cleanRef = eventReferenceId.trim();
  for (const c of certStore.values()) {
    if (c.eventReferenceId === cleanRef) {
      result.push(c);
    }
  }
  return result;
}
