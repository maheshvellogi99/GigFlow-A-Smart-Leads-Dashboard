// ============================================================
// GigFlow — Express Request Type Augmentation
// Globally extends the Express Request interface to include
// the authenticated user's payload after JWT verification.
// ============================================================

import { UserRole } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export {};
