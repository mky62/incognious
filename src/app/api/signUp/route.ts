import bcrypt from "bcrypt";
import { z } from "zod";

import { sendVrfMail } from "@/helpers/sendVrfMail";
import { syncBetterAuthCredentialUser } from "@/lib/betterAuthSync";
import { createApiResponse, getValidationMessage } from "@/lib/api";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { signUpSchema } from "@/schemas/signUpSch";

function generateVerifyCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = signUpSchema.parse(await request.json());

    const existingByUsername = await UserModel.findOne({ username });

    if (existingByUsername && existingByUsername.email !== email) {
      return createApiResponse(
        { success: false, message: "Username is already taken" },
        400,
      );
    }

    const existingByEmail = await UserModel.findOne({ email });

    if (existingByEmail?.isVerified) {
      return createApiResponse(
        { success: false, message: "User already exists with this email" },
        400,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = generateVerifyCode();
    const verifyCodeExpires = new Date(Date.now() + 60 * 60 * 1000);

    if (existingByEmail) {
      existingByEmail.username = username;
      existingByEmail.password = hashedPassword;
      existingByEmail.verifyCode = verifyCode;
      existingByEmail.verifyCodeExpires = verifyCodeExpires;
      existingByEmail.isVerified = false;
      await existingByEmail.save();
    } else {
      const user = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpires,
        isVerified: false,
        isAcceptingMessages: true,
        message: [],
      });

      await user.save();
    }

    await syncBetterAuthCredentialUser({
      email,
      username,
      passwordHash: hashedPassword,
      emailVerified: false,
    });

    const emailResponse = await sendVrfMail(email, username, verifyCode);

    if (!emailResponse.success) {
      return createApiResponse(
        { success: false, message: emailResponse.message },
        500,
      );
    }

    return createApiResponse(
      {
        success: true,
        message: "User registered successfully. Please check your email for the verification code.",
      },
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createApiResponse(
        { success: false, message: getValidationMessage(error) },
        400,
      );
    }

    console.error("Error registering user:", error);

    return createApiResponse(
      { success: false, message: "Error registering user" },
      500,
    );
  }
}
