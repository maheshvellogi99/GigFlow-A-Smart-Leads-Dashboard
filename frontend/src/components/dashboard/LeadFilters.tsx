// ============================================================
// GigFlow Frontend — Lead Filters Component
// Search input, status/source dropdowns, clear & export
// buttons. Responsive layout with light/dark mode support.
// ============================================================

import React, { ChangeEvent } from "react";
import { Search, X, Download, Filter } from "lucide-react";
import { LeadStatus, LeadSource } from "../../types/index";

// ---- Props Interface ----

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: LeadStatus | "";
  setStatusFilter: (value: LeadStatus | "") => void;
  sourceFilter: LeadSource | "";
  setSourceFilter: (value: LeadSource | "") => void;
  onExport: () => void;
  isExporting: boolean;
  onCreate: () => void;
}

// ---- Component ----

const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  onExport,
  isExporting,
  onCreate,
}) => {
  // ---- Handlers ----

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as LeadStatus | "");
  };

  const handleSourceChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSourceFilter(e.target.value as LeadSource | "");
  };

  const handleClearFilters = (): void => {
    setSearchTerm("");
    setStatusFilter("");
    setSourceFilter("");
  };

  const hasActiveFilters: boolean =
    searchTerm.length > 0 || statusFilter !== "" || sourceFilter !== "";

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:p-5 shadow-sm dark:shadow-none transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-[#2d466b] dark:text-[#395886]" />
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B1C9EF] dark:bg-[#2d466b]/10 border border-[#2d466b] dark:border-[#2d466b]/20 text-[#395886] dark:text-[#395886] text-xs font-medium">
            Active
          </span>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            id="lead-search-input"
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2d466b]/40 focus:border-[#395886] dark:focus:border-[#2d466b]/50 transition-all"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={(): void => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative lg:w-44">
          <select
            id="lead-status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2d466b]/40 focus:border-[#395886] dark:focus:border-[#2d466b]/50 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            {Object.values(LeadStatus).map(
              (status: LeadStatus): React.ReactElement => (
                <option key={status} value={status}>
                  {status}
                </option>
              )
            )}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Source Dropdown */}
        <div className="relative lg:w-44">
          <select
            id="lead-source-filter"
            value={sourceFilter}
            onChange={handleSourceChange}
            className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2d466b]/40 focus:border-[#395886] dark:focus:border-[#2d466b]/50 transition-all cursor-pointer"
          >
            <option value="">All Sources</option>
            {Object.values(LeadSource).map(
              (source: LeadSource): React.ReactElement => (
                <option key={source} value={source}>
                  {source}
                </option>
              )
            )}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 lg:flex-shrink-0">
          {/* Clear Filters */}
          <button
            id="clear-filters-btn"
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Export CSV */}
          <button
            id="export-csv-btn"
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#395886] hover:bg-[#2d466b] rounded-lg text-sm text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isExporting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export CSV"}
            </span>
          </button>

          {/* Create Lead */}
          <button
            id="create-lead-btn"
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#395886] hover:bg-[#2d466b] rounded-lg text-sm text-white font-medium transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Create Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadFilters;
