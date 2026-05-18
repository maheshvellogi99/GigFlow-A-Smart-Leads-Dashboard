// ============================================================
// GigFlow Frontend — Lead Form Modal
// Handles both Create and Update. Light/dark mode support.
// ============================================================

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { X, Save, Plus, AlertCircle } from "lucide-react";
import { ILead, LeadStatus, LeadSource, CreateLeadPayload, UpdateLeadPayload } from "../../types/index";
import leadService from "../../services/leadService";

// ---- Props Interface ----

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ILead | null;
}

// ---- Component ----

const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const isEditMode: boolean = !!initialData;

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<LeadStatus>(LeadStatus.New);
  const [source, setSource] = useState<LeadSource>(LeadSource.Website);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Populate form when editing
  useEffect((): void => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setStatus(initialData.status);
      setSource(initialData.source);
    } else {
      setName("");
      setEmail("");
      setStatus(LeadStatus.New);
      setSource(LeadSource.Website);
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode && initialData) {
        const updates: UpdateLeadPayload = { name: name.trim(), email: email.trim(), status, source };
        await leadService.updateLead(initialData._id, updates);
      } else {
        const payload: CreateLeadPayload = { name: name.trim(), email: email.trim(), status, source };
        await leadService.createLead(payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : "Failed to save lead.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl dark:shadow-none transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {isEditMode ? <Save className="w-5 h-5 text-[#395886]Hover" /> : <Plus className="w-5 h-5 text-[#395886]Hover" />}
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              {isEditMode ? "Edit Lead" : "Create New Lead"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="lead-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
            <input id="lead-name" type="text" value={name} onChange={(e: ChangeEvent<HTMLInputElement>): void => setName(e.target.value)} placeholder="Lead name" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all" />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="lead-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input id="lead-email" type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)} placeholder="lead@example.com" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all" />
          </div>

          {/* Status & Source Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select id="lead-status" value={status} onChange={(e: ChangeEvent<HTMLSelectElement>): void => setStatus(e.target.value as LeadStatus)} className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all cursor-pointer">
                {Object.values(LeadStatus).map((s: LeadStatus): React.ReactElement => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="lead-source" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Source</label>
              <select id="lead-source" value={source} onChange={(e: ChangeEvent<HTMLSelectElement>): void => setSource(e.target.value as LeadSource)} className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all cursor-pointer">
                {Object.values(LeadSource).map((s: LeadSource): React.ReactElement => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#395886] hover:bg-[#395886]Hover disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm">
              {isSubmitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
              ) : (
                <>{isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{isEditMode ? "Save Changes" : "Create Lead"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormModal;
