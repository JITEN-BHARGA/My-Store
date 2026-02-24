import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ["percent", "fixed"], required: true },
  value: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

export const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
