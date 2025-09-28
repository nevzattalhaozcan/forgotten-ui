import { api } from "./api";

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role: string;
  avatar_url: string | null;
  location: string | null;
  favorite_genres: string[];
  bio: string | null;
  reading_goal: number;
  books_read: number;
  badges: string[] | null;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
  updated_at?: string;
};

export type ClubMember = {
  id: number;
  user_id: number;
  club_id: number;
  role: "club_admin" | "moderator" | "member";
  is_approved: boolean;
  joined_at: string;
  user: User;
};

export type NextMeeting = {
  date: string;
  location: string;
  topic: string;
};

export type ClubApi = {
  id: number;
  name: string;
  description: string;
  location: string | null;
  genre: string;
  cover_image_url: string | null;
  is_private: boolean;
  max_members: number;
  members_count: number;
  rating: number | null;
  ratings_count: number;
  tags: string[];
  owner_id: number;
  owner: User;
  next_meeting: NextMeeting | null;
  members: ClubMember[];
  created_at: string;
  updated_at: string;
  current_book?: {
    title?: string;
    author?: string;
    progress?: number;
  };
};

type ClubResponse = ClubApi | { club: ClubApi };

export async function getClub(id: string | number): Promise<ClubApi> {
  const res: ClubResponse = await api(`/api/v1/clubs/${id}`);
  return 'club' in res ? res.club : res;
}

type ClubsListResponse = ClubApi[] | { clubs?: ClubApi[] };

export async function listClubs(): Promise<ClubApi[]> {
  const res: ClubsListResponse = await api("/api/v1/clubs/");
  return Array.isArray(res) ? res : (res.clubs ?? []);
}

export async function joinClub(clubId: string | number): Promise<{ message: string }> {
  return await api<{ message: string }>(`/api/v1/clubs/${clubId}/join`, {
    method: "POST"
  });
}

export async function leaveClub(clubId: string | number): Promise<{ message: string }> {
  return await api<{ message: string }>(`/api/v1/clubs/${clubId}/leave`, {
    method: "POST"
  });
}