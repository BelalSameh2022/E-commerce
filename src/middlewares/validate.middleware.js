import { AppError } from "../utils/error.js";

const reqKeys = ["headers", "body", "params", "query", "file", "files"];

export const validate = (schema) => {
  return (req, res, next) => {
    reqKeys.forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });
        if (error) {
          return next(
            new AppError(
              `Validation error: ${error.details.map(
                ({ message }) => message
              )}`,
              400
            )
          );
        }
        next();
      }
    });
  };
};
