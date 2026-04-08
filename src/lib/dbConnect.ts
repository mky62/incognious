import mongoose from "mongoose";

type MongoDatabase = NonNullable<typeof mongoose.connection.db>;

declare global {
  var _mongoDb: MongoDatabase | undefined;
}

export default async function dbConnect(): Promise<MongoDatabase> {
  if (global._mongoDb) {
    return global._mongoDb;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not defined");
  }

  await mongoose.connect(process.env.MONGO_URI);

  if (!mongoose.connection.db) {
    throw new Error("Failed to establish MongoDB connection");
  }

  global._mongoDb = mongoose.connection.db;

  return global._mongoDb;
}
