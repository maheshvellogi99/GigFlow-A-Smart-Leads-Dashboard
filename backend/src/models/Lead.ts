// ============================================================
// GigFlow — Lead Mongoose Model
// Extends the clean ILead interface with Mongoose Document
// for full type-safety on queries and instance methods.
// ============================================================

import { Schema, model, Document } from "mongoose";
import { ILead, LeadStatus, LeadSource } from "../types/index";

// ---- Mongoose Document Interface ----

export interface ILeadDocument extends Omit<ILead, 'createdBy'>, Document {
  createdBy: Schema.Types.ObjectId;
}

// ---- Schema Definition ----

const leadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Lead email is required"],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(LeadStatus),
        message: "Status must be one of: New, Contacted, Qualified, Lost",
      },
      default: LeadStatus.New,
    },
    source: {
      type: String,
      enum: {
        values: Object.values(LeadSource),
        message: "Source must be one of: Website, Instagram, Referral",
      },
      required: [true, "Lead source is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// ---- Model Export ----

const Lead = model<ILeadDocument>("Lead", leadSchema);

export default Lead;
