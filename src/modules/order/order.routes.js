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

orderRouter.get("/latest", auth(Object.values(role)), OC.getLatestOrder);

orderRouter.put(
  "/:orderId",
  validate(OV.cancelOrderSchema),
  auth(Object.values(role)),
  OC.cancelOrder
);

orderRouter.get("/success/:orderId", (req, res) => {
  res.status(200).json({ message: "Your order has been placed" });
});
orderRouter.get("/cancel/:orderId", (req, res) => {
  res.status(200).json({ message: "Your order has been cancelled" });
});

orderRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  OC.webhook
);

export default orderRouter;
