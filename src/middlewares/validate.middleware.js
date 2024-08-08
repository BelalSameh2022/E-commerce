import { AppError } from "../utils/error.js";

const reqKeys = ["headers", "body", "params", "query", "file", "files"];

export const validate = (schema) => {
  return (req, res, next) => {
    let errors = [];
    reqKeys.forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });
        if (error) {
          error.details.forEach((err) => errors.push(err));
        }
      }
    });
    if (errors.length) {
      return next(
        new AppError(
          `Validation error: ${errors.map(
            ({ message }) => message
          )}`,
          400
        )
      );
    }
    next();
  };
};
