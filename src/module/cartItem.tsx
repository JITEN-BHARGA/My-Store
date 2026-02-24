import mongoose from "mongoose"

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", 
      required: true,
    },
    qty: {  
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema)
