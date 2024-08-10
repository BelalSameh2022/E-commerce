import { Router } from "express";
import * as CC from "./coupon.controllers.js";
import * as CV from "./coupon.validations.js";
import role from "../../utils/role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkIfCoupon } from "../../middlewares/checkIfExists.middleware.js";

const couponRouter = Router();

couponRouter
  .route("/")
  .post(
    validate(CV.addCouponSchema),
    auth([role.admin]),
    checkIfCoupon,
    CC.addCoupon
  )
  .get(CC.getAllCoupons);

couponRouter
  .route("/:couponId")
  .get(CC.getCoupon)
  .put(validate(CV.updateCouponSchema), auth([role.admin]), CC.updateCoupon)
  .delete(auth([role.admin]), CC.deleteCoupon);

export default couponRouter;
