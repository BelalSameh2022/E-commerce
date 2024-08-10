import { model, Schema, Types } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 25,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: {
        secure_url: String,
        public_id: String,
      },
      required: true,
    },
    associatedImages: {
      type: [{
        secure_url: String,
        public_id: String,
      }],
      required: true,
    },
    folderId: {
      type: String,
      required: true,
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priceAfterDiscount: {
      type: Number,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    rateAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = model("Product", productSchema);

export default Product;
