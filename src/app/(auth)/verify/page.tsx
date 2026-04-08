import VerifyForm from "@/components/VerifyForm";

type VerifyPageProps = {
  searchParams: Promise<{
    username?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const username = params.username ?? "";

  return (
    <main className="retro-shell flex min-h-screen items-center justify-center px-6 py-12">
      <VerifyForm username={username} />
    </main>
  );
}
