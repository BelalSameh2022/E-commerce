import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Product from "../../../database/models/product.model.js";

// Add product
// ============================================
const addProduct = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { name } = req.body;

  const folderId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/Products/${folderId}`,
    }
  );

  const product = await Product.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    logo: { secure_url, public_id },
    folderId,
    addedBy: userId,
  });
  if (!product) return next(new AppError("Product addition failed", 400));

  res.status(201).json({ message: "success", product });
});

// Get products
// ============================================
const getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await product.find({});
  if (products.length === 0)
    return next(new AppError("There are no products added yet", 404));

  res.status(200).json({ message: "success", products });
});

// Get product
// ============================================
const getProduct = asyncErrorHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await product.findById(productId);
  if (!product) return next(new AppError("product not found", 404));

  res.status(200).json({ message: "success", product });
});

// Update product
// ============================================
const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { productId } = req.params;
  const { name } = req.body;

  if (!name && !req.file) return next(new AppError("Nothing to update", 400));

  const product = await product.findOne({ _id: productId, addedBy: userId });
  if (!product)
    return next(
      new AppError("product not found or you don't have permission", 404)
    );

  if (name) {
    if (product.name === name.toLowerCase()) {
      return next(new AppError("Already the same name", 400));
    }
    if (await product.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("product already exists", 409));
    }

    product.name = name;
    product.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(product.logo.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `E-commerce/products/${product.folderId}`,
      }
    );

    product.logo = { secure_url, public_id };
  }

  await product.save();

  res.status(200).json({ message: "success", product });
});

// Delete product
// ============================================
const deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { productId } = req.params;

  const product = await product.findOneAndDelete({ _id: productId, addedBy: userId });
  if (!product)
    return next(
      new AppError("product not found or you don't have permission", 404)
    );

  await cloudinary.api.delete_resources_by_prefix(`E-commerce/products/${product.folderId}`);
  await cloudinary.api.delete_folder(`E-commerce/products/${product.folderId}`);

  res.status(200).json({ message: "success", product });
});

export { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct };
