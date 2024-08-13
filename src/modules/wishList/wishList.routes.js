import { Router } from "express";
import * as WLC from "./wishList.controllers.js";
import * as WLV from "./wishList.validations.js";
import role from "../../utils/role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

const wishListRouter = Router();

wishListRouter
  .route("/")
  .post(
    validate(WLV.addToWishListSchema),
    auth(Object.values(role)),
    WLC.addToWishList
  )
  .get(auth(Object.values(role)), WLC.getWishList)
  .patch(
    validate(WLV.removeFromWishListSchema),
    auth(Object.values(role)),
    WLC.removeFromWishList
  )
  .put(auth(Object.values(role)), WLC.clearWishList);

export default wishListRouter;
