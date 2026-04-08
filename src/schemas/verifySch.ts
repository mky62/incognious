import { z } from "zod";

import { usernameValidation } from "@/schemas/signUpSch";

export const verifySchema = z.object({
  username: usernameValidation,
  code: z.string().length(6, "Verification code must be exactly 6 characters long"),
});
