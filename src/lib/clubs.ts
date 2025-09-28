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
  const result = await api<{ message: string }>(`/api/v1/clubs/${clubId}/join`, {
    method: "POST"
  });
  
  // Store joined club ID locally for faster filtering
  const userId = localStorage.getItem("userId");
  if (userId) {
    const joinedClubs = getJoinedClubIds(userId);
    if (!joinedClubs.includes(Number(clubId))) {
      joinedClubs.push(Number(clubId));
      localStorage.setItem(`joinedClubs_${userId}`, JSON.stringify(joinedClubs));
    }
  }
  
  return result;
}

export async function leaveClub(clubId: string | number): Promise<{ message: string }> {
  const result = await api<{ message: string }>(`/api/v1/clubs/${clubId}/leave`, {
    method: "POST"
  });
  
  // Remove club ID from local storage
  const userId = localStorage.getItem("userId");
  if (userId) {
    const joinedClubs = getJoinedClubIds(userId);
    const updatedClubs = joinedClubs.filter(id => id !== Number(clubId));
    localStorage.setItem(`joinedClubs_${userId}`, JSON.stringify(updatedClubs));
  }
  
  return result;
}

// Helper function to get joined club IDs from localStorage
export function getJoinedClubIds(userId: string): number[] {
  try {
    const stored = localStorage.getItem(`joinedClubs_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Function to get user's clubs using local storage + API verification
export async function getUserClubs(): Promise<ClubApi[]> {
  const userId = localStorage.getItem("userId");
  if (!userId) return [];
  
  // Get potentially joined clubs from localStorage
  const joinedClubIds = getJoinedClubIds(userId);
  
  if (joinedClubIds.length === 0) {
    return [];
  }
  
  // Fetch detailed info for potentially joined clubs and verify membership
  const clubPromises = joinedClubIds.map(async (clubId) => {
    try {
      const club = await getClub(clubId);
      // Verify user is actually a member
      const isMember = club.members && club.members.some(member => 
        String(member.user_id) === String(userId)
      );
      return isMember ? club : null;
    } catch (error) {
      console.warn(`Failed to fetch club ${clubId}:`, error);
      return null;
    }
  });
  
  const clubs = await Promise.all(clubPromises);
  return clubs.filter((club): club is ClubApi => club !== null);
}