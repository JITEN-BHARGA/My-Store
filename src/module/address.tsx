import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["home", "work", "other"], required: true },

  name: String,
  phone: String,
  pincode: String,
  state: String,
  city: String,
  house: String,
  area: String,
  landmark: String,

  isDefault: { type: Boolean, default: false },
})

export default mongoose.models.Address ||
  mongoose.model("Address", addressSchema)
