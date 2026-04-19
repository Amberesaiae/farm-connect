/**
 * Generates a short idempotency key for client-initiated mutations
 * (reservations, quote requests). Sent with the request so the server can
 * de-duplicate retries.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
