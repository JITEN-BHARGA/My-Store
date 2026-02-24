import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

        qty: { type: Number, required: true },
        price: { type: Number, required: true },

        // ✅ per-seller delivery control
        status: {
          type: String,
          enum: ["Placed", "Shipped", "Delivered"],
          default: "Placed",
        },

        isDelivered: {
          type: Boolean,
          default: false,
        },

        deliveryDate: {
          type: Date,
        },
      },
    ],

    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, uppercase: true, default: "" },
    total: { type: Number, required: true },

    // 🔽 overall order status (auto calculated)
    status: { type: String, default: "Placed" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);