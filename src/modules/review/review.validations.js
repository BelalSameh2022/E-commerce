import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addReviewSchema = {
  body: joi
    .object({
      comment: joi.string().required(),
      rate: joi.number().integer().min(1).max(5).required(),
    })
    .required(),
  params: joi
    .object({
      productId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required(),
};

const updateReviewSchema = {
  body: joi
    .object({
      comment: joi.string(),
      rate: joi.number().integer().min(1).max(5),
    })
    .required(),
  params: joi
    .object({
      productId: generalFiled.id.required(),
      reviewId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required(),
};



export { addReviewSchema, updateReviewSchema };
