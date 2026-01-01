// Simple in-memory cache for frequently accessed data
// For production with 100k+ users, use Redis or similar distributed cache

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL = 60 * 1000; // 1 minute default

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}










