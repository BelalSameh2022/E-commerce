import { model, Schema, Types } from "mongoose";

const subCategorySchema = new Schema(
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
    image: {
      secure_url: String,
      public_id: String,
    },
    folderId: {
      type: String,
      required: true,
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
