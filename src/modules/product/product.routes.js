import { Router } from "express";
import * as PC from "./product.controllers.js";
import * as PV from "./product.validations.js";
import role from "../../utils/role.js";
import upload from "../../middlewares/upload.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkIfProduct } from "../../middlewares/checkIfExists.middleware.js";

const productRouter = Router();

productRouter
  .route("/")
  .post(
    upload.fields([
      {name: "image", maxCount: 1},
      {name: "associatedImages", maxCount: 3},
    ]),
    validate(PV.addProductSchema),
    auth([role.admin]),
    checkIfProduct,
    PC.addProduct
  )
// .get(PC.getAllproducts);

// productRouter
//   .route("/:productId")
//   .get(PC.getproduct)
//   .put(
//     upload.single("image"),
//     validate(PV.updateproductSchema),
//     auth([role.admin]),
//     PC.updateproduct
//   )
//   .delete(auth([role.admin]), PC.deleteproduct);

export default productRouter;
