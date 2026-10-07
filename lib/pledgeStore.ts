export interface PledgeRecord {
  id: string;
  childName: string;
  institutionName: string;
  parentName: string;
  district: string;
  createdAt: Date;
}

declare global {
  var __pledgeStore: Map<string, PledgeRecord> | undefined;
}

const store: Map<string, PledgeRecord> = global.__pledgeStore || new Map();
if (!global.__pledgeStore) {
  global.__pledgeStore = store;
}

export function savePledgeInMemory(pledge: PledgeRecord) {
  store.set(pledge.id, pledge);
  // Cap at 2000 entries
  if (store.size > 2000) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
}

export function getPledgeFromMemory(id: string): PledgeRecord | undefined {
  return store.get(id);
}
