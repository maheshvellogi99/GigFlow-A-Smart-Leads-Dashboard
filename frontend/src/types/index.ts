// ============================================================
// GigFlow Frontend — Shared TypeScript Types & Enums
// Mirrors the backend data models for full-stack type safety.
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

// ---- User Interfaces ----

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ---- Lead Interfaces ----

export interface ILead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy?: { _id: string; name: string } | string;
  createdAt: string;
  updatedAt: string;
}

// ---- Auth Response (from POST /api/auth/login & /register) ----

export interface AuthResponse {
  token: string;
  user: IUser;
}

// ---- Pagination Metadata (matches backend response exactly) ----

export interface PaginationInfo {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

// ---- Paginated Response Wrapper ----

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

// ---- Generic API Error Response ----

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

// ---- Lead Query Parameters (for filtering/search/pagination) ----

export interface LeadQueryParams {
  page?: number;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sortBy?: "Oldest" | "Latest";
}

// ---- Create / Update Lead Bodies ----

export interface CreateLeadPayload {
  name: string;
  email: string;
  source: LeadSource;
  status?: LeadStatus;
}

export interface UpdateLeadPayload {
  name?: string;
  email?: string;
  status?: LeadStatus;
  source?: LeadSource;
}

// ---- Auth Payloads ----

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  adminSecret?: string;
}
