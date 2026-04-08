"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Spinner } from "@/components/ui/spinner";
import { signUpSchema } from "@/schemas/signUpSch";

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const username = useWatch({
    control,
    name: "username",
  });

  useEffect(() => {
    if (!username || username.length < 3) {
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/uniqueUser?username=${encodeURIComponent(username)}`,
          { signal: controller.signal },
        );
        const contentType = response.headers.get("content-type") ?? "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : null;

        if (!response.ok) {
          setUsernameStatus(data?.message ?? "Unable to check username right now");
          return;
        }

        setUsernameStatus(data?.message ?? null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setUsernameStatus("Unable to check username right now");
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [username]);

  const visibleUsernameStatus =
    username && username.length >= 3 ? usernameStatus : null;

  const onSubmit = async (values: SignUpValues) => {
    setServerMessage(null);

    const response = await fetch("/api/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setServerMessage(data.message ?? "Unable to create account");
      return;
    }

    router.push(`/verify?username=${encodeURIComponent(values.username)}`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="retro-panel w-full max-w-2xl space-y-6 p-6 sm:p-8"
    >
      <div className="space-y-3">
        <span className="retro-badge">New Operator</span>
        <h1 className="text-3xl font-bold uppercase text-[#fff7d1] sm:text-4xl">
          Build your retro inbox
        </h1>
        <p className="text-sm leading-7 text-[#d7cef8]">
          Reserve a username, verify your mailbox, and open a public signal line.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm uppercase tracking-[0.16em] text-[#35d0ba]">
          Username
        </span>
        <input
          {...register("username")}
          className="retro-inset w-full px-4 py-3 outline-none"
          placeholder="retro_handle"
        />
        {errors.username ? (
          <p className="text-sm text-[#ff8c42]">{errors.username.message}</p>
        ) : visibleUsernameStatus ? (
          <p className="text-sm text-[#ffe066]">{visibleUsernameStatus}</p>
        ) : null}
      </label>

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
          placeholder="At least 6 characters"
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
        {isSubmitting ? "Creating Profile" : "Create Profile"}
      </button>

      <p className="text-sm leading-7 text-[#d7cef8]">
        Already registered?{" "}
        <Link href="/signin" className="font-bold uppercase text-[#ffe066] underline">
          Load Sign In
        </Link>
      </p>
    </form>
  );
}
