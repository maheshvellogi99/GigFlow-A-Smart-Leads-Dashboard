// ============================================================
// GigFlow — Authentication Routes
// Wires up POST /register and POST /login to their
// respective controller methods.
// ============================================================

import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router: Router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user and return a JWT
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a JWT
// @access  Public
router.post("/login", loginUser);

export default router;
