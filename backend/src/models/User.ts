// ============================================================
// GigFlow — User Mongoose Model
// Extends the clean IUser interface with Mongoose Document
// for full type-safety on queries and instance methods.
// ============================================================

import { Schema, model, Document } from "mongoose";
import { IUser, UserRole } from "../types/index";

// ---- Mongoose Document Interface ----

export interface IUserDocument extends IUser, Document {}

// ---- Schema Definition ----

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "Role must be either 'Admin' or 'Sales User'",
      },
      default: UserRole.SalesUser,
    },
  },
  {
    timestamps: true,
  }
);

// ---- Model Export ----

const User = model<IUserDocument>("User", userSchema);

export default User;
