"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import type { ApiMessage } from "@/types/ApResponse";

type DashboardClientProps = {
  username: string;
  email: string;
};

export default function DashboardClient({
  username,
  email,
}: DashboardClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [messagesResponse, acceptanceResponse] = await Promise.all([
          fetch("/api/getMessage", { credentials: "include" }),
          fetch("/api/acceptMessage", { credentials: "include" }),
        ]);

        const messagesData = await messagesResponse.json();
        const acceptanceData = await acceptanceResponse.json();

        if (!messagesResponse.ok || !acceptanceResponse.ok) {
          setStatusMessage(
            messagesData.message ?? acceptanceData.message ?? "Unable to load dashboard",
          );
          return;
        }

        setMessages(messagesData.messages ?? []);
        setIsAcceptingMessages(acceptanceData.isAcceptingMessages ?? true);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setStatusMessage("Unable to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const toggleAcceptingMessages = () => {
    const nextValue = !isAcceptingMessages;

    startTransition(async () => {
      setStatusMessage(null);

      const response = await fetch("/api/acceptMessage", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          acceptMessages: nextValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.message ?? "Unable to update preference");
        return;
      }

      setIsAcceptingMessages(data.isAcceptingMessages ?? nextValue);
      setStatusMessage(data.message ?? "Preference updated");
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      const response = await authClient.signOut();

      if (response.error) {
        setStatusMessage(response.error.message ?? "Unable to sign out");
        return;
      }

      router.push("/signin");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="retro-panel p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-4">
            <span className="retro-badge">Control Room</span>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold uppercase text-[#fff7d1]">
                @{username}
              </h1>
              <p className="text-sm leading-7 text-[#d7cef8]">{email}</p>
            </div>
            <div className="retro-inset inline-flex px-4 py-3 text-sm uppercase tracking-[0.14em] text-[#35d0ba]">
              Public link:
              <Link href={`/u/${username}`} className="ml-2 text-[#ffe066] underline">
                /u/{username}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={toggleAcceptingMessages}
              disabled={isPending}
              className="retro-button-secondary px-5 py-4 text-sm font-bold"
            >
              {isPending
                ? "Updating"
                : isAcceptingMessages
                  ? "Pause Messages"
                  : "Accept Messages"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isPending}
              className="retro-button px-5 py-4 text-sm font-bold"
            >
              Sign Out
            </button>
            <div className="retro-inset px-4 py-3 text-xs uppercase tracking-[0.16em] text-[#fff7d1]">
              Status: {isAcceptingMessages ? "Inbox online" : "Inbox offline"}
            </div>
          </div>
        </div>

        {statusMessage ? (
          <p className="retro-inset mt-5 border-[#35d0ba] bg-[#142f36] px-4 py-3 text-sm text-[#fff7d1]">
            {statusMessage}
          </p>
        ) : null}
      </section>

      <section className="retro-panel p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="retro-badge">Inbox</span>
            <h2 className="mt-3 text-3xl font-bold uppercase text-[#fff7d1]">
              Received signals
            </h2>
          </div>
          <p className="text-sm leading-7 text-[#d7cef8]">
            Every message arrives newest-first in this archive.
          </p>
        </div>

        {isLoading ? (
          <div className="retro-inset flex items-center gap-3 px-4 py-4 text-sm text-[#fff7d1]">
            <Spinner className="size-4" />
            Loading messages
          </div>
        ) : messages.length === 0 ? (
          <p className="retro-inset px-4 py-6 text-sm leading-7 text-[#d7cef8]">
            No messages yet. Share your public link and wait for the first transmission.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <article
                key={`${message.createdAt}-${index}`}
                className="retro-inset space-y-3 px-4 py-4"
              >
                <p className="whitespace-pre-wrap leading-7 text-[#fff7d1]">
                  {message.content}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-[#35d0ba]">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
