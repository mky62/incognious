import { auth } from "@/lib/auth";
import { createApiResponse } from "@/lib/api";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { headers } from "next/headers";

export async function GET() {
  await dbConnect();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return createApiResponse(
      { success: false, message: "Unauthorized" },
      401,
    );
  }

  try {
    const normalizedEmail = session.user.email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail })
      .select("message")
      .lean();

    if (!user) {
      return createApiResponse(
        { success: false, message: "User not found" },
        404,
      );
    }

    const messages = [...(user.message ?? [])]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((message) => ({
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      }));

    return createApiResponse({
      success: true,
      message: "Messages fetched successfully",
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);

    return createApiResponse(
      { success: false, message: "Failed to fetch messages" },
      500,
    );
  }
}
