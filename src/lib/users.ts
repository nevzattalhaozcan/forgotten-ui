import { api } from "./api";

export type UserApi = {
  id: number | string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  location?: string;
  favorite_genres?: string[];
  bio?: string;
  reading_goal?: number;
  role?: string;
  // timestamps...
  created_at?: string;
  updated_at?: string;
};

// Accept both { user: {...} } and bare object
export async function getUser(id: string | number): Promise<UserApi> {
  const res = await api<UserApi | { user: UserApi }>(`/api/v1/users/${id}`);
  return (res as any).user ?? (res as UserApi);
}

export async function updateUser(id: string | number, patch: Partial<UserApi>): Promise<UserApi> {
  const res = await api<UserApi | { user: UserApi }>(`/api/v1/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return (res as any).user ?? (res as UserApi);
}
