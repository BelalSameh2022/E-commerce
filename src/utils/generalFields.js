import joi from "joi";
import { Types } from "mongoose";

const validationObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("invalid object _id");
};

export const generalFiled = {
  id: joi.string().custom(validationObjectId),
  name: joi.string().min(3).max(20),
  email: joi.string().email(),
  password: joi.string().pattern(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/),
  confirmPassword: joi.string().valid(joi.ref("password")),
  otp: joi.string().length(5),
  phoneNumber: joi.string().pattern(/^(\+20|0020|0)?1[0125]\d{8}$/),
  date: joi
    .string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .message("Date must be on format yyyy-mm-dd"),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
  headers: joi.object({
    "cache-control": joi.string(),
    "postman-token": joi.string(),
    "content-type": joi.string(),
    "content-length": joi.string(),
    host: joi.string(),
    "user-agent": joi.string(),
    accept: joi.string(),
    "accept-encoding": joi.string(),
    connection: joi.string(),
    token: joi.string().required(),
  }),
};
