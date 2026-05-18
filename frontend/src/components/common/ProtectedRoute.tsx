// ============================================================
// GigFlow Frontend — Protected Route Component
// Guards routes behind authentication and optional role checks.
// Light/dark mode support.
// ============================================================

import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/index";

// ---- Props Interface ----

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

// ---- Loading Spinner Component ----

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#B1C9EF] dark:bg-slate-950 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-[#2d466b] animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
};

// ---- Unauthorized View Component ----

interface UnauthorizedViewProps {
  userRole: UserRole;
  requiredRoles: UserRole[];
}

const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({ userRole, requiredRoles }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#B1C9EF] dark:bg-slate-950 transition-colors">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-1">
          Your role: <span className="text-[#395886] dark:text-[#395886] font-medium">{userRole}</span>
        </p>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Required: <span className="text-[#395886] dark:text-[#395886] font-medium">{requiredRoles.join(", ")}</span>
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-2.5 rounded-lg bg-[#395886] text-white text-sm font-medium hover:bg-[#395886]Hover transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
};

// ---- Protected Route Component ----

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <UnauthorizedView userRole={user.role} requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
