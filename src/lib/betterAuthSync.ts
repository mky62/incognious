import { ObjectId } from "mongodb";

import dbConnect from "@/lib/dbConnect";

type SyncBetterAuthUserParams = {
  email: string;
  username: string;
  passwordHash: string;
  emailVerified?: boolean;
};

export async function syncBetterAuthCredentialUser({
  email,
  username,
  passwordHash,
  emailVerified = false,
}: SyncBetterAuthUserParams) {
  const db = await dbConnect();
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  const users = db.collection("user");
  const accounts = db.collection("account");

  const existingUser = await users.findOne<{ _id: ObjectId }>({
    email: normalizedEmail,
  });

  if (!existingUser) {
    const userId = new ObjectId();

    await users.insertOne({
      _id: userId,
      name: username,
      email: normalizedEmail,
      emailVerified,
      createdAt: now,
      updatedAt: now,
    });

    await accounts.insertOne({
      _id: new ObjectId(),
      accountId: userId.toString(),
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    return;
  }

  await users.updateOne(
    { _id: existingUser._id },
    {
      $set: {
        name: username,
        email: normalizedEmail,
        emailVerified,
        updatedAt: now,
      },
    },
  );

  const existingAccount = await accounts.findOne({
    userId: existingUser._id,
    providerId: "credential",
  });

  if (existingAccount) {
    await accounts.updateOne(
      { _id: existingAccount._id },
      {
        $set: {
          password: passwordHash,
          accountId: existingUser._id.toString(),
          updatedAt: now,
        },
      },
    );
    return;
  }

  await accounts.insertOne({
    _id: new ObjectId(),
    accountId: existingUser._id.toString(),
    providerId: "credential",
    userId: existingUser._id,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });
}

export async function markBetterAuthEmailVerified(email: string) {
  const db = await dbConnect();
  const normalizedEmail = email.trim().toLowerCase();

  await db.collection("user").updateOne(
    { email: normalizedEmail },
    {
      $set: {
        emailVerified: true,
        updatedAt: new Date(),
      },
    },
  );
}
