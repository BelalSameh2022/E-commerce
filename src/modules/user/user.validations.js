import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const signUpSchema = {
  body: joi
    .object({
      name: generalFiled.name,
      email: generalFiled.email,
      password: generalFiled.password,
      confirmPassword: generalFiled.confirmPassword,
      age: joi.number().min(18).max(60).required(),
      phoneNumbers: joi.array().items(generalFiled.phoneNumber).min(1).max(2).required(),
      addresses: joi.array().items(joi.string()).min(1).max(2).required(),
    })
    .required(),
};

export { signUpSchema };
