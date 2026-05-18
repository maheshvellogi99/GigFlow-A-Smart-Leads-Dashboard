// ============================================================
// GigFlow Frontend — Authentication Context
// Manages user state, JWT persistence, login/register/logout.
// Register now accepts optional adminSecret for Admin role.
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { AxiosResponse, AxiosError } from "axios";
import api, { TOKEN_KEY } from "../services/api";
import {
  IUser,
  UserRole,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ApiErrorResponse,
} from "../types/index";

// ---- Constants ----

const USER_KEY: string = "gigflow_user";

// ---- Context State Interface ----

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ---- Context Value Interface (state + methods) ----

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole, adminSecret?: string) => Promise<void>;
  logout: () => void;
}

// ---- Create Context ----

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---- Provider Props ----

interface AuthProviderProps {
  children: ReactNode;
}

// ---- JWT Decode Helper ----

interface JwtPayloadDecoded {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

const decodeToken = (token: string): JwtPayloadDecoded | null => {
  try {
    const payloadSegment: string = token.split(".")[1];
    const decodedPayload: string = atob(payloadSegment);
    const parsed: JwtPayloadDecoded = JSON.parse(decodedPayload) as JwtPayloadDecoded;
    return parsed;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded: JwtPayloadDecoded | null = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const currentTimeInSeconds: number = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTimeInSeconds;
};

// ---- Provider Component ----

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect((): void => {
    const restoreSession = (): void => {
      try {
        const storedToken: string | null = localStorage.getItem(TOKEN_KEY);
        const storedUser: string | null = localStorage.getItem(USER_KEY);
        if (!storedToken || !storedUser) { setIsLoading(false); return; }
        if (isTokenExpired(storedToken)) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setIsLoading(false);
          return;
        }
        const parsedUser: IUser = JSON.parse(storedUser) as IUser;
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const persistAuth = useCallback((authToken: string, authUser: IUser): void => {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  }, []);

  const clearAuth = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const payload: LoginPayload = { email, password };
        const response: AxiosResponse<AuthResponse> = await api.post<AuthResponse>("/auth/login", payload);
        const { token: authToken, user: authUser }: AuthResponse = response.data;
        persistAuth(authToken, authUser);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const message: string = axiosError.response?.data?.message || "Login failed. Please try again.";
        throw new Error(message);
      }
    },
    [persistAuth]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role?: UserRole, adminSecret?: string): Promise<void> => {
      try {
        const payload: RegisterPayload = { name, email, password, role, adminSecret };
        const response: AxiosResponse<AuthResponse> = await api.post<AuthResponse>("/auth/register", payload);
        const { token: authToken, user: authUser }: AuthResponse = response.data;
        persistAuth(authToken, authUser);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const message: string = axiosError.response?.data?.message || "Registration failed. Please try again.";
        throw new Error(message);
      }
    },
    [persistAuth]
  );

  const logout = useCallback((): void => { clearAuth(); }, [clearAuth]);

  const isAuthenticated: boolean = !!token && !!user;

  const contextValue: AuthContextValue = useMemo(
    (): AuthContextValue => ({ user, token, isAuthenticated, isLoading, login, register, logout }),
    [user, token, isAuthenticated, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextValue => {
  const context: AuthContextValue | undefined = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
};

export { AuthProvider, useAuth };
export default AuthContext;
