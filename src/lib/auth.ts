import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

import { getServerAuthBaseUrl } from "@/lib/auth-config";

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI not defined");
}

const mongoUri = process.env.MONGO_URI;
const mongoClient = new MongoClient(mongoUri);
const databaseName = (() => {
  try {
    return new URL(mongoUri).pathname.replace(/^\//, "") || undefined;
  } catch {
    return undefined;
  }
})();
const authDb = mongoClient.db(databaseName);

export const auth = betterAuth({
  baseURL: getServerAuthBaseUrl(),
  database: mongodbAdapter(authDb),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
  },
});
