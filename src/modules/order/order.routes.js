import { Router } from "express";
import * as OC from "./order.controllers.js";
import * as OV from "./order.validations.js";
import role from "../../utils/role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
// import { checkIfOrder } from "../../middlewares/checkIfExists.middleware.js";

const orderRouter = Router();

orderRouter
  .route("/")
  .post(
    validate(OV.addOrderSchema),
    auth([role.admin]),
    // checkIfOrder,
    OC.addOrder
  )
  // .get(OC.getAllOrders);

// orderRouter
//   .route("/:orderId")
//   .get(OC.getorder)
//   .put(validate(OV.updateorderSchema), auth([role.admin]), OC.updateorder)
//   .delete(auth([role.admin]), OC.deleteorder);

export default orderRouter;
