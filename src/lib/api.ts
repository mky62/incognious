import { z } from "zod";

import type { ApResp } from "@/types/ApResponse";

export function createApiResponse(
  body: ApResp,
  status = 200,
) {
  return Response.json(body, { status });
}

export function getValidationMessage(error: z.ZodError) {
  const flattened = z.flattenError(error);
  const formError = flattened.formErrors[0];

  if (formError) {
    return formError;
  }

  const firstFieldErrors = Object.values(flattened.fieldErrors).find(
    (fieldErrors): fieldErrors is string[] =>
      Array.isArray(fieldErrors) && fieldErrors.length > 0,
  );

  return firstFieldErrors?.[0] ?? "Invalid request data";
}
