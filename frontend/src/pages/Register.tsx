// ============================================================
// GigFlow Frontend — Register Page
// Admin Secret field appears when Admin role is selected.
// ============================================================

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, User, Mail, Lock, ShieldCheck, AlertCircle, Sun, Moon, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { UserRole } from "../types/index";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<UserRole>(UserRole.SalesUser);
  const [adminSecret, setAdminSecret] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isAdminRole: boolean = role === UserRole.Admin;

  React.useEffect((): void => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Clear admin secret when switching away from Admin
  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newRole: UserRole = e.target.value as UserRole;
    setRole(newRole);
    if (newRole !== UserRole.Admin) setAdminSecret("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (isAdminRole && !adminSecret.trim()) { setError("Admin Secret Key is required for Admin registration."); return; }

    try {
      setIsSubmitting(true);
      await register(name, email, password, role, isAdminRole ? adminSecret : undefined);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : "Registration failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#B1C9EF] dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
      <button type="button" onClick={toggleTheme} className="fixed top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition-all z-50" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}>
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/gigflow.png" alt="GigFlow Logo" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Get started with your GigFlow dashboard</p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-none transition-colors duration-300">
          {error && (
            <div className="flex items-start gap-3 p-3 mb-6 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input id="register-name" type="text" value={name} onChange={(e: ChangeEvent<HTMLInputElement>): void => setName(e.target.value)} placeholder="Mahesh Vellogi" autoComplete="name" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input id="register-email" type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input id="register-password" type="password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all" />
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="register-role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <select id="register-role" value={role} onChange={handleRoleChange} className="w-full appearance-none pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-btnHover/40 focus:border-[#395886] dark:focus:border-[#395886]Hover/50 transition-all cursor-pointer">
                  {Object.values(UserRole).map((r: UserRole): React.ReactElement => (<option key={r} value={r}>{r}</option>))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Admin Secret (conditional) */}
            {isAdminRole && (
              <div className="animate-in fade-in">
                <label htmlFor="register-admin-secret" className="block text-sm font-medium text-amber-700 dark:text-amber-400 mb-1.5">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <input
                    id="register-admin-secret"
                    type="password"
                    value={adminSecret}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => setAdminSecret(e.target.value)}
                    placeholder="Enter the admin secret key"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 bg-amber-50 dark:bg-amber-500/5 border border-amber-300 dark:border-amber-500/30 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-amber-400 dark:placeholder-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 dark:focus:border-amber-500/50 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400/70">
                  Contact your system administrator to obtain this key.
                </p>
              </div>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSubmitting ? (<><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account...</>) : (<><UserPlus className="w-4 h-4" />Create account</>)}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-500 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
