import { api } from "./api";

export type Profile = {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role: string;
  avatar_url?: string;
  location?: string;
  favorite_genres?: string[];
  bio?: string;
  reading_goal: number;
  books_read: number;
  badges?: unknown;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
  updated_at?: string;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  role?: string;
  avatar_url?: string;
  location?: string;
  favorite_genres?: string[];
  bio?: string;
  reading_goal?: number;
};

export async function register(userData: RegisterData) {
  const { message, user } = await api<{ message: string; user: Profile }>(
    "/api/v1/auth/register",
    { method: "POST", body: JSON.stringify(userData) },
    { auth: false }
  );
  return { message, user };
}

export async function login(email: string, password: string) {
  // POST /api/v1/auth/login
  const { token, user } = await api<{ token: string; user: Profile }>(
    "/api/v1/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    { auth: false }
  );
  
  console.log("Login successful:", { userId: user.id, hasToken: !!token });
  
  localStorage.setItem("token", token);
  localStorage.setItem("userId", String(user.id));
  
  // Dispatch custom event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChange', { 
    detail: { authenticated: true, user } 
  }));
  
  return user;
}

export function logout() {
  console.log("Logging out user");
  
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  
  // Dispatch custom event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChange', { 
    detail: { authenticated: false } 
  }));
}
