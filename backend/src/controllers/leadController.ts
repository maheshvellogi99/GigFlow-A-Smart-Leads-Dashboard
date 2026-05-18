// ============================================================
// GigFlow — Lead Controller
// Full CRUD + advanced filtering, search, pagination, sorting.
// Enforces Data Ownership: Sales Users only see their leads.
// ============================================================

import { Request, Response } from "express";
import { FilterQuery, SortOrder } from "mongoose";
import Lead, { ILeadDocument } from "../models/Lead";
import { LeadStatus, LeadSource, UserRole } from "../types/index";

// ---- Auth Request Interface ----

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// ---- Query Parameter Interface ----

interface LeadQueryParams {
  page?: string;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sortBy?: "Oldest" | "Latest";
}

// ---- Request Body Interface ----

interface CreateLeadBody {
  name: string;
  email: string;
  status?: LeadStatus;
  source: LeadSource;
}

interface UpdateLeadBody {
  name?: string;
  email?: string;
  status?: LeadStatus;
  source?: LeadSource;
}

// ---- Pagination Response Interface ----

interface PaginationInfo {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface GetLeadsResponse {
  success: boolean;
  data: ILeadDocument[];
  pagination: PaginationInfo;
}

// ---- MongoDB Query Interface ----

interface LeadFilterQuery {
  status?: LeadStatus;
  source?: LeadSource;
  createdBy?: string;
  $or?: Array<{ name?: { $regex: string; $options: string }; email?: { $regex: string; $options: string } }>;
}

// ---- Sort Interface ----

interface LeadSortOptions {
  createdAt: SortOrder;
}

// ============================================================
// Controller: Get All Leads (Filtering, Search, Pagination)
// ============================================================

const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const {
      page,
      status,
      source,
      search,
      sortBy,
    }: LeadQueryParams = req.query as LeadQueryParams;

    // ---- Build Dynamic Query ----

    const query: LeadFilterQuery = {};

    // Data Ownership: Non-Admins only see their own leads
    if (user?.role !== UserRole.Admin) {
      query.createdBy = user?.id;
    }

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    if (search) {
      const sanitizedSearch: string = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: "i" } },
        { email: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    // ---- Pagination ----

    const limit: number = 10;
    const currentPage: number = Math.max(1, parseInt(page || "1", 10) || 1);
    const skip: number = (currentPage - 1) * limit;

    // ---- Sorting ----

    const sortOptions: Record<string, SortOrder> = {
      createdAt: sortBy === "Oldest" ? 1 : -1,
    };

    // ---- Execute Queries ----

    const mongoQuery: FilterQuery<ILeadDocument> = query as FilterQuery<ILeadDocument>;

    const [leads, totalRecords]: [ILeadDocument[], number] = await Promise.all([
      Lead.find(mongoQuery).populate("createdBy", "name").sort(sortOptions).skip(skip).limit(limit),
      Lead.countDocuments(mongoQuery),
    ]);

    const totalPages: number = Math.ceil(totalRecords / limit);

    // ---- Response ----

    const response: GetLeadsResponse = {
      success: true,
      data: leads,
      pagination: {
        totalRecords,
        currentPage,
        totalPages,
        limit,
      },
    };

    res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred while fetching leads.";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

// ============================================================
// Controller: Get Single Lead by ID
// ============================================================

const getLeadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const leadId = req.params.id as string;

    const lead: ILeadDocument | null = await Lead.findById(leadId);

    if (!lead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }

    // Data Ownership Check
    if (user?.role !== UserRole.Admin && lead.createdBy.toString() !== user?.id) {
      res.status(403).json({ success: false, message: "You do not have permission to access this lead." });
      return;
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred while fetching the lead.";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

// ============================================================
// Controller: Create Lead
// ============================================================

const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { name, email, status, source }: CreateLeadBody = req.body as CreateLeadBody;

    if (!name || !email || !source) {
      res.status(400).json({ success: false, message: "Name, email, and source are required." });
      return;
    }

    const newLead: ILeadDocument = await Lead.create({
      name,
      email,
      status: status || LeadStatus.New,
      source,
      createdBy: user?.id,
    });

    res.status(201).json({ success: true, data: newLead });
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred while creating the lead.";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

// ============================================================
// Controller: Update Lead
// ============================================================

const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const leadId = req.params.id as string;
    const updates: UpdateLeadBody = req.body as UpdateLeadBody;

    // Fetch first to check ownership
    const lead: ILeadDocument | null = await Lead.findById(leadId);

    if (!lead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }

    // Data Ownership Check
    if (user?.role !== UserRole.Admin && lead.createdBy.toString() !== user?.id) {
      res.status(403).json({ success: false, message: "You do not have permission to modify this lead." });
      return;
    }

    const updatedLead: ILeadDocument | null = await Lead.findByIdAndUpdate(
      leadId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedLead });
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred while updating the lead.";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

// ============================================================
// Controller: Delete Lead (Admin Only — enforced at route)
// ============================================================

const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const leadId = req.params.id as string;

    const deletedLead: ILeadDocument | null = await Lead.findByIdAndDelete(leadId);

    if (!deletedLead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Lead deleted successfully." });
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred while deleting the lead.";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export { getLeads, getLeadById, createLead, updateLead, deleteLead };
