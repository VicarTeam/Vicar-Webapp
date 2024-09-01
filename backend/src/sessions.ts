import {MemoryCache} from "memory-cache-node";

const memoryCache = new MemoryCache<string, string>(1, Number.MAX_SAFE_INTEGER);

export function createSession(userId: string): string {
  const sessionId = generateRandomSessionId();
  memoryCache.storeExpiringItem(sessionId, userId, 60 * 60 * 24);
  return sessionId;
}

export function destroySession(sessionId: string) {
  memoryCache.removeItem(sessionId);
}

export function getSession(sessionId: string): string|undefined {
  return memoryCache.retrieveItemValue(sessionId);
}

function generateRandomSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}