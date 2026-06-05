// Dummy authentication context.
// Replace the DUMMY_USERS array (or the login function) with a real backend later.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = {
  name: string;
  email: string;
  roomNo: string;
  hostel: string;
  studentId: string;
};

// 👉 Change these to add / edit demo accounts.
// Multiple dummy accounts so the student can quickly switch between profiles.
const DUMMY_USERS: Array<User & { password: string }> = [
  {
    email: "student@pats.edu",
    password: "canteen123",
    name: "Aarav Sharma",
    roomNo: "B-204",
    hostel: "Tagore Hostel",
    studentId: "PAT2026091",
  },
  {
    email: "priya@pats.edu",
    password: "canteen123",
    name: "Priya Iyer",
    roomNo: "A-112",
    hostel: "Nehru Hostel",
    studentId: "PAT2026102",
  },
  {
    email: "rahul@pats.edu",
    password: "canteen123",
    name: "Rahul Mehta",
    roomNo: "C-307",
    hostel: "Gandhi Hostel",
    studentId: "PAT2026133",
  },
  {
    email: "sara@pats.edu",
    password: "canteen123",
    name: "Sara Khan",
    roomNo: "D-021",
    hostel: "Bose Hostel",
    studentId: "PAT2026144",
  },
];

type AuthCtx = {
  user: User | null;
  // List of accounts available to switch into (passwords stripped).
  accounts: User[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (u: User & { password: string }) => { ok: boolean; error?: string };
  // Switch to another known dummy account without re-entering a password.
  switchAccount: (email: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const LS_KEY = "pats_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Expose the demo accounts (without passwords) for the account switcher UI.
  const [accounts, setAccounts] = useState<User[]>(
    () => DUMMY_USERS.map(({ password: _pw, ...safe }) => safe),
  );

  // Restore session from localStorage (kept lightweight on purpose)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Keep `accounts` in sync when register() pushes new users.
  const refreshAccounts = () =>
    setAccounts(DUMMY_USERS.map(({ password: _pw, ...safe }) => safe));

  const login: AuthCtx["login"] = (email, password) => {
    const found = DUMMY_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) return { ok: false, error: "Invalid email or password." };
    const { password: _pw, ...safe } = found;
    setUser(safe);
    localStorage.setItem(LS_KEY, JSON.stringify(safe));
    return { ok: true };
  };

  const register: AuthCtx["register"] = (u) => {
    // Demo only — push into the in-memory list and log in.
    if (DUMMY_USERS.some((x) => x.email === u.email))
      return { ok: false, error: "An account with this email already exists." };
    DUMMY_USERS.push(u);
    refreshAccounts();
    const { password: _pw, ...safe } = u;
    setUser(safe);
    localStorage.setItem(LS_KEY, JSON.stringify(safe));
    return { ok: true };
  };

  // Quick-switch helper — used by the in-app account switcher.
  // No password prompt: this is a demo convenience for browsing other profiles.
  const switchAccount: AuthCtx["switchAccount"] = (email) => {
    const found = DUMMY_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!found) return { ok: false, error: "Account not found." };
    const { password: _pw, ...safe } = found;
    setUser(safe);
    localStorage.setItem(LS_KEY, JSON.stringify(safe));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  };

  return (
    <Ctx.Provider value={{ user, accounts, login, register, switchAccount, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
