"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/schemas/signInSch";
import { Spinner } from "@/components/ui/spinner";

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInValues) => {
    setServerMessage(null);

    const response = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (response.error) {
      setServerMessage(response.error.message ?? "Unable to sign in");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="retro-panel w-full max-w-xl space-y-6 p-6 sm:p-8"
    >
      <div className="space-y-3">
        <span className="retro-badge">Sign In</span>
        <h1 className="text-3xl font-bold uppercase text-[#fff7d1] sm:text-4xl">
          Load your message board
        </h1>
        <p className="text-sm leading-7 text-[#d7cef8]">
          Verified operators can inspect incoming notes and toggle message intake.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm uppercase tracking-[0.16em] text-[#35d0ba]">
          Email
        </span>
        <input
          {...register("email")}
          type="email"
          className="retro-inset w-full px-4 py-3 outline-none"
          placeholder="pilot@terminal.net"
        />
        {errors.email ? <p className="text-sm text-[#ff8c42]">{errors.email.message}</p> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm uppercase tracking-[0.16em] text-[#35d0ba]">
          Password
        </span>
        <input
          {...register("password")}
          type="password"
          className="retro-inset w-full px-4 py-3 outline-none"
          placeholder="••••••••"
        />
        {errors.password ? <p className="text-sm text-[#ff8c42]">{errors.password.message}</p> : null}
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
        {isSubmitting ? "Authenticating" : "Enter Dashboard"}
      </button>

      <p className="text-sm leading-7 text-[#d7cef8]">
        Need a new handle?{" "}
        <Link href="/signup" className="font-bold uppercase text-[#ffe066] underline">
          Create Account
        </Link>
      </p>
    </form>
  );
}
