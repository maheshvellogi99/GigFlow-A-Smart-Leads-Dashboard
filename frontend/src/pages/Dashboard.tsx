// ============================================================
// GigFlow Frontend — Dashboard Page (Smart Container)
// Manages filter/search/pagination state, theme toggle,
// logout, CRUD operations via LeadFormModal, and rendering.
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { LayoutDashboard, ArrowUpDown, LogOut, Sun, Moon } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import leadService from "../services/leadService";
import LeadFilters from "../components/dashboard/LeadFilters";
import LeadTable from "../components/dashboard/LeadTable";
import LeadFormModal from "../components/dashboard/LeadFormModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ILead, LeadStatus, LeadSource, PaginationInfo } from "../types/index";

type SortOption = "Latest" | "Oldest";

const defaultPagination: PaginationInfo = { totalRecords: 0, currentPage: 1, totalPages: 0, limit: 10 };

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // ---- Filter State ----
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "">("");
  const [sortBy, setSortBy] = useState<SortOption>("Latest");
  const [page, setPage] = useState<number>(1);

  // ---- Data State ----
  const [leads, setLeads] = useState<ILead[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(defaultPagination);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ---- Modal State ----
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);

  const debouncedSearch: string = useDebounce<string>(searchTerm, 500);
  const isFilterChange = useRef<boolean>(false);

  useEffect((): void => {
    isFilterChange.current = true;
    setPage(1);
  }, [debouncedSearch, statusFilter, sourceFilter, sortBy]);

  const fetchLeads = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await leadService.getLeads({
        page,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        sortBy,
      });
      setLeads(response.data);
      setPagination(response.pagination);
    } catch (err: unknown) {
      console.error("[Dashboard] Failed to fetch leads:", err);
      setLeads([]);
      setPagination(defaultPagination);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, sourceFilter, sortBy]);

  useEffect((): void => {
    if (isFilterChange.current) {
      isFilterChange.current = false;
      if (page !== 1) return;
    }
    fetchLeads();
  }, [fetchLeads, page]);

  // ---- Handlers ----

  const handlePageChange = (newPage: number): void => {
    isFilterChange.current = false;
    setPage(newPage);
  };

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      await leadService.exportLeadsCSV({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        sortBy,
      });
    } catch (err: unknown) {
      console.error("[Dashboard] CSV export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSort = (): void => setSortBy((prev: SortOption): SortOption => (prev === "Latest" ? "Oldest" : "Latest"));

  // ---- CRUD Handlers ----

  const handleCreateClick = (): void => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (lead: ILead): void => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    
    try {
      await leadService.deleteLead(id);
      fetchLeads(); // Refresh table
    } catch (err: unknown) {
      console.error("[Dashboard] Failed to delete lead:", err);
      alert("Failed to delete lead. Please try again.");
    }
  };

  const handleModalSuccess = (): void => {
    fetchLeads(); // Refresh table after successful create/update
  };

  return (
    <div className="min-h-screen bg-[#B1C9EF] dark:bg-slate-950 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/gigflow.png" alt="GigFlow Logo" className="w-9 h-9 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">GigFlow</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">Smart Leads</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleTheme} className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}>
                {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2d466b] to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{user?.role || "Role"}</p>
                </div>
              </div>
              <button type="button" onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-all duration-200">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B1C9EF] dark:bg-[#395886]/20 flex items-center justify-center transition-colors">
              <LayoutDashboard className="w-5 h-5 text-[#395886] dark:text-[#395886]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Leads Dashboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track your sales leads</p>
            </div>
          </div>
          <button type="button" onClick={toggleSort} className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all">
            <ArrowUpDown className="w-4 h-4" />Sort: {sortBy}
          </button>
        </div>

        <div className="mb-6">
          <LeadFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            onExport={handleExport}
            isExporting={isExporting}
            onCreate={handleCreateClick}
          />
        </div>

        <LeadTable
          leads={leads}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </main>

      {/* CRUD Modal */}
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={selectedLead}
      />
    </div>
  );
};

export default Dashboard;
