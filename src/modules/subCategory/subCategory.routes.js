import { Router } from "express";
import * as SCC from "./subCategory.controllers.js";
import * as SCV from "./subCategory.validations.js";
import role from "../../utils/role.js";
import upload from "../../middlewares/upload.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkIfSubCategory } from "../../middlewares/checkIfExists.middleware.js";

const subCategoryRouter = Router({ mergeParams: true });

subCategoryRouter
  .route("/")
  .post(
    upload.single("image"),
    validate(SCV.addSubCategorySchema),
    auth([role.admin]),
    checkIfSubCategory,
    SCC.addSubCategory
  )
  .get(SCC.getSubCategories);

subCategoryRouter
  .route("/:subCategoryId")
  .get(SCC.getSubCategory)
  .put(
    upload.single("image"),
    validate(SCV.updateSubCategorySchema),
    auth([role.admin]),
    SCC.updateSubCategory
  )
  .delete(auth([role.admin]), SCC.deleteSubCategory);

export default subCategoryRouter;
