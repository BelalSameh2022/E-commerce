import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import { sendEmail } from "../../services/email.js";
import User from "../../../database/models/user.model.js";
import { confirmHtml, resendHtml } from "../../services/html.js";

// Sign up
// ============================================
const signUp = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, age, phoneNumbers, addresses } = req.body;

  const token = jwt.sign(
    { email },
    process.env.CONFIRM_EMAIL_VERIFY_SIGNATURE,
    { expiresIn: 60 * 5 }
  );
  const link = `${req.protocol}://${req.headers.host}/users/confirm/${token}`;

  const reToken = jwt.sign(
    { email },
    process.env.REFRESH_TOKEN_VERIFY_SIGNATURE
  );
  const reLink = `${req.protocol}://${req.headers.host}/users/resend/${reToken}`;

  await sendEmail(email, "Confirmation message", confirmHtml(link, reLink));

  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    age,
    phoneNumbers,
    addresses,
  });

  if (!user) return next(new AppError("User not created", 400));
  res.status(201).json({ message: "success", user });
});

// Confirm email
// ============================================
const confirmEmail = asyncErrorHandler(async (req, res, next) => {
  const { token } = req.params;

  jwt.verify(
    token,
    process.env.CONFIRM_EMAIL_VERIFY_SIGNATURE,
    async (err, decoded) => {
      if (err) return next(new AppError(err.message, 400));

      const user = await User.findOneAndUpdate(
        {
          email: decoded?.email,
          confirmed: false,
        },
        { confirmed: true },
        { new: true }
      );

      if (!user)
        return next(
          new AppError("User doesn't exist or already confirmed", 400)
        );

      res.status(200).json({ message: "Your email has been confirmed" });
    }
  );
});

// Refresh token
// ============================================
const resendConfirmation = asyncErrorHandler(async (req, res, next) => {
  const { reToken } = req.params;

  const decoded = jwt.verify(
    reToken,
    process.env.REFRESH_TOKEN_VERIFY_SIGNATURE
  );
  if (!decoded) return next(new AppError("Invalid token", 401));

  const user = await User.findOne({ email: decoded.email, confirmed: true });
  if (user) return next(new AppError("User already confirmed", 400));

  const token = jwt.sign(
    { email: decoded.email },
    process.env.CONFIRM_EMAIL_VERIFY_SIGNATURE,
    { expiresIn: 60 * 5 }
  );
  const link = `${req.protocol}://${req.headers.host}/users/confirm/${token}`;

  await sendEmail(decoded.email, "Confirmation message", resendHtml(link));

  res.status(200).json({ message: "Check your inbox: New confirmation message has been sent" });
});

// Sign in
// ============================================
const signIn = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user && password !== user.password)
    throw new AppError("Invalid credentials", 401);

  res.status(200).json({ message: "success", user });
});

export { signUp, confirmEmail, resendConfirmation, signIn };
