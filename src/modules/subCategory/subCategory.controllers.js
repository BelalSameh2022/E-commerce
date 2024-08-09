import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Category from "../../../database/models/category.model.js";
import SubCategory from "../../../database/models/subCategory.model.js";

// Add subCategory
// ============================================
const addSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { categoryId } = req.params;
  const { name } = req.body;

  const category = await Category.findOne({ _id: categoryId, addedBy: userId });
  if (!category)
    return next(
      new AppError("Category not found or you don't have permission", 404)
    );

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
    addedBy: userId,
  });
  if (!subCategory)
    return next(new AppError("SubCategory addition failed", 400));

  res.status(201).json({ message: "success", subCategory });
});

// Get subCategories
// ============================================
const getSubCategories = asyncErrorHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findOne({ _id: categoryId });
  if (!category) return next(new AppError("Category not found", 404));

  const subCategories = await SubCategory.find({
    category: category._id,
  }).populate([
    { path: "category", select: "name -_id" },
    { path: "addedBy", select: "name -_id" },
  ]);
  if (subCategories.length === 0)
    return next(new AppError("No subCategories added yet", 404));

  res.status(200).json({ message: "success", subCategories });
});

// Get subCategory
// ============================================
const getSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;

  const subCategory = await SubCategory.findById(subCategoryId).populate([
    { path: "category", select: "name -_id" },
    { path: "addedBy", select: "name -_id" },
  ]);
  if (!subCategory)
    return next(new AppError("SubCategory not found", 404));

  res.status(200).json({ message: "success", subCategory });
});

// Update subCategory
// ============================================
const updateSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { subCategoryId } = req.params;
  const { name } = req.body;

  if (!name && !req.file)
    return next(new AppError("Nothing to update", 400));

  const subCategory = await SubCategory.findOne({
    _id: subCategoryId,
    addedBy: userId,
  });
  if (!subCategory) return next(new AppError("SubCategory not found or you don't have permission", 404));

  const category = await Category.findOne({
    _id: subCategory.category,
    addedBy: userId,
  });
  if (!category) return next(new AppError("Category not found or you don't have permission", 404));

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
  const { userId } = req.user;
  const { subCategoryId } = req.params;

  const subCategory = await SubCategory.findOneAndDelete({
    _id: subCategoryId,
    addedBy: userId,
  });
  if (!subCategory)
    return next(
      new AppError("SubCategory not found or you don't have permission", 404)
    );

  const category = await Category.findOne({
    _id: subCategory.category,
    addedBy: userId,
  });
  if (!category)
    return next(
      new AppError("Category not found or you don't have permission", 404)
    );

  await cloudinary.api.delete_resources_by_prefix(
    `E-commerce/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`
  );
  await cloudinary.api.delete_folder(
    `E-commerce/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`
  );

  res.status(200).json({ message: "success", subCategory });
});

export {
  addSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
