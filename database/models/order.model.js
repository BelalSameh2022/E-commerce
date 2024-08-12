import { model, Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [{
      productId: { type: Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      finalPrice: { type: Number, required: true },
    }],
    total: {
      type: Number,
      required: true,
    },
    couponId: {
      type: Types.ObjectId,
      ref: "Coupon",
    },
    finalTotal: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      required: true,
    },
    status: {
      type: String,
      enum: ["placed", "waitPayment", "shipped", "delivered", "cancelled", "rejected"],
    },
    cancelledBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },
    reason: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Order = model("Order", orderSchema);

export default Order;
