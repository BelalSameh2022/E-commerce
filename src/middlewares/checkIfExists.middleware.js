import { AppError } from "../utils/error.js";
import User from "../../database/models/user.model.js";

const checkIfUser = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) return next(new AppError("User already exists", 409));
  next();
};

export { checkIfUser };
