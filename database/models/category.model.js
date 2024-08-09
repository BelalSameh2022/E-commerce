import { model, Schema, Types } from "mongoose";

const categorySchema = new Schema(
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
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "category",
});

const Category = model("Category", categorySchema);

export default Category;
