export interface InstitutionRecord {
  id?: string;
  institutionId: string;
  name: string;
  type: string;
  district: string;
  state?: string;
  address?: string;
  pincode?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  organizerIds?: string[];
  status: "active" | "inactive" | "verified";
  totalParticipants?: number;
  totalEvents?: number;
  totalActions?: number;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

declare global {
  var __institutionStore: Map<string, InstitutionRecord> | undefined;
}

const store: Map<string, InstitutionRecord> = global.__institutionStore || new Map();
if (!global.__institutionStore) {
  global.__institutionStore = store;
}

export function saveInstitutionInMemory(inst: InstitutionRecord) {
  if (inst.institutionId) store.set(inst.institutionId, inst);
  if (inst.id) store.set(inst.id, inst);

  if (store.size > 2000) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
}

export const saveInstitutionToMemory = saveInstitutionInMemory;

export function getInstitutionFromMemory(id: string): InstitutionRecord | undefined {
  if (!id) return undefined;
  return store.get(id);
}

export function listInstitutionsFromMemory(filter?: {
  district?: string;
  type?: string;
  status?: string;
  search?: string;
}): InstitutionRecord[] {
  let list = Array.from(store.values());

  // Deduplicate by institutionId
  const seen = new Set<string>();
  list = list.filter((item) => {
    if (seen.has(item.institutionId)) return false;
    seen.add(item.institutionId);
    return true;
  });

  if (filter?.district && filter.district !== "all") {
    list = list.filter((i) => i.district.toLowerCase() === filter.district!.toLowerCase());
  }
  if (filter?.type && filter.type !== "all") {
    list = list.filter((i) => i.type.toLowerCase() === filter.type!.toLowerCase());
  }
  if (filter?.status && filter.status !== "all") {
    list = list.filter((i) => i.status.toLowerCase() === filter.status!.toLowerCase());
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(s) ||
        i.institutionId.toLowerCase().includes(s) ||
        (i.contactPerson && i.contactPerson.toLowerCase().includes(s))
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
