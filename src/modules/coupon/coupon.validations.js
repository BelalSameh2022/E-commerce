import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addCouponSchema = {
  body: joi
    .object({
      code: generalFiled.name.required(),
      amount: joi.number().integer().positive().required(),
      isPercentage: joi.boolean().required(),
      from: joi.date().greater(Date.now()).required(),
      to: joi.date().greater(joi.ref("from")).required(),
    })
    .required(),
  headers: generalFiled.headers.required(),
};

const updateCouponSchema = {
  body: joi
    .object({
      code: generalFiled.name,
      amount: joi.number().integer().positive(),
      isPercentage: joi.boolean(),
      from: joi.date().greater(Date.now()),
      to: joi.date().greater(joi.ref("from")),
    })
    .required(),
  params: joi
    .object({
      couponId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required(),
};

export { addCouponSchema, updateCouponSchema };
