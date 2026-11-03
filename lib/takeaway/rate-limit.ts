const WINDOW_MS = 10 * 60_000;
const MAX_ORDERS = 5;
const MAX_TRACKED = 10_000;

const attempts = new Map<string, number[]>();

function recent(key: string, now: number) {
  return (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
}

export function isRateLimited(key: string, now = Date.now()) {
  return recent(key, now).length >= MAX_ORDERS;
}

/**
 * In-memory, so the limit is per server instance and resets on restart. That is
 * enough to slow casual abuse; it is not a hard global quota.
 */
export function recordAttempt(key: string, now = Date.now()) {
  if (attempts.size >= MAX_TRACKED) attempts.clear();
  attempts.set(key, [...recent(key, now), now]);
}
