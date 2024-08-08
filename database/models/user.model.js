import { model, Schema } from "mongoose";
import role from "../../src/utils/role.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phoneNumbers: {
      type: [String],
      required: true,
    },
    addresses: {
      type: [String],
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(role),
      default: role.user,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    loggedIn: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: '',
    },
    confirmOtp: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model("User", userSchema);

export default User;
