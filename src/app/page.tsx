import Link from "next/link";

export default function HomePage() {
  return (
    <main className="retro-shell min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-8">
        <section className="retro-panel relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <span className="retro-badge">Incognious</span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl leading-tight font-bold uppercase sm:text-6xl">
                Broadcast your handle. Receive honest anonymous messages.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#d7cef8] sm:text-lg">
                This is your public inbox, rebuilt like an arcade terminal. Claim
                a username, verify your mail, then let people drop questions and
                confessions into your message board.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="retro-button px-6 py-4 text-sm font-bold"
              >
                Create Inbox
              </Link>
              <Link
                href="/signin"
                className="retro-button-secondary px-6 py-4 text-sm font-bold"
              >
                Load Dashboard
              </Link>
            </div>

         
          </div>

          <div className="space-y-5">
            <div className="retro-inset p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#35d0ba]">
                Boot Sequence
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[#fff7d1]">
                <p>
                  01. Register on the sign up page.
                </p>
                <p>
                  02. Verify your email address.
                </p>
                <p>
                  03. Share your public page.
                </p>
                <p>
                  04. Flip your inbox on or off from the dashboard.
                </p>
              </div>
            </div>

            <div className="retro-inset bg-[#35d0ba] p-5 text-[#111827]">
              <p className="text-xs uppercase tracking-[0.22em]">Status Board</p>
              <p className="mt-3 text-2xl font-bold uppercase">Signals Open</p>
              <p className="mt-2 text-sm leading-7">
                Built for short messages, quick verification, and a public link
                you can actually share.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
