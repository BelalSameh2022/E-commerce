import { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Review = model("Review", reviewSchema);

export default Review;
