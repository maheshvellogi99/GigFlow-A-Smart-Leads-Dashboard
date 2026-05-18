// ============================================================
// GigFlow — JWT Authentication Middleware
// Extracts and verifies a Bearer token from the Authorization
// header, then attaches the decoded user payload to req.user.
// ============================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUserDocument } from "../models/User";
import { UserRole } from "../types/index";

// ---- JWT Payload Interface ----

interface JwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ---- Middleware ----

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required. No token provided." });
      return;
    }

    const token: string = authHeader.split(" ")[1];
    const jwtSecret: string = process.env.JWT_SECRET as string;

    if (!jwtSecret) {
      res.status(500).json({ message: "Server configuration error. JWT_SECRET is not defined." });
      return;
    }

    const decoded: JwtPayload = jwt.verify(token, jwtSecret) as JwtPayload;

    const user: IUserDocument | null = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ message: "Authentication failed. User no longer exists." });
      return;
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Authentication failed. Token is invalid." });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Authentication failed. Token has expired." });
      return;
    }

    res.status(500).json({ message: "Internal server error during authentication." });
  }
};

export default authenticate;
