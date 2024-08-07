import { model, Schema } from "mongoose";
import role from "../../src/utils/role.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "age is required"],
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model("User", userSchema);

export default User;
