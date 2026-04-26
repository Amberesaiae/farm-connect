/**
 * Typed error envelope shared between server functions and the client.
 *
 * Server middleware throws `Response` objects with a JSON body shaped like
 * `AppError` so the UI can branch on `code` (sign-in, phone verify, etc.)
 * instead of parsing free-text messages.
 */

export type AppErrorCode =
  | "UNAUTHENTICATED"
  | "PHONE_VERIFICATION_REQUIRED"
  | "ID_VERIFICATION_REQUIRED"
  | "BUSINESS_LICENCE_REQUIRED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "INTERNAL";

export interface AppError {
  code: AppErrorCode;
  message: string;
  /** Hint to the UI: what the user needs to do to satisfy the gate. */
  requires?: "login" | "phone_verify" | "id_verify" | "business_licence";
  /** Seconds until the rate-limit window clears, when applicable. */
  retryAfterSec?: number;
}

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  UNAUTHENTICATED: 401,
  PHONE_VERIFICATION_REQUIRED: 403,
  ID_VERIFICATION_REQUIRED: 403,
  BUSINESS_LICENCE_REQUIRED: 403,
  FORBIDDEN: 403,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
  VALIDATION: 400,
  CONFLICT: 409,
  INTERNAL: 500,
};

/** Build a JSON Response carrying an AppError. Throw this from server middleware. */
export function appErrorResponse(err: AppError): Response {
  const status = STATUS_BY_CODE[err.code] ?? 500;
  return new Response(JSON.stringify({ error: err }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Try to extract an AppError from anything thrown by a server function call
 * (Response, fetch error, plain Error). Falls back to INTERNAL.
 */
export async function parseAppError(thrown: unknown): Promise<AppError> {
  if (thrown instanceof Response) {
    try {
      const body = (await thrown.clone().json()) as { error?: AppError };
      if (body?.error?.code) return body.error;
    } catch {
      /* fall through */
    }
    return {
      code: thrown.status === 401 ? "UNAUTHENTICATED" : "INTERNAL",
      message: thrown.statusText || "Request failed",
    };
  }
  if (thrown instanceof Error) {
    return { code: "INTERNAL", message: thrown.message };
  }
  return { code: "INTERNAL", message: "Unexpected error" };
}