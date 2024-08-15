import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import { sendEmail } from "../../services/email.js";
import { confirmHtml, resendHtml } from "../../services/html.js";
import User from "../../../database/models/user.model.js";

// Sign up
// ============================================
const signUp = asyncErrorHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    age,
    phoneNumbers,
    addresses,
    role = "User",
  } = req.body;

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
    role,
  });
  req.document = {
    model: User,
    id: user._id,
  };

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
          email: decoded.email,
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

  res.status(200).json({
    message: "Check your inbox: New confirmation message has been sent",
  });
});

// Sign in
// ============================================
const signIn = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, confirmed: true });
  if (!user || !bcrypt.compareSync(password, user.password))
    return next(new AppError("Invalid credentials or not confirmed yet", 401));

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.SIGNIN_VERIFY_SIGNATURE,
    { expiresIn: "1d" }
  );

  user.loggedIn = true;
  await user.save();

  res.status(200).json({ message: "success", token });
});

// Forget password
// ============================================
const forgetPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;

  const nanoid = customAlphabet("1234567890", 5);
  const otp = nanoid();

  await sendEmail(email, "OTP code", `<p>Your otp is: <b>${otp}</b></p>`);

  const user = await User.findOneAndUpdate(
    { email },
    { otp, confirmOtp: false }
  );
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "success" });
});

// Confirm otp
// ============================================
const confirmOtp = asyncErrorHandler(async (req, res, next) => {
  const { otp } = req.body;

  const user = await User.findOneAndUpdate(
    { otp },
    { otp: "", confirmOtp: true }
  );
  if (!user) return next(new AppError("Invalid otp", 400));

  res.status(200).json({ message: "success" });
});

// Reset password
// ============================================
const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

  const user = await User.findOneAndUpdate(
    { email, confirmOtp: true },
    { password: hashedPassword }
  );
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "success" });
});

export {
  signUp,
  confirmEmail,
  resendConfirmation,
  signIn,
  forgetPassword,
  confirmOtp,
  resetPassword,
};
