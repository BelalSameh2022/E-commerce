import { Router } from "express";
import * as CC from "./cart.controllers.js";
import * as CV from "./cart.validations.js";
import role from "../../utils/role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

const cartRouter = Router();

cartRouter
  .route("/")
  .post(validate(CV.addToCartSchema), auth(Object.values(role)), CC.addToCart)
  .get(auth(Object.values(role)), CC.getCart);

// cartRouter
//   .route("/:cartId")
//   .put(validate(CV.updatecartSchema), auth(Object.values(role)))), CC.updatecart)
//   .delete(auth(Object.values(role)))), CC.deletecart);

export default cartRouter;
