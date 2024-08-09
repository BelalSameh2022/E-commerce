import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addBrandSchema = {
  body: joi
    .object({
      name: generalFiled.name.required(),
    })
    .required(),
  file: generalFiled.file.required(),
  headers: generalFiled.headers.required(),
};

export { addBrandSchema };