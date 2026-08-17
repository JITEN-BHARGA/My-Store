import mongoose from "mongoose";

const CONNECTION_STRING = process.env.CONNECTION_STRING;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache the connection across hot reloads / lambda invocations.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._mongooseCache || { conn: null, promise: null };

global._mongooseCache = cached;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) return cached.conn;

  if (!CONNECTION_STRING) {
    throw new Error("Connection string load failed...");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(CONNECTION_STRING);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so a later call can retry, and surface the failure.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};
