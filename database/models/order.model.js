import { model, Schema, Types } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 25,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isPercentage: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedBy: [{
      type: Types.ObjectId,
      ref: "User",
    }],
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Coupon = model("Coupon", couponSchema);

export default Coupon;
