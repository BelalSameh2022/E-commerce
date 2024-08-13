import { model, Schema, Types } from "mongoose";

const wishListSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const WishList = model("WishList", wishListSchema);

export default WishList;
