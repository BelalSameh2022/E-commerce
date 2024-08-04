import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.js";

export const auth = (role) => {
  return (req, res, next) => {
    const { token } = req.headers;
    if (!token) next(new AppError("Token is missed", 401));

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) next(new AppError("Expired or invalid token", 498));

      if (decoded.role !== role)
        next(new AppError("Don't have enough privileges", 403));
      
      req.user = decoded;
      next();
    });
  };
};
