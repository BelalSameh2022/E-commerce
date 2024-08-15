import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Coupon from "../../../database/models/coupon.model.js";

// Add coupon
// ============================================
const addCoupon = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { code, amount, isPercentage, from, to } = req.body;

  const coupon = await Coupon.create({
    code,
    amount,
    isPercentage,
    from,
    to,
    addedBy: id,
  });
  if (!coupon) return next(new AppError("Coupon addition failed", 400));

  res.status(201).json({ message: "success", coupon });
});

// Get coupons
// ============================================
const getAllCoupons = asyncErrorHandler(async (req, res, next) => {
  const coupons = await Coupon.find({});

  res.status(200).json({ message: "success", coupons });
});

// Get coupon
// ============================================
const getCoupon = asyncErrorHandler(async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) return next(new AppError("Coupon not found", 404));

  res.status(200).json({ message: "success", coupon });
});

// Update coupon
// ============================================
const updateCoupon = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { couponId } = req.params;

  if (!req.body) return next(new AppError("Nothing to update", 400));

  const coupon = await Coupon.findOneAndUpdate(
    { _id: couponId, addedBy: id },
    req.body,
    { new: true }
  );
  if (!coupon)
    return next(
      new AppError("Coupon not found or you don't have permission", 404)
    );

  res.status(200).json({ message: "success", coupon });
});

// Delete coupon
// ============================================
const deleteCoupon = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { couponId } = req.params;

  const coupon = await Coupon.findOneAndDelete({
    _id: couponId,
    addedBy: id,
  });
  if (!coupon)
    return next(
      new AppError("Coupon not found or you don't have permission", 404)
    );

  res.status(200).json({ message: "success", coupon });
});

export { addCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon };
