import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string; // hashed
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true, collection: "admin" } // ✅ specify collection name
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);