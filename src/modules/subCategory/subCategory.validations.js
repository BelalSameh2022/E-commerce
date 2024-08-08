import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addCategorySchema = {
  body: joi
    .object({
      name: generalFiled.name.required(),
    })
    .required(),
  file: generalFiled.file.required(),
  headers: generalFiled.headers.required(),
};

const updateCategorySchema = {
  body: joi
    .object({
      name: generalFiled.name,
    })
    .required(),
  file: generalFiled.file,
  headers: generalFiled.headers.required(),
};

export { addCategorySchema, updateCategorySchema };
