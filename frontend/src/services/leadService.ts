// ============================================================
// GigFlow Frontend — Lead Service
// API methods for leads CRUD and CSV export.
// ============================================================

import { AxiosResponse } from "axios";
import api from "./api";
import {
  ILead,
  PaginatedResponse,
  LeadQueryParams,
  CreateLeadPayload,
  UpdateLeadPayload,
  LeadStatus,
  LeadSource,
} from "../types/index";

interface CsvExportParams {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sortBy?: "Oldest" | "Latest";
}

interface SingleLeadResponse {
  success: boolean;
  data: ILead;
}

interface DeleteLeadResponse {
  success: boolean;
  message: string;
}

const leadService = {
  getLeads: async (params: LeadQueryParams): Promise<PaginatedResponse<ILead>> => {
    const queryParams: Record<string, string> = {};
    if (params.page !== undefined) queryParams.page = params.page.toString();
    if (params.status) queryParams.status = params.status;
    if (params.source) queryParams.source = params.source;
    if (params.search && params.search.trim().length > 0) queryParams.search = params.search.trim();
    if (params.sortBy) queryParams.sortBy = params.sortBy;

    const response: AxiosResponse<PaginatedResponse<ILead>> =
      await api.get<PaginatedResponse<ILead>>("/leads", { params: queryParams });
    return response.data;
  },

  createLead: async (data: CreateLeadPayload): Promise<ILead> => {
    const response: AxiosResponse<SingleLeadResponse> =
      await api.post<SingleLeadResponse>("/leads", data);
    return response.data.data;
  },

  updateLead: async (id: string, data: UpdateLeadPayload): Promise<ILead> => {
    const response: AxiosResponse<SingleLeadResponse> =
      await api.put<SingleLeadResponse>(`/leads/${id}`, data);
    return response.data.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete<DeleteLeadResponse>(`/leads/${id}`);
  },

  exportLeadsCSV: async (params: CsvExportParams): Promise<void> => {
    const queryParams: Record<string, string> = {};
    if (params.status) queryParams.status = params.status;
    if (params.source) queryParams.source = params.source;
    if (params.search && params.search.trim().length > 0) queryParams.search = params.search.trim();
    if (params.sortBy) queryParams.sortBy = params.sortBy;

    const response: AxiosResponse<Blob> = await api.get<Blob>("/csv/export", {
      params: queryParams,
      responseType: "blob",
    });

    const blob: Blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const downloadUrl: string = window.URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement("a");
    const timestamp: string = new Date().toISOString().split("T")[0];
    link.href = downloadUrl;
    link.download = `leads_export_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default leadService;
