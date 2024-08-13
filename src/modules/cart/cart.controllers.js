import Cart from "../../../database/models/cart.model.js";
import Product from "../../../database/models/product.model.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";

// Add to cart
// ============================================
const addToCart = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { productId, quantity } = req.body;

  const product = await Product.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
  if (!product)
    return next(new AppError("Product not found or out of stock", 404));

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const newCart = await Cart.create({
      user: userId,
      products: [{ productId, quantity }],
    });
    return res.status(201).json({ message: "success", newCart });
  }

  let flag = false;
  for (const product of cart.products) {
    if (product.productId.toString() === productId) {
      product.quantity = quantity;
      flag = true;
    }
  }
  if (!flag) cart.products.push({ productId, quantity });

  await cart.save();

  res.status(200).json({ message: "success", cart });
});

// Get cart
// ============================================
const getCart = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return next(new AppError("Cart not found", 404));

  res.status(200).json({ message: "success", cart });
});

// Remove from cart
// ============================================
const removeFromCart = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { productId } = req.body;

  const cart = await Cart.findOneAndUpdate(
    { user: userId, "products.productId": productId },
    { $pull: { products: { productId } } },
    { new: true }
  );
  if (!cart)
    return next(
      new AppError("Product not found or already removed from cart", 404)
    );

  res.status(200).json({ message: "success", cart });
});

// Clear cart
// ============================================
const clearCart = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { products: [] },
    { new: true }
  );
  if (!cart) return next(new AppError("Cart not found", 404));

  res.status(200).json({ message: "success", cart });
});

export { addToCart, getCart, removeFromCart, clearCart };
