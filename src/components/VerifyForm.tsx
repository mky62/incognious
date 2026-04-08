"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Spinner } from "@/components/ui/spinner";
import { verifySchema } from "@/schemas/verifySch";

type VerifyValues = z.infer<typeof verifySchema>;

type VerifyFormProps = {
  username: string;
};

export default function VerifyForm({ username }: VerifyFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      username,
      code: "",
    },
  });

  const onSubmit = async (values: VerifyValues) => {
    setServerMessage(null);

    const response = await fetch("/api/verifyCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setServerMessage(data.message ?? "Unable to verify account");
      return;
    }

    router.push("/signin");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="retro-panel w-full max-w-xl space-y-6 p-6 sm:p-8"
    >
      <div className="space-y-3">
        <span className="retro-badge">Verify Signal</span>
        <h1 className="text-3xl font-bold uppercase text-[#fff7d1] sm:text-4xl">
          Confirm @{username}
        </h1>
        <p className="text-sm leading-7 text-[#d7cef8]">
          Type the six-digit transmission code delivered to your mailbox.
        </p>
      </div>

      <input {...register("username")} type="hidden" />

      <label className="block space-y-2">
        <span className="text-sm uppercase tracking-[0.16em] text-[#35d0ba]">
          Verification code
        </span>
        <input
          {...register("code")}
          inputMode="numeric"
          maxLength={6}
          className="retro-inset w-full px-4 py-4 text-center text-3xl tracking-[0.45em] outline-none"
          placeholder="123456"
        />
        {errors.code ? <p className="text-sm text-[#ff8c42]">{errors.code.message}</p> : null}
      </label>

      {serverMessage ? (
        <p className="retro-inset border-[#ff8c42] bg-[#3b1732] px-4 py-3 text-sm text-[#fff7d1]">
          {serverMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="retro-button flex w-full items-center justify-center gap-2 px-4 py-4 text-sm font-bold"
      >
        {isSubmitting ? <Spinner className="size-4" /> : null}
        {isSubmitting ? "Checking Code" : "Verify Account"}
      </button>

      <p className="text-sm leading-7 text-[#d7cef8]">
        Already verified?{" "}
        <Link href="/signin" className="font-bold uppercase text-[#ffe066] underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
