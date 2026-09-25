type FlattenedZodError = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

function isFlattenedZodError(value: unknown): value is FlattenedZodError {
  return (
    typeof value === "object" &&
    value !== null &&
    ("formErrors" in value || "fieldErrors" in value)
  );
}

/**
 * API routes return either a plain string error or a zod `.flatten()`
 * result ({ formErrors, fieldErrors }). Passing the latter straight into
 * a toast crashes React ("Objects are not valid as a React child"), so
 * every client call site should go through this instead of reading
 * `body?.error` directly.
 */
export function extractErrorMessage(body: unknown, fallback: string): string {
  const error = (body as { error?: unknown } | null)?.error;

  if (typeof error === "string") return error;

  if (isFlattenedZodError(error)) {
    if (error.formErrors?.[0]) return error.formErrors[0];
    const firstFieldError = Object.values(error.fieldErrors ?? {}).find(
      (messages) => messages && messages.length > 0
    );
    if (firstFieldError?.[0]) return firstFieldError[0];
  }

  return fallback;
}
