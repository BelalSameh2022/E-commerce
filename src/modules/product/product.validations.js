import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

const addProductSchema = {
  body: joi
    .object({
      name: generalFiled.name.required(),
      description: joi.string(),
      category: generalFiled.id.required(),
      subCategory: generalFiled.id.required(),
      brand: generalFiled.id.required(),
      price: joi.number().positive().required(),
      discount: joi.number().integer().min(1).max(100),
      isPercentage: joi.boolean().required(),
      stock: joi.number().integer().positive().required(),
    })
    .required(),
  files: joi.object({ 
    image: joi.array().items(generalFiled.file).length(1).required(), 
    associatedImages: joi.array().items(generalFiled.file).min(1).max(3).required() 
  }).required(),
  headers: generalFiled.headers.required(),
};

const updateProductSchema = {
  body: joi
    .object({
      name: generalFiled.name,
      description: joi.string(),
      price: joi.number().positive(),
      discount: joi.number().integer().min(1).max(100),
      isPercentage: joi.boolean(),
      stock: joi.number().integer().positive(),
    })
    .required(),
  files: joi.object({ 
    image: joi.array().items(generalFiled.file).length(1), 
    associatedImages: joi.array().items(generalFiled.file).min(1).max(3) 
  }),
  headers: generalFiled.headers.required(),
};


export { addProductSchema, updateProductSchema };
