import { Router } from "express";
import * as CC from "./cart.controllers.js";
import * as CV from "./cart.validations.js";
import role from "../../utils/role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
// import { checkIfCart } from "../../middlewares/checkIfExists.middleware.js";

const cartRouter = Router();

cartRouter
  .route("/")
  .post(
    validate(CV.addCartSchema),
    auth([role.admin]),
    // checkIfCart,
    CC.addCart
  )


// cartRouter
//   .route("/:cartId")
//   .get(CC.getcart)
//   .put(validate(CV.updatecartSchema), auth([role.admin]), CC.updatecart)
//   .delete(auth([role.admin]), CC.deletecart);

export default cartRouter;
