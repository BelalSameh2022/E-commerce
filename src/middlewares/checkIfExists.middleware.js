import { AppError } from "../utils/error.js";
import User from "../../database/models/user.model.js";
import Category from "../../database/models/category.model.js";
import SubCategory from "../../database/models/subCategory.model.js";
import Brand from "../../database/models/brand.model.js";

const checkIfUser = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (user) return next(new AppError("User already exists", 409));
  next();
};

const checkIfCategory = async (req, res, next) => {
  const { name } = req.body;
  const category = await Category.findOne({ name: name?.toLowerCase() });
  if (category) return next(new AppError("Category already exists", 409));
  next();
};

const checkIfSubCategory = async (req, res, next) => {
  const { name } = req.body;
  const subCategory = await SubCategory.findOne({ name: name?.toLowerCase() });
  if (subCategory) return next(new AppError("SubCategory already exists", 409));
  next();
};

const checkIfBrand = async (req, res, next) => {
  const { name } = req.body;
  const brand = await Brand.findOne({ name: name?.toLowerCase() });
  if (brand) return next(new AppError("Brand already exists", 409));
  next();
};

export { checkIfUser, checkIfCategory, checkIfSubCategory, checkIfBrand };
