import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  productIds: mongoose.Schema.Types.ObjectId[];
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ⭐ one wishlist per user
    },

    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Wishlist = models.Wishlist || model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;