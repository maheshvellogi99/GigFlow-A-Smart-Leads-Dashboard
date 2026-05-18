// ============================================================
// GigFlow — CSV Export Routes
// Protected by authMiddleware. Accessible by all roles.
// ============================================================

import { Router } from "express";
import authenticate from "../middleware/authMiddleware";
import { exportLeadsCsv } from "../controllers/csvController";

const router: Router = Router();

// Apply authentication middleware
router.use(authenticate);

// @route   GET /api/csv/export
// @desc    Export all matching leads as a downloadable CSV file
// @access  Private (Admin, Sales User)
router.get("/export", exportLeadsCsv);

export default router;
