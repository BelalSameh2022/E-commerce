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
  );
// .get(BC.getAllSubCategories);

// brandRouter
//   .route("/:subCategoryId")
//   .put(
//     upload.single("image"),
//     validate(BV.updateSubCategorySchema),
//     auth([role.admin]),
//     BC.updateSubCategory
//   )
//   .delete(auth([role.admin]), BC.deletesubCategory);

export default brandRouter;
