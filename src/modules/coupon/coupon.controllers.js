import slugify from "slugify";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Coupon from "../../../database/models/coupon.model.js";

// Add coupon
// ============================================
const addCoupon = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { code, amount, isPercentage = true, from, to } = req.body;

  const coupon = await Coupon.create({
    code,
    amount,
    isPercentage,
    from,
    to,
    addedBy: userId,
  });
  if (!coupon) return next(new AppError("Coupon addition failed", 400));

  res.status(201).json({ message: "success", coupon });
});

// Get coupons
// ============================================
const getAllCoupons = asyncErrorHandler(async (req, res, next) => {
  const coupons = await Coupon.find({});
  if (coupons.length === 0)
    return next(new AppError("There are no coupons added yet", 404));

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
  const { userId } = req.user;
  const { couponId } = req.params;

  if (!req.body) return next(new AppError("There is no data to update", 400));

  const coupon = await Coupon.findOneAndUpdate(
    { _id: couponId, addedBy: userId },
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
  const { userId } = req.user;
  const { couponId } = req.params;

  const coupon = await Coupon.findOneAndDelete({
    _id: couponId,
    addedBy: userId,
  });
  if (!coupon)
    return next(
      new AppError("Coupon not found or you don't have permission", 404)
    );

  res.status(200).json({ message: "success", coupon });
});

export { addCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon };
