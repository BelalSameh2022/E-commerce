import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addToCartSchema = {
  body: joi.object({
    productId: generalFiled.id.required(),
    quantity: joi.number().integer().positive().required(),
  }).required(),
  headers: generalFiled.headers.required(),
};

const removeFromCartSchema = {
  body: joi.object({
    productId: generalFiled.id.required(),
  }).required(),
  headers: generalFiled.headers.required(),
};

export { addToCartSchema, removeFromCartSchema };
