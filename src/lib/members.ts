import { api } from "./api";

export type MemberApi = {
  id: number | string;
  username?: string;
  email?: string;
  role?: "member" | "moderator" | "owner";
  is_approved?: boolean;   // ← ensure this exists
  joined_at?: string;
};

// Normalize GET to always return an array
export async function listMembers(clubId: string | number): Promise<MemberApi[]> {
  const res = await api<MemberApi[] | { members: MemberApi[] }>(`/api/v1/clubs/${clubId}/members`);
  return Array.isArray(res) ? res : (res.members ?? []);
}

// Update a member (role / approval). Backend path: PUT /api/v1/clubs/:id/members/:user_id
export async function updateMember(
  clubId: string | number,
  userId: string | number,
  body: { role?: "member" | "moderator" | "owner"; is_approved?: boolean }
) {
  return api(`/api/v1/clubs/${clubId}/members/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// Remove a member. Backend path: DELETE /api/v1/clubs/:id/members/:user_id
export async function removeMember(clubId: string | number, userId: string | number) {
  return api(`/api/v1/clubs/${clubId}/members/${userId}`, { method: "DELETE" });
}
