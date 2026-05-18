// ============================================================
// GigFlow — CSV Export Controller
// Enforces Data Ownership: Sales Users only export their leads.
// ============================================================

import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
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

interface CsvQueryParams {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sortBy?: "Oldest" | "Latest";
}

// ---- Filter Query Interface ----

interface CsvFilterQuery {
  status?: LeadStatus;
  source?: LeadSource;
  createdBy?: string;
  $or?: Array<{ name?: { $regex: string; $options: string }; email?: { $regex: string; $options: string } }>;
}

// ---- CSV Helper: Escape a field value for CSV ----

const escapeCsvField = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// ---- CSV Helper: Convert leads array to CSV string ----

const convertLeadsToCsv = (leads: ILeadDocument[]): string => {
  const headers: string[] = ["ID", "Name", "Email", "Status", "Source", "Created At", "Updated At"];
  const headerRow: string = headers.join(",");

  const dataRows: string[] = leads.map((lead: ILeadDocument): string => {
    const id: string = escapeCsvField(lead._id.toString());
    const name: string = escapeCsvField(lead.name);
    const email: string = escapeCsvField(lead.email);
    const status: string = escapeCsvField(lead.status);
    const source: string = escapeCsvField(lead.source);
    const createdAt: string = escapeCsvField(lead.createdAt.toISOString());
    const updatedAt: string = escapeCsvField(lead.updatedAt.toISOString());

    return [id, name, email, status, source, createdAt, updatedAt].join(",");
  });

  return [headerRow, ...dataRows].join("\n");
};

// ---- Controller: Export Leads as CSV ----

const exportLeadsCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { status, source, search, sortBy }: CsvQueryParams = req.query as CsvQueryParams;

    // ---- Build Dynamic Query ----

    const query: CsvFilterQuery = {};

    // Data Ownership: Non-Admins only export their own leads
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

    // ---- Sorting ----

    const sortDirection: 1 | -1 = sortBy === "Oldest" ? 1 : -1;

    // ---- Fetch ALL matching leads (no skip/limit) ----

    const mongoQuery: FilterQuery<ILeadDocument> = query as FilterQuery<ILeadDocument>;

    const leads: ILeadDocument[] = await Lead.find(mongoQuery).sort({ createdAt: sortDirection });

    // ---- Convert to CSV ----

    const csvContent: string = convertLeadsToCsv(leads);

    // ---- Set Response Headers and Send ----

    const timestamp: string = new Date().toISOString().split("T")[0];
    const filename: string = `leads_export_${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.status(200).send(csvContent);
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "An unexpected error occurred during CSV export.";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export { exportLeadsCsv };
