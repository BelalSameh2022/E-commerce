import { Router } from "express";
import * as OC from "./order.controllers.js";
import * as OV from "./order.validations.js";
import role from "../../utils/role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

const orderRouter = Router();

orderRouter
  .route("/")
  .post(
    validate(OV.createOrderSchema),
    auth(Object.values(role)),
    OC.createOrder
  )
  .get(auth(Object.values(role)), OC.getAllOrders);

orderRouter
  .route("/:orderId")
  // .get(auth(Object.values(role)), OC.getorder)
  .put(
    validate(OV.cancelOrderSchema),
    auth(Object.values(role)),
    OC.cancelOrder
  );
//   .delete(auth(Object.values(role)), OC.deleteorder);

export default orderRouter;
