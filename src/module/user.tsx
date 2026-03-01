import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  email: string;
  name: string;
  userName: string;
  password: string;
  isVerified: boolean;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", userSchema);

export default User;