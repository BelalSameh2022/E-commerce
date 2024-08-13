import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addToWishListSchema = {
  body: joi.object({
    productId: generalFiled.id.required(),
  }).required(),
  headers: generalFiled.headers.required(),
};

const removeFromWishListSchema = {
  body: joi.object({
    productId: generalFiled.id.required(),
  }).required(),
  headers: generalFiled.headers.required(),
};

export { addToWishListSchema, removeFromWishListSchema };
