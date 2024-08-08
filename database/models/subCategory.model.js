import { model, Schema, Types } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 20,
      unique: true,
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
    category: {
      type: Types.ObjectId,
      ref: "Category",
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

const SubCategory = model("SubCategory", subCategorySchema);

export default SubCategory;
