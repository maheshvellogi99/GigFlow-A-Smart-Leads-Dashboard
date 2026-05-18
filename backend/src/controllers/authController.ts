// ============================================================
// GigFlow — Authentication Controller
// Handles user registration (with Admin Secret protection)
// and login with bcrypt hashing and JWT generation.
// ============================================================

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUserDocument } from "../models/User";
import { UserRole } from "../types/index";

// ---- Request Body Interfaces ----

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  adminSecret?: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

// ---- Response Interfaces ----

interface AuthTokenPayload {
  id: string;
  role: UserRole;
}

interface LoginResponseData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

interface RegisterResponseData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// ---- Helper: Generate JWT ----

const generateToken = (payload: AuthTokenPayload): string => {
  const jwtSecret: string = process.env.JWT_SECRET as string;
  const expiresIn: number = parseInt(process.env.JWT_EXPIRES_IN || "604800", 10);

  return jwt.sign(payload, jwtSecret, { expiresIn });
};

// ---- Controller: Register User ----

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, adminSecret }: RegisterRequestBody =
      req.body as RegisterRequestBody;

    // Check if all required fields are present
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    // ---- Admin Secret Verification ----
    // If someone tries to register as Admin, they MUST provide the correct secret.
    const requestedRole: UserRole = role || UserRole.SalesUser;

    if (requestedRole === UserRole.Admin) {
      const serverAdminSecret: string | undefined = process.env.ADMIN_SECRET;

      if (!serverAdminSecret) {
        res.status(500).json({
          message: "Server configuration error. Admin registration is not configured.",
        });
        return;
      }

      if (!adminSecret || adminSecret !== serverAdminSecret) {
        res.status(403).json({
          message: "Invalid Admin Secret. You are not authorized to register as an Admin.",
        });
        return;
      }
    }

    // Check if user already exists
    const existingUser: IUserDocument | null = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: "A user with this email already exists." });
      return;
    }

    // Hash the password
    const salt: string = await bcrypt.genSalt(12);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    // Create the user
    const newUser: IUserDocument = await User.create({
      name,
      email,
      password: hashedPassword,
      role: requestedRole,
    });

    // Generate JWT
    const tokenPayload: AuthTokenPayload = {
      id: newUser._id.toString(),
      role: newUser.role,
    };

    const token: string = generateToken(tokenPayload);

    // Build response
    const responseData: RegisterResponseData = {
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };

    res.status(201).json(responseData);
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred during registration.";
    res.status(500).json({ message: errorMessage });
  }
};

// ---- Controller: Login User ----

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequestBody = req.body as LoginRequestBody;

    // Check if all required fields are present
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    // Find user by email (include password for comparison)
    const user: IUserDocument | null = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Compare passwords
    const isPasswordMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Generate JWT
    const tokenPayload: AuthTokenPayload = {
      id: user._id.toString(),
      role: user.role,
    };

    const token: string = generateToken(tokenPayload);

    // Build response
    const responseData: LoginResponseData = {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    res.status(200).json(responseData);
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred during login.";
    res.status(500).json({ message: errorMessage });
  }
};

export { registerUser, loginUser };
