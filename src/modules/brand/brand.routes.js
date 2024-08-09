import { Router } from "express";
import * as BC from "./brand.controllers.js";
import * as BV from "./brand.validations.js";
import role from "../../utils/role.js";
import upload from "../../middlewares/upload.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkIfBrand } from "../../middlewares/checkIfExists.middleware.js";

const brandRouter = Router();

brandRouter
  .route("/")
  .post(
    upload.single("image"),
    validate(BV.addBrandSchema),
    auth([role.admin]),
    checkIfBrand,
    BC.addBrand
  )
.get(BC.getAllBrands);

brandRouter
  .route("/:brandId")
  .get(BC.getBrand)
  .put(
    upload.single("image"),
    validate(BV.updateBrandSchema),
    auth([role.admin]),
    BC.updateBrand
  )
  .delete(auth([role.admin]), BC.deleteBrand);

export default brandRouter;
