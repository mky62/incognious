import { z } from "zod";

import { createApiResponse, getValidationMessage } from "@/lib/api";
import { markBetterAuthEmailVerified } from "@/lib/betterAuthSync";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schemas/verifySch";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = verifySchema.parse(await request.json());
    const user = await UserModel.findOne({ username });

    if (!user) {
      return createApiResponse(
        { success: false, message: "User not found" },
        404,
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpires) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      await markBetterAuthEmailVerified(user.email);

      return createApiResponse({
        success: true,
        message: "Account verified successfully",
      });
    }

    if (!isCodeNotExpired) {
      return createApiResponse(
        {
          success: false,
          message: "Verification code has expired. Please sign up again to get a new code.",
        },
        400,
      );
    }

    return createApiResponse(
      { success: false, message: "Incorrect verification code" },
      400,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createApiResponse(
        { success: false, message: getValidationMessage(error) },
        400,
      );
    }

    console.error("Error verifying user:", error);

    return createApiResponse(
      { success: false, message: "Error verifying user" },
      500,
    );
  }
}
