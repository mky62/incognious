import { z } from "zod";

import { createApiResponse, getValidationMessage } from "@/lib/api";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSch";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const result = usernameQuerySchema.parse({
      username: searchParams.get("username"),
    });

    const existingUser = await UserModel.findOne({ username: result.username });

    if (existingUser) {
      return createApiResponse({
        success: false,
        message: "Username is already taken",
      });
    }

    return createApiResponse({
      success: true,
      message: "Username is available",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createApiResponse(
        { success: false, message: getValidationMessage(error) },
        400,
      );
    }

    console.error("Error checking username availability:", error);

    return createApiResponse(
      {
        success: false,
        message: "An error occurred while checking username availability",
      },
      500,
    );
  }
}
