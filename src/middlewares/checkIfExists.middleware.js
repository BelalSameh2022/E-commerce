import { AppError } from "../utils/error.js";
import User from "../../database/models/user.model.js";
import Category from "../../database/models/category.model.js";
import SubCategory from "../../database/models/subCategory.model.js";
import Brand from "../../database/models/brand.model.js";
import Product from "../../database/models/product.model.js";

const checkIfExists = (model, fieldName, fieldMessage) => {
  return async (req, res, next) => {
    const fieldValue = req.body[fieldName]?.toLowerCase();
    const exists = await model.findOne({ [fieldName]: fieldValue });
    if (exists) {
      return next(new AppError(`${fieldMessage} already exists`, 409));
    }
    next();
  };
};

const checkIfUser = checkIfExists(User, "email", "User");
const checkIfCategory = checkIfExists(Category, "name", "Category");
const checkIfSubCategory = checkIfExists(SubCategory, "name", "SubCategory");
const checkIfBrand = checkIfExists(Brand, "name", "Brand");
const checkIfProduct = checkIfExists(Product, "name", "Product");

export {
  checkIfUser,
  checkIfCategory,
  checkIfSubCategory,
  checkIfBrand,
  checkIfProduct,
};
