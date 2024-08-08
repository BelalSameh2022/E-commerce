import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Category from "../../../database/models/category.model.js";

// Add category
// ============================================
const addCategory = asyncErrorHandler(async (req, res, next) => {
  const { name } = req.body;

  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/Categories/${customId}`,
    }
  );

  const category = await Category.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: { secure_url, public_id },
    customId,
    addedBy: req.user.userId,
  });
  if (!category) return next(new AppError("Category not added", 400));

  res.status(201).json({ message: "success", category });
});

// Update category
// ============================================
const updateCategory = asyncErrorHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!name && !req.file) return next(new AppError("There is no data for update", 400));

  const category = await Category.findOne({
    _id: categoryId,
    addedBy: req.user.userId,
  });
  if (!category) return next(new AppError("Category not found", 404));

  if (name) {
    if (name.toLowerCase() === category.name) {
      return next(new AppError("Already the same name", 400));
    }
    if (await Category.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("Category already exists", 409));
    }

    category.name = name;
    category.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(category.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `E-commerce/Categories/${category.customId}`,
      }
    );

    category.image = { secure_url, public_id };
  }

  await category.save();

  res.status(200).json({ message: "success", category });
});

// Delete category
// ============================================
const deleteCategory = asyncErrorHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findOneAndDelete({
    _id: categoryId,
    addedBy: req.user.userId,
  });
  if (!category) return next(new AppError("Category not found or already deleted", 404));

  await cloudinary.api.delete_resources_by_prefix(`E-commerce/Categories/${category.customId}`);
  await cloudinary.api.delete_folder(`E-commerce/Categories/${category.customId}`);

  res.status(200).json({ message: "success", category });
});

// Get all categories
// ============================================
const getAllCategories = asyncErrorHandler(async (req, res, next) => {
  const categories = await Category.find({});
  if (categories.length === 0)
    return next(new AppError("No categories added yet", 404));

  res.status(200).json({ message: "success", categories });
});

export { addCategory, updateCategory, deleteCategory, getAllCategories };
