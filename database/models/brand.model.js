import { model, Schema, Types } from "mongoose";

const brandSchema = new Schema(
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
    logo: {
      secure_url: String,
      public_id: String,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Brand = model("Brand", brandSchema);

export default Brand;
