// ============================================================
// GigFlow — Role-Based Authorization Middleware
// Factory function that returns a middleware restricting access
// to users whose role is included in the allowed roles list.
// ============================================================

import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/index";

// ---- Factory Middleware ----

const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: "Authorization failed. User is not authenticated.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};

export default authorizeRoles;
