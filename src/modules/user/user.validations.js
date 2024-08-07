import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const signUpSchema = {
  body: joi
    .object({
      name: generalFiled.name.required(),
      email: generalFiled.email.required(),
      password: generalFiled.password.required(),
      confirmPassword: generalFiled.confirmPassword.required(),
      age: joi.number().min(18).max(60).required(),
      phoneNumbers: joi
        .array()
        .items(generalFiled.phoneNumber)
        .min(1)
        .max(2)
        .required(),
      addresses: joi.array().items(joi.string()).min(1).max(2).required(),
    })
    .required(),
};

const signInSchema = {
  body: joi
    .object({
      name: generalFiled.name.required(),
      email: generalFiled.email.required(),
      password: generalFiled.password.required(),
      confirmPassword: generalFiled.confirmPassword.required(),
      age: joi.number().min(18).max(60).required(),
      phoneNumbers: joi
        .array()
        .items(generalFiled.phoneNumber)
        .min(1)
        .max(2)
        .required(),
      addresses: joi.array().items(joi.string()).min(1).max(2).required(),
    })
    .required(),
};

const forgetPasswordSchema = {
  body: joi
    .object({
      email: generalFiled.email,
    })
    .required(),
};

const confirmOtpSchema = {
  body: joi
    .object({
      otp: generalFiled.otp.required(),
    })
    .required(),
};

const resetPasswordSchema = {
  body: joi
    .object({
      email: generalFiled.email.required(),
      password: generalFiled.password.required(),
      confirmPassword: generalFiled.confirmPassword.required(),
    })
    .required(),
};

export {
  signUpSchema,
  signInSchema,
  forgetPasswordSchema,
  confirmOtpSchema,
  resetPasswordSchema,
};
