import Link from "next/link";
import { notFound } from "next/navigation";

import SendMessageForm from "@/components/SendMessageForm";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

type UserPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  await dbConnect();

  const user = await UserModel.findOne({ username })
    .select("username isAcceptingMessages")
    .lean();

  if (!user) {
    notFound();
  }

  return (
    <main className="retro-shell min-h-screen px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="retro-panel h-fit space-y-6 p-6 sm:p-8">
          <span className="retro-badge">Public Profile</span>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold uppercase text-[#fff7d1] sm:text-5xl">
              @{user.username}
            </h1>
            <p className="text-sm leading-8 text-[#d7cef8]">
              This terminal accepts anonymous message packets whenever the inbox switch is on.
            </p>
          </div>
          <div className="retro-inset px-4 py-4 text-sm uppercase tracking-[0.14em] text-[#35d0ba]">
            Channel status: {user.isAcceptingMessages ? "Open" : "Closed"}
          </div>
          <Link
            href="/signup"
            className="retro-button-secondary inline-flex px-5 py-4 text-sm font-bold"
          >
            Create Your Inbox
          </Link>
        </section>

        <SendMessageForm
          username={user.username}
          isAcceptingMessages={user.isAcceptingMessages}
        />
      </div>
    </main>
  );
}
