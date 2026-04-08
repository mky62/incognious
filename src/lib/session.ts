import { headers } from "next/headers";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

export async function getServerSession(req?: NextRequest) {
  return auth.api.getSession({
    headers: req ? req.headers : await headers(),
  });
}
