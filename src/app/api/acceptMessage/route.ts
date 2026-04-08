import { z } from "zod";

import { auth } from "@/lib/auth";
import { createApiResponse, getValidationMessage } from "@/lib/api";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSch";
import { headers } from "next/headers";

export async function POST(request: Request) {
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
    const payload = acceptMessageSchema.parse(await request.json());
    const normalizedEmail = session.user.email.trim().toLowerCase();

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: normalizedEmail },
      { isAcceptingMessages: payload.acceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return createApiResponse(
        { success: false, message: "User not found" },
        404,
      );
    }

    return createApiResponse({
      success: true,
      message: "Message acceptance updated",
      isAcceptingMessages: updatedUser.isAcceptingMessages,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createApiResponse(
        { success: false, message: getValidationMessage(error) },
        400,
      );
    }

    console.error("Error updating message acceptance:", error);

    return createApiResponse(
      { success: false, message: "Update failed" },
      500,
    );
  }
}

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
      .select("isAcceptingMessages")
      .lean();

    if (!user) {
      return createApiResponse(
        { success: false, message: "User not found" },
        404,
      );
    }

    return createApiResponse({
      success: true,
      message: "Message acceptance fetched",
      isAcceptingMessages: user.isAcceptingMessages,
    });
  } catch (error) {
    console.error("Error fetching message acceptance:", error);

    return createApiResponse(
      { success: false, message: "Fetch failed" },
      500,
    );
  }
}
