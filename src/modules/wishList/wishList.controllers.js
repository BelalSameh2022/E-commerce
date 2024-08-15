import WishList from "../../../database/models/wishList.model.js";
import Product from "../../../database/models/product.model.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";

// Add to wishList
// ============================================
const addToWishList = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { productId } = req.body;

  const product = await Product.findOne({ _id: productId });
  if (!product)
    return next(new AppError("Product not found", 404));

  const wishList = await WishList.findOne({ user: id });
  if (!wishList) {
    const newWishList = await WishList.create({
      user: id,
      products: [{ productId }],
    });
    return res.status(201).json({ message: "success", newWishList });
  }

  for (const product of wishList.products) {
    if (product.productId.toString() === productId) {
      return next(new AppError("Product already added to the wishList", 400));
    }
  }

  wishList.products.push({ productId });
  await wishList.save();

  res.status(200).json({ message: "success", wishList });
});

// Get wishList
// ============================================
const getWishList = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;

  const wishList = await WishList.findOne({ user: id });
  if (!wishList) return next(new AppError("WishList not found", 404));

  res.status(200).json({ message: "success", wishList });
});

// Remove from wishList
// ============================================
const removeFromWishList = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { productId } = req.body;

  const wishList = await WishList.findOneAndUpdate(
    { user: id, "products.productId": productId },
    { $pull: { products: { productId } } },
    { new: true }
  );
  if (!wishList)
    return next(
      new AppError("Product not found or already removed from the wishList", 404)
    );

  res.status(200).json({ message: "success", wishList });
});

// Clear wishList
// ============================================
const clearWishList = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;

  const wishList = await WishList.findOneAndUpdate(
    { user: id },
    { products: [] },
    { new: true }
  );
  if (!wishList)
    return next(new AppError("wishList not found", 404));

  res.status(200).json({ message: "success", wishList });
});

export { addToWishList, getWishList, removeFromWishList, clearWishList };
