const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required."],
    },
    organization: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["demoUser", "admin"],
      default: "demoUser",
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
