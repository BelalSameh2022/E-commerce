import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const createOrderSchema = {
  body: joi
    .object({
      productId: generalFiled.id,
      quantity: joi.number().integer().positive(),
      couponCode: generalFiled.name,
      address: joi.string().required(),
      phoneNumber: generalFiled.phoneNumber.required(),
      paymentMethod: joi.string().valid("cash", "card").required(),
    })
    .required(),
  headers: generalFiled.headers.required(),
};

const cancelOrderSchema = {
  body: joi
    .object({
      reason: joi.string(),
    })
    .required(),
  params: joi
    .object({
      orderId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required(),
};

export { createOrderSchema, cancelOrderSchema };
