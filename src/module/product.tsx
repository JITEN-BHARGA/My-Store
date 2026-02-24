import mongoose, { Schema, Document } from "mongoose";

enum Catagory {
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Groceries",
  "Mobiles",
  "Accessories",
}

export interface ProductDocument extends Document {
  name: string;
  imageURL: string[];
  currentPrice: number;
  discount?: number;
  finalPrice?: number;
  itemInfo: string;
  category?: Catagory;
  companyName: string;
  sellerId: mongoose.Schema.Types.ObjectId;
  attributes?: Record<string, string | number | boolean>;
  reviews?: {
    userId: string;
    userName: String;
    rating: number;
    comment?: string;
    createdAt: Date;
  }[];
  reviewCount?: number;
  averageRating?: number;
  stock: number;
  isActive: boolean;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },

    imageURL: [{ type: String, required: true }],

    currentPrice: { type: Number, required: true },

    discount: { type: Number, default: 0 },

    finalPrice: { type: Number },

    itemInfo: { type: String, required: true },

    category: { type: String },

    companyName: { type: String, required: true },

    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    attributes: { type: Object },

    reviews: [
      {
        userId: String,
        userName: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    reviewCount: { type: Number, default: 0 },

    averageRating: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<ProductDocument>("Product", ProductSchema);
