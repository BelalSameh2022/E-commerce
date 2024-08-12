import { Router } from "express";
import * as RC from "./review.controllers.js";
import * as RV from "./review.validations.js";
import role from "../../utils/role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

const reviewRouter = Router({ mergeParams: true });

reviewRouter
  .route("/")
  .post(validate(RV.addReviewSchema), auth(Object.values(role)), RC.addReview)
  .get(RC.getAllReviews);

reviewRouter
  .route("/:reviewId")
  .get(RC.getReview)
  .put(
    validate(RV.updateReviewSchema),
    auth(Object.values(role)),
    RC.updateReview
  )
  .delete(auth(Object.values(role)), RC.deleteReview);

export default reviewRouter;
