import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Category from "../../../database/models/category.model.js";
import SubCategory from "../../../database/models/subCategory.model.js";
import Brand from "../../../database/models/brand.model.js";
import Product from "../../../database/models/product.model.js";

// Add product
// ============================================
const addProduct = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const {
    name,
    description = "",
    category,
    subCategory,
    brand,
    price,
    discount = 0,
    isPercentage = true,
    stock,
  } = req.body;

  const category_ = await Category.findOne({ _id: category, addedBy: userId });
  if (!category_)
    return next(
      new AppError("Category not found or you don't have permission", 404)
    );

  const subCategory_ = await SubCategory.findOne({
    _id: subCategory,
    category,
    addedBy: userId,
  });
  if (!subCategory_)
    return next(
      new AppError("SubCategory not found or you don't have permission", 404)
    );

  const brand_ = await Brand.findOne({ _id: brand, addedBy: userId });
  if (!brand_)
    return next(
      new AppError("Brand not found or you don't have permission", 404)
    );

  const priceAfterDiscount = isPercentage
    ? price - price * (discount / 100)
    : price - discount;

  const folderId = nanoid(5);
  const associatedImages = [];
  for (const file of req.files.associatedImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `E-commerce/Categories/${category_.folderId}/SubCategories/${subCategory_.folderId}/Products/${folderId}/AssociatedImages`,
      }
    );
    associatedImages.push({ secure_url, public_id });
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    {
      folder: `E-commerce/Categories/${category_.folderId}/SubCategories/${subCategory_.folderId}/Products/${folderId}`,
    }
  );

  const product = await Product.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    description,
    image: { secure_url, public_id },
    associatedImages,
    folderId,
    addedBy: userId,
    category,
    subCategory,
    brand,
    price,
    discount,
    priceAfterDiscount,
    stock,
  });
  if (!product) return next(new AppError("Product addition failed", 400));

  res.status(201).json({ message: "success", product });
});

// Get products
// ============================================
const getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await Product.find({});
  if (products.length === 0)
    return next(new AppError("There are no products added yet", 404));

  res.status(200).json({ message: "success", products });
});

// Get product
// ============================================
const getProduct = asyncErrorHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({ message: "success", product });
});

// Update product
// ============================================
const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { productId } = req.params;
  const {
    name,
    description,
    category,
    subCategory,
    brand,
    price,
    discount,
    stock,
  } = req.body;

  if (!req.body && !req.files)
    return next(new AppError("Nothing to update", 400));

  const category_ = await Category.findOne({ _id: category, addedBy: userId });
  if (!category_)
    return next(
      new AppError("Category not found or you don't have permission", 404)
    );

  const subCategory_ = await SubCategory.findOne({
    _id: subCategory,
    category,
    addedBy: userId,
  });
  if (!subCategory_)
    return next(
      new AppError("SubCategory not found or you don't have permission", 404)
    );

  const brand_ = await Brand.findOne({ _id: brand, addedBy: userId });
  if (!brand_)
    return next(
      new AppError("Brand not found or you don't have permission", 404)
    );

  // const priceAfterDiscount = price - price * (discount / 100);

  console.log(req.files);

  // const product = await Product.findOne({ _id: productId, addedBy: userId });
  // if (!product)
  //   return next(
  //     new AppError("product not found or you don't have permission", 404)
  //   );

  // if (name) {
  //   if (product.name === name.toLowerCase()) {
  //     return next(new AppError("Already the same name", 400));
  //   }
  //   if (await product.findOne({ name: name.toLowerCase() })) {
  //     return next(new AppError("product already exists", 409));
  //   }

  //   product.name = name;
  //   product.slug = slugify(name, {
  //     replacement: "_",
  //     lower: true,
  //   });
  // }

  // if (req.file) {
  //   await cloudinary.uploader.destroy(product.logo.public_id);
  //   const { secure_url, public_id } = await cloudinary.uploader.upload(
  //     req.file.path,
  //     {
  //       folder: `E-commerce/products/${product.folderId}`,
  //     }
  //   );

  //   product.logo = { secure_url, public_id };
  // }

  // await product.save();

  res.status(200).json({ message: "success", product: req.files });
});

// Delete product
// ============================================
const deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { productId } = req.params;

  const product = await product.findOneAndDelete({
    _id: productId,
    addedBy: userId,
  });
  if (!product)
    return next(
      new AppError("product not found or you don't have permission", 404)
    );

  await cloudinary.api.delete_resources_by_prefix(
    `E-commerce/products/${product.folderId}`
  );
  await cloudinary.api.delete_folder(`E-commerce/products/${product.folderId}`);

  res.status(200).json({ message: "success", product });
});

export { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct };
