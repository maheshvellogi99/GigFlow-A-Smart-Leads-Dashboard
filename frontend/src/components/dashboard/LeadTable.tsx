// ============================================================
// GigFlow Frontend — Lead Table Component
// Table with actions column (Edit/Delete), role-based delete,
// and conditionally rendered 'Created By' column for Admins.
// ============================================================

import React from "react";
import { ChevronLeft, ChevronRight, Inbox, Globe, Instagram, Users, Pencil, Trash2 } from "lucide-react";
import { ILead, LeadStatus, LeadSource, PaginationInfo, UserRole } from "../../types/index";
import { useAuth } from "../../context/AuthContext";

interface LeadTableProps {
  leads: ILead[];
  loading: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onEdit: (lead: ILead) => void;
  onDelete: (id: string) => void;
}

interface BadgeStyle { bg: string; text: string; dot: string; }

const statusBadgeMap: Record<LeadStatus, BadgeStyle> = {
  [LeadStatus.New]: { bg: "bg-sky-100 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500 dark:bg-sky-400" },
  [LeadStatus.Contacted]: { bg: "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
  [LeadStatus.Qualified]: { bg: "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500 dark:bg-emerald-400" },
  [LeadStatus.Lost]: { bg: "bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500 dark:bg-red-400" },
};

const sourceIconMap: Record<LeadSource, React.ReactElement> = {
  [LeadSource.Website]: <Globe className="w-3.5 h-3.5" />,
  [LeadSource.Instagram]: <Instagram className="w-3.5 h-3.5" />,
  [LeadSource.Referral]: <Users className="w-3.5 h-3.5" />,
};

const formatDate = (dateString: string): string => {
  const date: Date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const SkeletonRow: React.FC<{ index: number; isAdmin: boolean }> = ({ index, isAdmin }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse" style={{ animationDelay: `${index * 75}ms` }}>
    <td className="px-5 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/50 rounded" /></td>
    <td className="px-5 py-4"><div className="h-4 w-44 bg-slate-200 dark:bg-slate-700/50 rounded" /></td>
    <td className="px-5 py-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-full" /></td>
    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded" /></td>
    <td className="px-5 py-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700/50 rounded" /></td>
    {isAdmin && <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded" /></td>}
    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700/50 rounded" /></td>
  </tr>
);

const EmptyState: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => (
  <tr>
    <td colSpan={isAdmin ? 7 : 6} className="px-5 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No leads found</h4>
        <p className="text-sm text-slate-500 max-w-sm">No leads match your current filters. Try adjusting your search criteria or clearing the filters.</p>
      </div>
    </td>
  </tr>
);

const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const style: BadgeStyle = statusBadgeMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

const SourceBadge: React.FC<{ source: LeadSource }> = ({ source }) => (
  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
    {sourceIconMap[source]}
    {source}
  </span>
);

const LeadTable: React.FC<LeadTableProps> = ({ leads, loading, pagination, onPageChange, onEdit, onDelete }) => {
  const { user } = useAuth();
  const { totalRecords, currentPage, totalPages } = pagination;
  const isAdmin: boolean = user?.role === UserRole.Admin;

  const startRecord: number = totalRecords === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;
  const endRecord: number = Math.min(currentPage * pagination.limit, totalRecords);

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[740px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
              {isAdmin && (
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created By</th>
              )}
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_: unknown, i: number): React.ReactElement => <SkeletonRow key={`sk-${i}`} index={i} isAdmin={isAdmin} />)
            ) : leads.length === 0 ? (
              <EmptyState isAdmin={isAdmin} />
            ) : (
              leads.map((lead: ILead): React.ReactElement => (
                <tr key={lead._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4"><span className="text-sm font-medium text-slate-800 dark:text-slate-200">{lead.name}</span></td>
                  <td className="px-5 py-4"><span className="text-sm text-slate-500 dark:text-slate-400">{lead.email}</span></td>
                  <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                  <td className="px-5 py-4"><SourceBadge source={lead.source} /></td>
                  <td className="px-5 py-4"><span className="text-sm text-slate-500">{formatDate(lead.createdAt)}</span></td>
                  
                  {isAdmin && (
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {typeof lead.createdBy === 'object' && lead.createdBy !== null && 'name' in lead.createdBy
                          ? lead.createdBy.name
                          : 'Unknown'}
                      </span>
                    </td>
                  )}

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(): void => onEdit(lead)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#395886] dark:hover:text-[#395886] hover:bg-[#B1C9EF] dark:hover:bg-[#395886]Hover/10 transition-all"
                        aria-label={`Edit ${lead.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(): void => onDelete(lead._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          aria-label={`Delete ${lead.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent">
        <p className="text-sm text-slate-500">
          {totalRecords === 0 ? "No records" : (
            <>Showing <span className="text-slate-700 dark:text-slate-300 font-medium">{startRecord}</span>{" – "}<span className="text-slate-700 dark:text-slate-300 font-medium">{endRecord}</span>{" of "}<span className="text-slate-700 dark:text-slate-300 font-medium">{totalRecords}</span> leads</>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button id="pagination-prev-btn" type="button" onClick={(): void => { if (currentPage > 1) onPageChange(currentPage - 1); }} disabled={currentPage <= 1} className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" />Prev
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Page <span className="text-slate-800 dark:text-white font-medium">{currentPage}</span> of <span className="text-slate-800 dark:text-white font-medium">{totalPages === 0 ? 1 : totalPages}</span></span>
          <button id="pagination-next-btn" type="button" onClick={(): void => { if (currentPage < totalPages) onPageChange(currentPage + 1); }} disabled={currentPage >= totalPages} className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Next<ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;
