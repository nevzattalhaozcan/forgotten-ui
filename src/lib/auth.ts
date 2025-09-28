import { api } from "./api";

export type Profile = {
  id: string | number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export async function login(email: string, password: string) {
  // POST /api/v1/auth/login
  const { token, user } = await api<{ token: string; user: Profile }>(
    "/api/v1/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    { auth: false }
  );
  localStorage.setItem("token", token);
  localStorage.setItem("userId", String(user.id));
  return user;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
}
