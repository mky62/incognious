import { z } from "zod";

import { createApiResponse, getValidationMessage } from "@/lib/api";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { messageSchema } from "@/schemas/messageSch";
import { usernameValidation } from "@/schemas/signUpSch";

const sendMessageSchema = z.object({
  username: usernameValidation,
  content: messageSchema.shape.content,
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = sendMessageSchema.parse(await request.json());

    const user = await UserModel.findOne({ username });

    if (!user) {
      return createApiResponse(
        { success: false, message: "User not found" },
        404,
      );
    }

    if (!user.isAcceptingMessages) {
      return createApiResponse(
        { success: false, message: "User is not accepting messages" },
        403,
      );
    }

    user.message.push({
      content,
      createdAt: new Date(),
    });

    await user.save();

    return createApiResponse(
      { success: true, message: "Message sent successfully" },
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createApiResponse(
        { success: false, message: getValidationMessage(error) },
        400,
      );
    }

    console.error("Error sending message:", error);

    return createApiResponse(
      { success: false, message: "Internal server error" },
      500,
    );
  }
}
