import { model, Schema } from "mongoose";
import { role } from "../../src/utils/role.js";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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
  confirmEmail: {
    type: Boolean,
    default: false,
  },
  loggedIn: {
    type: Boolean,
    default: false,
  },
});

const User = model("User", userSchema);

export default User;
