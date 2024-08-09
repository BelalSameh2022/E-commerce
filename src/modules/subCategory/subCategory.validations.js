import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addSubCategorySchema = {
  body: joi
    .object({
      name: generalFiled.name.required(),
    })
    .required(),
  params: joi
    .object({
      categoryId: generalFiled.id.required(),
    })
    .required(),
  file: generalFiled.file.required(),
  headers: generalFiled.headers.required(),
};

const updateSubCategorySchema = {
  body: joi
    .object({
      name: generalFiled.name,
    })
    .required(),
  file: generalFiled.file,
  headers: generalFiled.headers.required(),
  params: joi
    .object({
      subCategoryId: generalFiled.id.required(),
    })
    .required(),
};

export { addSubCategorySchema, updateSubCategorySchema };
