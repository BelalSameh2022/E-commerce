import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.js";
import User from "../../database/models/user.model.js";

export const auth = (roles = []) => {
  return (req, res, next) => {
    const { token } = req.headers;
    if (!token) next(new AppError("Token is missed", 401));

    jwt.verify(token, process.env.SIGNIN_VERIFY_SIGNATURE, async (err, decoded) => {
      if (err) next(new AppError("Expired or invalid token", 498));

      const user = await User.findById(decoded?.userId);
      if (!user) return next(new AppError("User not found", 404));

      if (!roles.includes(decoded?.role))
        next(new AppError("You don't have enough privileges", 403));
      
      req.user = user;
      next();
    });
  };
};
