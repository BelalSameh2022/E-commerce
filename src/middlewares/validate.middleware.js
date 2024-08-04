import { AppError } from "../utils/error.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error)
      next(
        new AppError(
          error.details.map(({ message }) => message),
          400
        )
      );
    next();
  };
};
