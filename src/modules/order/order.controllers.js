import Stripe from "stripe";
import Product from "../../../database/models/product.model.js";
import Cart from "../../../database/models/cart.model.js";
import Coupon from "../../../database/models/coupon.model.js";
import Order from "../../../database/models/order.model.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import { createInvoice } from "../../services/createInvoice.js";
import { capitalize } from "../../utils/capitalize.js";
import { sendEmail } from "../../services/email.js";
import { createPayment } from "../../services/payment.js";

// Create order
// ============================================
const createOrder = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
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
      usedBy: { $nin: [id] },
    });
    if (!coupon)
      return next(
        new AppError("Coupon not found or expired or already used", 404)
      );
    req.coupon = coupon;
  }

  let items_ = [];
  let flag = false;
  if (productId) {
    items_ = [{ productId, quantity }];
  } else {
    const cart = await Cart.findOne({ user: id });
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

  const finalTotal = total - total * ((req.coupon?.amount || 0) / 100);

  const order = await Order.create({
    user: id,
    items,
    total,
    couponId: req.coupon?._id,
    finalTotal,
    address,
    phoneNumber,
    paymentMethod,
    status: paymentMethod === "card" ? "waitPayment" : "placed",
  });
  if (!order) return next(new AppError("Order creation failed", 400));

  if (req.coupon) {
    await Coupon.updateOne({ _id: req.coupon._id }, { $push: { usedBy: id } });
  }

  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    );
  }

  if (flag) {
    await Cart.updateOne({ user: id }, { $set: { products: [] } });
  }

  // const invoice = {
  //   shipping: {
  //     name: capitalize(req.user.name),
  //     address: "Abbas Street",
  //     city: "Nasr City",
  //     state: "Cairo",
  //     country: "Egypt",
  //     postal_code: 4450113,
  //   },
  //   items: order.items,
  //   total: order.total,
  //   finalTotal: order.finalTotal,
  //   couponCode: req.coupon?.code || "___",
  //   couponAmount:req.coupon?.amount + "%" || "___",
  //   invoice_nr: order._id,
  //   date: order.createdAt,
  // };

  // await createInvoice(invoice, "invoice.pdf");
  // await sendEmail(
  //   req.user.email,
  //   "Order Placed",
  //   `Your order has been placed successfully.`,
  //   [{ path: "invoice.pdf", contentType: "application/pdf" }]
  // );

  if (paymentMethod === "card") {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (req.coupon) {
      const coupon = await stripe.coupon.create({
        percent_off: req.coupon.amount,
        duration: "once",
      });

      req.couponId = coupon.id;
    }

    const session = await createPayment({
      stripe,
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { order: order._id.toString() },
      success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
      cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
      line_items: order.items.map((item) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: item.name,
            },
            unit_amount: item.finalPrice * 100,
          },
          quantity: item.quantity,
        };
      }),
      discounts: req.coupon ? [{ coupon: req.couponId }] : [],
    });

    order.paymentMethod = "placed";
    await order.save();

    return res
      .status(201)
      .json({ message: "success", url: session.url, order });
  }

  res.status(201).json({ message: "success", order });
});

// Get all orders
// ============================================
const getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;

  const orders = await Order.find({ user: id });

  res.status(200).json({ message: "success", orders });
});

// Get the latest order
// ============================================
const getLatestOrder = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;

  const order = await Order.findOne({ user: id }).sort("-createdAt");
  if (!order) return next(new AppError("Order not found", 404));

  res.status(200).json({ message: "success", order });
});

// Cancel order
// ============================================
const cancelOrder = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({ _id: orderId, user: id });
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
    { $set: { status: "cancelled", cancelledBy: id, reason } },
    { new: true }
  );

  if (order.couponId) {
    await Coupon.updateOne({ _id: order.couponId }, { $pull: { usedBy: id } });
  }

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: item.quantity } }
    );
  }

  res.status(200).json({ message: "success", order });
});

export { createOrder, getAllOrders, getLatestOrder, cancelOrder };
