export function sanitizeBaseUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  return value.split(" #")[0].trim();
}

export function getServerAuthBaseUrl() {
  return sanitizeBaseUrl(process.env.BETTER_AUTH_URL) ??  "https://incognious.vercel.app";
}
