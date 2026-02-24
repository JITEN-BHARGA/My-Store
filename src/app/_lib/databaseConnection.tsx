import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const CONNECTION_STRING = process.env.CONNECTION_STRING;

    if (!CONNECTION_STRING) {
      throw new Error("Connection string load failed...");
    }

    await mongoose.connect(CONNECTION_STRING);

  } catch (err) {
    console.error("Database connection error:", err);
  }
};
