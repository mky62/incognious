import { redirect } from "next/navigation";
import { headers } from "next/headers";

import DashboardClient from "@/components/DashboardClient";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="retro-shell min-h-screen">
      <DashboardClient
        username={session.user.name ?? "user"}
        email={session.user.email}
      />
    </main>
  );
}
