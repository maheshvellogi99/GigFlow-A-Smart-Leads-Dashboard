// ============================================================
// GigFlow — Lead Routes
// All routes are protected by authMiddleware.
// DELETE is further restricted to Admin role only.
// ============================================================

import { Router } from "express";
import authenticate from "../middleware/authMiddleware";
import authorizeRoles from "../middleware/roleMiddleware";
import { UserRole } from "../types/index";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from "../controllers/leadController";

const router: Router = Router();

// Apply authentication middleware to ALL lead routes
router.use(authenticate);

// @route   GET /api/leads
// @desc    Get all leads with filtering, search, sorting, and pagination
// @access  Private (Admin, Sales User)
router.get("/", getLeads);

// @route   GET /api/leads/:id
// @desc    Get a single lead by its ID
// @access  Private (Admin, Sales User)
router.get("/:id", getLeadById);

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private (Admin, Sales User)
router.post("/", createLead);

// @route   PUT /api/leads/:id
// @desc    Update an existing lead
// @access  Private (Admin, Sales User)
router.put("/:id", updateLead);

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Private (Admin Only)
router.delete("/:id", authorizeRoles(UserRole.Admin), deleteLead);

export default router;
