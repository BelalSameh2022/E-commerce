import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Category from "../../../database/models/category.model.js";
import SubCategory from "../../../database/models/subCategory.model.js";
import Brand from "../../../database/models/brand.model.js";
import Product from "../../../database/models/product.model.js";
import Review from "../../../database/models/review.model.js";
import GetFeatures from "../../utils/getFeatures.js";

// Add product
// ============================================
const addProduct = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
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

  const category_ = await Category.findOne({ _id: category, addedBy: id });
  if (!category_)
    return next(
      new AppError("Category not found or you don't have permission", 404)
    );

  const subCategory_ = await SubCategory.findOne({
    _id: subCategory,
    category,
    addedBy: id,
  });
  if (!subCategory_)
    return next(
      new AppError("SubCategory not found or you don't have permission", 404)
    );

  const brand_ = await Brand.findOne({ _id: brand, addedBy: id });
  if (!brand_)
    return next(
      new AppError("Brand not found or you don't have permission", 404)
    );

  const priceAfterDiscount =
    isPercentage !== "false"
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
  req.filePath = `E-commerce/Categories/${category_.folderId}/SubCategories/${subCategory_.folderId}/Products/${folderId}`;

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
    addedBy: id,
    category,
    subCategory,
    brand,
    price,
    discount,
    isPercentage,
    priceAfterDiscount,
    stock,
  });
  if (!product) return next(new AppError("Product addition failed", 400));
  req.document = {
    model: Product,
    id: product._id,
  }

  res.status(201).json({ message: "success", product });
});

// Get all products
// ============================================
const getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const getFeatures = new GetFeatures(Product.find({}), req.query)
    .paginate()
    .filter()
    .sort()
    .select()
    .search();

  const products = await getFeatures.mongooseQuery;

  res
    .status(200)
    .json({ message: "success", page: getFeatures.page, products });
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
  const { id } = req.user;
  const { productId } = req.params;
  const { name, description, price, discount, isPercentage, stock } = req.body;

  if (!req.body && !req.files) {
    return next(new AppError("Nothing to update", 400));
  }

  const product = await Product.findOne({ _id: productId, addedBy: id })
    .populate("category", "folderId")
    .populate("subCategory", "folderId");
  if (!product)
    return next(
      new AppError("Product not found or you don't have permission", 404)
    );

  if ((isPercentage && !discount) || (!isPercentage && discount)) {
    return next(
      new AppError(
        "You have to provide isPercentage or not to update discount",
        400
      )
    );
  }

  if (isPercentage === "true" && discount > 100) {
    return next(new AppError("Discount can't be more than 100", 400));
  }

  if (name) {
    if (product.name === name.toLowerCase()) {
      return next(new AppError("Already the same name", 400));
    }
    if (await Product.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("Product already exists", 409));
    }

    product.name = name;
    product.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (description) product.description = description;

  if (price && discount && isPercentage) {
    const priceAfterDiscount =
      isPercentage !== "false"
        ? price - price * (discount / 100)
        : price - discount;
    product.price = price;
    product.discount = discount;
    product.priceAfterDiscount = priceAfterDiscount;
  } else if (price) {
    const priceAfterDiscount = product.isPercentage
      ? price - price * (product.discount / 100)
      : price - product.discount;
    product.price = price;
    product.priceAfterDiscount = priceAfterDiscount;
  } else if (discount && isPercentage) {
    const priceAfterDiscount =
      isPercentage !== "false"
        ? product.price - product.price * (discount / 100)
        : product.price - discount;
    product.discount = discount;
    product.priceAfterDiscount = priceAfterDiscount;
  }

  isPercentage === "true" && (product.isPercentage = true);
  isPercentage === "false" && (product.isPercentage = false);

  if (stock) product.stock = stock;

  if (req.files) {
    if (req.files.image?.length) {
      await cloudinary.uploader.destroy(product.image.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: `E-commerce/Categories/${product.category.folderId}/SubCategories/${product.subCategory.folderId}/Products/${product.folderId}`,
        }
      );
      product.image = { secure_url, public_id };
    }
    if (req.files.associatedImages?.length) {
      await cloudinary.api.delete_resources_by_prefix(
        `E-commerce/Categories/${product.category.folderId}/SubCategories/${product.subCategory.folderId}/Products/${product.folderId}/AssociatedImages`
      );

      const associatedImages = [];
      for (const file of req.files.associatedImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `E-commerce/Categories/${product.category.folderId}/SubCategories/${product.subCategory.folderId}/Products/${product.folderId}/AssociatedImages`,
          }
        );
        associatedImages.push({ secure_url, public_id });
      }
      product.associatedImages = associatedImages;
    }
  }

  await product.save();

  res.status(200).json({ message: "success", product });
});

// Delete product
// ============================================
const deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { productId } = req.params;

  const product = await Product.findOneAndDelete({
    _id: productId,
    addedBy: id,
  })
    .populate("category", "folderId")
    .populate("subCategory", "folderId");
  if (!product)
    return next(
      new AppError("Product not found or you don't have permission", 404)
    );

  await cloudinary.api.delete_resources_by_prefix(
    `E-commerce/Categories/${product.category.folderId}/SubCategories/${product.subCategory.folderId}/Products/${product.folderId}`
  );
  await cloudinary.api.delete_folder(
    `E-commerce/Categories/${product.category.folderId}/SubCategories/${product.subCategory.folderId}/Products/${product.folderId}`
  );

  await Review.deleteMany({ productId: product._id });

  res.status(200).json({ message: "success", product });
});

export { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct };
