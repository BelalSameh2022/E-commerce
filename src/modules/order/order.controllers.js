import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Order from "../../../database/models/order.model.js";
import Product from "../../../database/models/product.model.js";
import Coupon from "../../../database/models/coupon.model.js";
import Cart from "../../../database/models/cart.model.js";

// Create order
// ============================================
const createOrder = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const {
    productId,
    quantity,
    couponCode,
    address,
    phoneNumber,
    paymentMethod,
  } = req.body;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toLowerCase(),
      to: { $gte: Date.now() },
      usedBy: { $nin: [userId] },
    });
    if (!coupon)
      return next(
        new AppError("Coupon not found or expired or already used", 404)
      );
    req.body.coupon = coupon;
  }

  let items_ = [];
  let flag = false;
  if (productId) {
    items_ = [{ productId, quantity }];
  } else {
    const cart = await Cart.findOne({ user: userId });
    if (!cart.products.length) return next(new AppError("Cart is empty", 404));
    items_ = cart.products;
    flag = true;
  }

  const items = [];
  let total = 0;
  for (let item of items_) {
    const product = await Product.findOne({
      _id: item.productId,
      stock: { $gte: item.quantity },
    });
    if (!product)
      return next(new AppError("Product not found or out of stock", 404));

    if (flag) item = item.toObject();
    item.name = product.name;
    item.price = product.price;
    item.finalPrice = product.priceAfterDiscount;
    total += item.finalPrice * item.quantity;

    items.push(item);
  }

  const finalTotal = req.body.coupon?.isPercentage
    ? total - total * ((req.body.coupon?.amount || 0) / 100)
    : total - (req.body.coupon?.amount || 0);

  const order = await Order.create({
    user: userId,
    items,
    total,
    couponId: req.body.coupon?._id,
    finalTotal,
    address,
    phoneNumber,
    paymentMethod,
    status: paymentMethod === "card" ? "waitPayment" : "placed",
  });
  if (!order) return next(new AppError("Order creation failed", 400));

  if (req.body.coupon) {
    await Coupon.updateOne(
      { _id: req.body.coupon._id },
      { $push: { usedBy: userId } }
    );
  }

  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    );
  }

  if (flag) {
    await Cart.updateOne({ user: userId }, { $set: { products: [] } });
  }

  res.status(201).json({ message: "success", order });
});

// Get all orders
// ============================================
const getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;

  const orders = await Order.find({ user: userId });
  if (!orders.length)
    return next(new AppError("There are no orders created yet", 404));

  res.status(200).json({ message: "success", orders });
});

// Cancel order
// ============================================
const cancelOrder = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order)
    return next(
      new AppError("Order not found or you don't have permission", 404)
    );

  if (order.status === "cancelled")
    return next(new AppError("Order already cancelled", 400));

  if (
    (order.paymentMethod === "cash" && order.status !== "placed") ||
    (order.paymentMethod === "card" && order.status !== "waitPayment")
  ) {
    return next(new AppError("You can't cancel this order", 400));
  }

  await Order.updateOne(
    { _id: orderId },
    { $set: { status: "cancelled", cancelledBy: userId, reason } }
  );

  if (order.couponId) {
    await Coupon.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: userId } }
    );
  }

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: item.quantity } }
    );
  }

  res.status(200).json({ message: "success", order });
});

export { createOrder, getAllOrders, cancelOrder };
