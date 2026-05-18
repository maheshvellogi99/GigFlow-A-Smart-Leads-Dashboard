// ============================================================
// GigFlow — Shared TypeScript Interfaces (Data Layer)
// These are clean, Mongoose-agnostic interfaces used across
// the entire backend: controllers, services, validators, etc.
// ============================================================

// ---- Enums ----

export enum UserRole {
  Admin = "Admin",
  SalesUser = "Sales User",
}

export enum LeadStatus {
  New = "New",
  Contacted = "Contacted",
  Qualified = "Qualified",
  Lost = "Lost",
}

export enum LeadSource {
  Website = "Website",
  Instagram = "Instagram",
  Referral = "Referral",
}

// ---- Base Interfaces ----

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ILead {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: string; // References IUser ID
  createdAt: Date;
  updatedAt: Date;
}
