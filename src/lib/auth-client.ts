"use client";

import { createAuthClient } from "better-auth/react";

import { sanitizeBaseUrl } from "@/lib/auth-config";

function getClientAuthBaseUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }

  const envBaseUrl =
    sanitizeBaseUrl(process.env.NEXT_PUBLIC_BETTER_AUTH_URL) ??
    "https://incognious.vercel.app";

  return `${envBaseUrl}/api/auth`;
}

export const authClient = createAuthClient({
  baseURL: getClientAuthBaseUrl(),
});
