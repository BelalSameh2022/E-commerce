import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Review from "../../../database/models/review.model.js";
import Order from "../../../database/models/order.model.js";
import Product from "../../../database/models/product.model.js";

// Add review
// ============================================
const addReview = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { productId } = req.params;
  const { comment, rate } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));

  const review_ = await Review.findOne({ addedBy: id, productId });
  if (review_) return next(new AppError("You already reviewed this product", 400));

  const order = await Order.findOne({
    user: id,
    status: "delivered",
    "items.productId": productId,
  });
  if (!order)
    return next(
      new AppError("You can't review this product before you delivered it", 400)
    );

  const review = await Review.create({
    comment,
    rate,
    productId,
    addedBy: id,
  });
  if (!review) return next(new AppError("Review addition failed", 400));

  // const reviews = await Review.find({ productId });
  // const average = reviews.reduce((total, review) => total + review.rate, 0) / reviews.length;
  // product.rateAvg = +average.toFixed(1);
  // await product.save();

  const rateSum = product.rateAvg * product.rateNum + rate;
  product.rateNum += 1;

  product.rateAvg = +(rateSum / product.rateNum).toFixed(1);
  await product.save();

  res.status(201).json({ message: "success", review });
});

// Get all reviews
// ============================================
const getAllReviews = asyncErrorHandler(async (req, res, next) => {
  const reviews = await Review.find({});
  if (!reviews.length)
    return next(new AppError("There are no reviews added yet", 404));

  res.status(200).json({ message: "success", reviews });
});

// Get review
// ============================================
const getReview = asyncErrorHandler(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) return next(new AppError("Review not found", 404));

  res.status(200).json({ message: "success", review });
});

// Update review
// ============================================
const updateReview = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { reviewId } = req.params;
  const { comment, rate } = req.body;

  const review = await Review.findOne({ _id: reviewId, addedBy: id });
  if (!review)
    return next(
      new AppError("Review not found or you don't have permission", 404)
    );
  const oldRate = review.rate;

  comment && (review.comment = comment);
  rate && (review.rate = rate);
  await review.save();

  const product = await Product.findById(review.productId);

  const rateSum = product.rateAvg * product.rateNum - oldRate + rate;
  product.rateAvg = +(rateSum / product.rateNum).toFixed(1);
  await product.save();

  res.status(200).json({ message: "success", review });
});

// Delete review
// ============================================
const deleteReview = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { reviewId } = req.params;

  const review = await Review.findOneAndDelete({
    _id: reviewId,
    addedBy: id,
  });
  if (!review)
    return next(
      new AppError("Review not found or you don't have permission", 404)
    );

  const product = await Product.findById(review.productId);

  const rateSum = product.rateAvg * product.rateNum - review.rate;
  product.rateNum -= 1;

  product.rateAvg = +(rateSum / product.rateNum).toFixed(1);
  await product.save();

  res.status(200).json({ message: "success", review });
});

export { addReview, getAllReviews, getReview, updateReview, deleteReview };
