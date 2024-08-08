import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Category from "../../../database/models/category.model.js";
import SubCategory from "../../../database/models/subCategory.model.js";

// Add subCategory
// ============================================
const addSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) return next(new AppError("Category not found", 404));

  const folderId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/Categories/${category.folderId}/SubCategories/${folderId}`,
    }
  );

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: { secure_url, public_id },
    folderId,
    category: categoryId,
    addedBy: req.user.userId,
  });
  if (!subCategory) return next(new AppError("SubCategory not added", 400));

  res.status(201).json({ message: "success", subCategory });
});

// Update subCategory
// ============================================
const updateSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;
  const { name } = req.body;

  if (!name && !req.file) return next(new AppError("There is no date for update", 400));

  const subCategory = await SubCategory.findOne({
    _id: subCategoryId,
    addedBy: req.user.userId,
  });
  if (!subCategory) return next(new AppError("SubCategory not found", 404));

  const category = await Category.findOne({
    _id: subCategory.category,
    addedBy: req.user.userId,
  });
  if (!category) return next(new AppError("Category not found", 404));

  if (name) {
    if (name.toLowerCase() === subCategory.name) {
      return next(new AppError("Already the same name", 400));
    }
    if (await SubCategory.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("SubCategory already exists", 409));
    }

    subCategory.name = name;
    subCategory.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(subCategory.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `E-commerce/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`,
      }
    );

    subCategory.image = { secure_url, public_id };
  }

  await subCategory.save();

  res.status(200).json({ message: "success", subCategory });
});

// Delete subCategory
// ============================================
const deleteSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findOneAndDelete({
    _id: categoryId,
    addedBy: req.user.userId,
  });
  if (!category) return next(new AppError("Category not found or already deleted", 404));

  await cloudinary.api.delete_resources_by_prefix(category.folderId);

  res.status(200).json({ message: "success" });
});

// Get all subCategories
// ============================================
const getAllSubCategories = asyncErrorHandler(async (req, res, next) => {
  const categories = await Category.find({});
  if (categories.length === 0)
    return next(new AppError("No categories added yet", 404));

  res.status(200).json({ message: "success", categories });
});

export { addSubCategory, updateSubCategory, deleteSubCategory, getAllSubCategories };
