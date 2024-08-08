import { model, Schema, Types } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      unique: true,
      lowercase: true,
      minLength: 3,
      maxLength: 25,
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      trim: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    customId: {
      type: String,
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "addedBy is required"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Category = model("Category", categorySchema);

export default Category;
