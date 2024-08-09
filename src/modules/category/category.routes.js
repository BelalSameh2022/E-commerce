import { Router } from "express";
import * as CC from "./category.controllers.js";
import * as CV from "./category.validations.js";
import role from "../../utils/role.js";
import upload from "../../middlewares/upload.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkIfCategory } from "../../middlewares/checkIfExists.middleware.js";
import subCategoryRouter from "../subCategory/subCategory.routes.js";

const categoryRouter = Router();

categoryRouter.use("/:categoryId/subCategories", subCategoryRouter);

categoryRouter
  .route("/")
  .post(
    upload.single("image"),
    validate(CV.addCategorySchema),
    auth([role.admin]),
    checkIfCategory,
    CC.addCategory
  )
  .get(CC.getCategories);

categoryRouter
  .route("/:categoryId")
  .get(CC.getCategory)
  .put(
    upload.single("image"),
    validate(CV.updateCategorySchema),
    auth([role.admin]),
    CC.updateCategory
  )
  .delete(auth([role.admin]), CC.deleteCategory);

export default categoryRouter;
