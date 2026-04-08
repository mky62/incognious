"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Spinner } from "@/components/ui/spinner";
import { messageSchema } from "@/schemas/messageSch";
import { usernameValidation } from "@/schemas/signUpSch";

const sendMessageSchema = z.object({
  username: usernameValidation,
  content: messageSchema.shape.content,
});

type SendMessageValues = z.infer<typeof sendMessageSchema>;

type SendMessageFormProps = {
  username: string;
  isAcceptingMessages: boolean;
};

export default function SendMessageForm({
  username,
  isAcceptingMessages,
}: SendMessageFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendMessageValues>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      username,
      content: "",
    },
  });

  const onSubmit = async (values: SendMessageValues) => {
    setServerMessage(null);

    const response = await fetch("/api/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    setServerMessage(data.message ?? "Unable to send message");

    if (response.ok) {
      reset({ username, content: "" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="retro-panel w-full space-y-6 p-6 sm:p-8"
    >
      <div className="space-y-3">
        <span className="retro-badge">Anonymous Message</span>
        <h1 className="text-3xl font-bold uppercase text-[#fff7d1] sm:text-4xl">
          Send to @{username}
        </h1>
        <p className="text-sm leading-7 text-[#d7cef8]">
          Drop a note into this user&apos;s board. No sender tag gets attached.
        </p>
      </div>

      <input {...register("username")} type="hidden" />

      <label className="block space-y-2">
        <span className="text-sm uppercase tracking-[0.16em] text-[#35d0ba]">
          Message payload
        </span>
        <textarea
          {...register("content")}
          rows={8}
          disabled={!isAcceptingMessages}
          className="retro-inset w-full px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Write something sharp, honest, kind, or weird."
        />
        {errors.content ? <p className="text-sm text-[#ff8c42]">{errors.content.message}</p> : null}
      </label>

      {!isAcceptingMessages ? (
        <p className="retro-inset border-[#ffe066] bg-[#30251c] px-4 py-3 text-sm text-[#fff7d1]">
          This profile is not accepting messages right now.
        </p>
      ) : null}

      {serverMessage ? (
        <p className="retro-inset border-[#35d0ba] bg-[#142f36] px-4 py-3 text-sm text-[#fff7d1]">
          {serverMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !isAcceptingMessages}
        className="retro-button flex w-full items-center justify-center gap-2 px-4 py-4 text-sm font-bold"
      >
        {isSubmitting ? <Spinner className="size-4" /> : null}
        {isSubmitting ? "Sending Packet" : "Send Message"}
      </button>
    </form>
  );
}
